import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// Uses an installed Chromium browser; no application/test dependencies are downloaded.
// External requests fail the test. Exercises real IndexedDB in an isolated browser profile.
const browserPath = process.env.BROWSER_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = await mkdtemp(join(tmpdir(), "sound-manager-browser-"));
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "4178", "--strictPort"], { windowsHide: true, stdio: "ignore" });
const browser = spawn(browserPath, ["--headless=new", "--no-first-run", "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket;
const pending = new Map();
let nextId = 0;
const failures = [];
const wav = Buffer.alloc(44 + 16000);
wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write("data", 36); wav.writeUInt32LE(16000, 40);

function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolveCall, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 10000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolveCall(value); }, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function until(predicate, label) {
  for (let i = 0; i < 100; i++) { if (await predicate()) return; await delay(100); }
  throw new Error(`Timed out waiting for ${label}`);
}
async function navigate(path, expected) {
  await send("Page.navigate", { url: `http://127.0.0.1:4178${path}` });
  await until(async () => {
    try { return await evaluate(`document.body?.innerText.includes(${JSON.stringify(expected)}) ?? false`); }
    catch { return false; }
  }, path);
}
async function screenshot(name) {
  await mkdir("docs/screenshots", { recursive: true });
  const result = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(resolve(`docs/screenshots/${name}.png`), Buffer.from(result.data, "base64"));
}

try {
  await until(async () => { try { return (await fetch("http://127.0.0.1:4178")).ok; } catch { return false; } }, "preview server");
  let port;
  await until(async () => { try { port = (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]; return Boolean(port); } catch { return false; } }, "browser");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(targets.find(target => target.type === "page").webSocketDebuggerUrl);
  await new Promise(resolveOpen => socket.addEventListener("open", resolveOpen, { once: true }));
  socket.addEventListener("message", async event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const callback = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) callback?.reject(new Error(message.error.message));
      else callback?.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") failures.push(message.params.exceptionDetails.text);
    if (message.method === "Fetch.requestPaused") {
      const { requestId, request } = message.params;
      const url = new URL(request.url);
      if (url.hostname === "127.0.0.1" || url.protocol === "blob:" || url.protocol === "data:") {
        await send("Fetch.continueRequest", { requestId });
      } else {
        failures.push(`Unexpected external request: ${url.origin}`);
        await send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" });
      }
    }
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate("/dashboard", "Missing audio");
  await screenshot("dashboard");
  await navigate("/sounds", "Support Voicemail");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 2);
  assert.equal(await evaluate("(async () => { const [a,b] = document.querySelectorAll('audio'); await a.play(); await b.play(); return a.paused && !b.paused; })()"), true);
  await evaluate("document.querySelectorAll('audio')[1].pause()");
  await screenshot("sounds");

  await evaluate(`document.querySelector('[aria-label="Switch to grid view"]').click()`);
  await until(() => evaluate(`Boolean(document.querySelector('[aria-label="Switch to list view"]'))`), "grid view");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 2);
  assert.equal(await evaluate("(async () => { const [a,b] = document.querySelectorAll('audio'); await a.play(); await b.play(); return a.paused && !b.paused; })()"), true);
  await evaluate("document.querySelectorAll('audio')[1].pause()");
  await screenshot("sounds-grid");
  await evaluate(`document.querySelector('[aria-label="Switch to list view"]').click()`);
  await until(() => evaluate(`Boolean(document.querySelector('[aria-label="Switch to grid view"]'))`), "list view");

  // Create with a real file, then reload to verify metadata AND Blob persistence.
  await navigate("/sounds/new?ownerId=demo-user&type=Voicemail", "Create Sound");
  await evaluate("document.querySelector('form').requestSubmit()");
  assert.equal(await evaluate("location.pathname"), "/sounds/new", "Invalid form must not save");
  await evaluate(`(() => { const input = document.querySelector('form input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Created in browser'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  const fixtureFile = join(profile, "sample.wav");
  await writeFile(fixtureFile, wav);
  const documentNode = await send("DOM.getDocument");
  const fileInput = await send("DOM.querySelector", { nodeId: documentNode.root.nodeId, selector: "input[type=file]" });
  await send("DOM.setFileInputFiles", { nodeId: fileInput.nodeId, files: [fixtureFile] });
  await until(() => evaluate("document.querySelectorAll('audio').length === 1"), "local preview");
  await evaluate("document.querySelector('form').requestSubmit()");
  await until(() => evaluate("location.pathname === '/sounds'"), "create saved");
  await navigate("/sounds", "Created in browser");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 3);
  await evaluate(`document.querySelector('[aria-label="Edit Created in browser"]').click()`);
  await until(() => evaluate("document.body.innerText.includes('Edit Sound')"), "edit created sound");
  const createdPath = await evaluate("location.pathname");
  assert.equal(await evaluate("(async () => { const audio = document.querySelector('audio'); await audio.play(); audio.pause(); return audio.duration > 0; })()"), true);
  // Metadata-only edit must retain usable audio after the form unmounts.
  await evaluate(`(() => { const input = document.querySelector('form input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Edited in browser'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await evaluate("document.querySelector('form').requestSubmit()");
  await until(() => evaluate("location.pathname === '/sounds' && document.body.innerText.includes('Edited in browser')"), "edit saved");
  assert.equal(await evaluate("(async () => { const audio = document.querySelector('[aria-label=\"Preview Edited in browser\"]'); await audio.play(); audio.pause(); return true; })()"), true);
  await navigate(createdPath, "Edit Sound");
  await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Remove').click()");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 0);
  await evaluate("document.querySelector('form').requestSubmit()");
  await until(() => evaluate("location.pathname === '/sounds'"), "audio removal saved");
  await navigate(createdPath, "Edit Sound");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 0);
  await navigate("/sounds", "Edited in browser");
  await evaluate(`document.querySelector('[aria-label="Delete Edited in browser"]').click()`);
  await evaluate("Array.from(document.querySelectorAll('[role=dialog] button')).find(button => button.textContent === 'Delete').click()");
  await until(() => evaluate("!document.body.innerText.includes('Edited in browser')"), "deleted");
  await navigate(createdPath, "Sound not found");
  await navigate("/sounds/demo-voicemail", "Edit Sound");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 1);
  await screenshot("edit-sound");
  await navigate("/sounds", "Support Voicemail");
  await evaluate(`document.querySelector('[aria-label="Delete Support Voicemail"]').click()`);
  await evaluate("Array.from(document.querySelectorAll('[role=dialog] button')).find(button => button.textContent === 'Delete').click()");
  await until(() => evaluate("!document.body.innerText.includes('Support Voicemail')"), "seed deleted");
  // Shared sample audio must survive deletion of one reference.
  assert.equal(await evaluate("(async () => { const audio = document.querySelector('audio'); await audio.play(); audio.pause(); return true; })()"), true);
  // Replace the remaining sample with an uploaded Blob before reset.
  await navigate("/sounds/demo-greeting", "Edit Sound");
  const replacementDocument = await send("DOM.getDocument");
  const replacementInput = await send("DOM.querySelector", { nodeId: replacementDocument.root.nodeId, selector: "input[type=file]" });
  await send("DOM.setFileInputFiles", { nodeId: replacementInput.nodeId, files: [fixtureFile] });
  await until(() => evaluate("document.body.innerText.includes('sample.wav')"), "replacement selected");
  await evaluate("document.querySelector('form').requestSubmit()");
  await until(() => evaluate("location.pathname === '/sounds'"), "replacement saved");
  await navigate("/sounds/demo-greeting", "Edit Sound");
  assert.equal(await evaluate("(async () => { const audio = document.querySelector('audio'); await audio.play(); audio.pause(); return audio.duration; })()"), 1);
  await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Reset Demo').click()");
  await evaluate("Array.from(document.querySelectorAll('[role=dialog] button')).find(button => button.textContent === 'Reset Demo').click()");
  await until(async () => { try { return await evaluate("document.body.innerText.includes('Support Voicemail') && !document.querySelector('[role=dialog]')"); } catch { return false; } }, "reset restored seed");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 2);
  assert.deepEqual(await evaluate(`new Promise((resolve, reject) => {
    const opening = indexedDB.open('telecom-sound-manager-demo', 1);
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      const db = opening.result;
      const tx = db.transaction(['sounds', 'audio'], 'readonly');
      const sounds = tx.objectStore('sounds').getAll();
      const audio = tx.objectStore('audio').getAllKeys();
      tx.oncomplete = () => { resolve({ sounds: sounds.result.length, audio: audio.result }); db.close(); };
    };
  })`), { sounds: 3, audio: ['demo-audio:sample'] }, "Reset removes uploaded Blobs and restores exactly the seed");
  await navigate("/sounds/missing", "Sound not found");
  await navigate("/owners", "Demo Support");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  for (const [path, text] of [["/dashboard", "Missing audio"], ["/sounds", "Support Voicemail"], ["/sounds/new", "Create Sound"], ["/owners", "Demo Support"]]) {
    await navigate(path, text);
    assert.equal(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), true, `Horizontal overflow: ${path}`);
    if (path === "/sounds") {
      await evaluate(`document.querySelector('[aria-label="Switch to grid view"]').click()`);
      await until(() => evaluate(`Boolean(document.querySelector('[aria-label="Switch to list view"]'))`), "mobile grid view");
      assert.equal(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), true, "Horizontal overflow: mobile grid");
      await screenshot("sounds-grid-mobile");
    }
  }
  await screenshot("owners-mobile");
  assert.deepEqual(failures, []);
  console.log("Browser smoke passed: real IndexedDB CRUD, Blob persistence after reload, playback, audio removal, shared-file cleanup, reset, dashboard, list/grid, mobile layouts, and zero external requests.");
} catch (error) {
  if (socket?.readyState === WebSocket.OPEN) {
    console.error(await evaluate("document.body.innerText"));
    await screenshot("smoke-failure");
  }
  throw error;
} finally {
  socket?.close();
  browser.kill();
  server.kill();
}
