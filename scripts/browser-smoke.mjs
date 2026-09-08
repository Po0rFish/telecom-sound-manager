import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// Uses an installed Chromium browser; no application/test dependencies are downloaded.
// All external requests are intercepted. Fixtures never modify the remote database.
const browserPath = process.env.BROWSER_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = await mkdtemp(join(tmpdir(), "sound-manager-browser-"));
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "4178", "--strictPort"], { windowsHide: true, stdio: "ignore" });
const browser = spawn(browserPath, ["--headless=new", "--no-first-run", "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket;
const pending = new Map();
let nextId = 0;
const failures = [];
const owner = { id: "demo-owner", name: "Demo Support", type: "User", extension: "101", created_at: "2026-01-01" };
const baseSound = { name: "Support Voicemail", description: "Sample recording", type: "Voicemail", owner_id: owner.id, owner_type: "User", file_name: "sample.wav", format: "wav", is_active: true, moh: false, created_at: "2026-01-01" };
const sounds = [
  { ...baseSound, id: "demo-sound", audio_url: "https://audio.example/sample.wav" },
  { ...baseSound, id: "second-sound", name: "Second Recording", audio_url: "https://audio.example/second.wav" },
];
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
      if (url.hostname === "127.0.0.1") { await send("Fetch.continueRequest", { requestId }); return; }
      let body = "[]";
      let responseCode = 200;
      let contentType = "application/json";
      if (url.pathname.endsWith("/owners")) body = JSON.stringify([owner]);
      else if (url.pathname.endsWith("/sounds")) {
        const id = url.searchParams.get("id")?.replace("eq.", "");
        let record = sounds.find(sound => sound.id === id);
        if (request.method === "POST") {
          record = { ...baseSound, ...JSON.parse(request.postData), id: "created-sound" };
          sounds.push(record);
        }
        if (request.method === "PATCH" && record) Object.assign(record, JSON.parse(request.postData));
        if (request.method === "DELETE" && record) sounds.splice(sounds.indexOf(record), 1);
        if (id && !record) { responseCode = 406; body = JSON.stringify({ message: "Sound not found" }); }
        else body = JSON.stringify(id || request.method === "POST" ? record : sounds);
      } else if (url.pathname.startsWith("/storage/v1/object/public/sounds/") || url.hostname === "audio.example") { body = wav; contentType = "audio/wav"; }
      else if (url.pathname.startsWith("/storage/v1/object/sounds")) body = JSON.stringify({ Key: url.pathname, Id: "uploaded" });
      else { responseCode = 404; }
      if (request.method === "OPTIONS") { responseCode = 200; body = ""; }
      await send("Fetch.fulfillRequest", { requestId, responseCode, responseHeaders: [
        { name: "Content-Type", value: contentType }, { name: "Access-Control-Allow-Origin", value: "*" },
        { name: "Access-Control-Allow-Headers", value: Object.entries(request.headers).find(([name]) => name.toLowerCase() === "access-control-request-headers")?.[1] || "apikey,authorization,x-client-info,content-type,prefer,accept-profile,content-profile,range,x-upsert,cache-control" },
        { name: "Access-Control-Allow-Methods", value: "GET,HEAD,POST,PATCH,DELETE,OPTIONS" },
        { name: "Content-Range", value: "*/0" }, { name: "Access-Control-Expose-Headers", value: "Content-Range" },
      ], body: Buffer.from(body).toString("base64") });
    }
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate("/dashboard", "All owners have their required audio ready");
  await screenshot("dashboard");
  await navigate("/sounds", "Support Voicemail");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 2);
  assert.equal(await evaluate("(async () => { const [a,b] = document.querySelectorAll('audio'); await a.play(); await b.play(); return a.paused && !b.paused; })()"), true);
  await evaluate("document.querySelectorAll('audio')[1].pause()");
  await screenshot("sounds");
  await navigate("/sounds/new?ownerId=demo-owner&type=Voicemail", "Create Sound");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 0);
  await evaluate("document.querySelector('form').requestSubmit()");
  await until(() => evaluate("document.body.innerText.includes('Name is required')"), "form validation");
  await evaluate("(() => { const input = document.querySelector('input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Created Demo'); input.dispatchEvent(new Event('input', { bubbles: true })); })()");
  const fixtureFile = join(profile, "sample.wav");
  await writeFile(fixtureFile, wav);
  const documentNode = await send("DOM.getDocument");
  const fileInput = await send("DOM.querySelector", { nodeId: documentNode.root.nodeId, selector: "input[type=file]" });
  await send("DOM.setFileInputFiles", { nodeId: fileInput.nodeId, files: [fixtureFile] });
  await until(() => evaluate("document.querySelectorAll('audio').length === 1"), "upload preview");
  await evaluate("document.querySelector('form').requestSubmit()");
  await until(() => evaluate("location.pathname === '/sounds' && document.body.innerText.includes('Created Demo')"), "create with audio");
  assert.ok(sounds.find(sound => sound.id === "created-sound")?.audio_url);
  await navigate("/sounds/created-sound", "Edit Sound");
  const previousAudio = sounds.find(sound => sound.id === "created-sound").audio_url;
  const editDocument = await send("DOM.getDocument");
  const editFileInput = await send("DOM.querySelector", { nodeId: editDocument.root.nodeId, selector: "input[type=file]" });
  await send("DOM.setFileInputFiles", { nodeId: editFileInput.nodeId, files: [fixtureFile] });
  await until(() => evaluate("document.body.innerText.includes('New file selected')"), "replacement preview");
  await evaluate("(() => { const input = document.querySelector('input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Updated Demo'); input.dispatchEvent(new Event('input', { bubbles: true })); })()");
  await evaluate("document.querySelector('form').requestSubmit()");
  await until(() => evaluate("location.pathname === '/sounds' && document.body.innerText.includes('Updated Demo')"), "edit");
  assert.notEqual(sounds.find(sound => sound.id === "created-sound").audio_url, previousAudio);
  await navigate("/sounds/created-sound", "Edit Sound");
  await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Remove').click()");
  await until(() => evaluate("document.querySelectorAll('audio').length === 0"), "remove preview");
  await evaluate("document.querySelector('form').requestSubmit()");
  await until(() => evaluate("location.pathname === '/sounds' && document.body.innerText.includes('Updated Demo')"), "save without audio");
  assert.equal(sounds.find(sound => sound.id === "created-sound").audio_url, null);
  assert.equal(sounds.find(sound => sound.id === "created-sound").is_active, false);
  await evaluate("document.querySelector('[aria-label=\"Delete Updated Demo\"]').click()");
  await evaluate("Array.from(document.querySelectorAll('[role=dialog] button')).find(button => button.textContent === 'Delete').click()");
  await until(() => evaluate("!document.body.innerText.includes('Updated Demo') && !document.querySelector('[role=dialog]')"), "delete");
  assert.equal(sounds.some(sound => sound.id === "created-sound"), false);
  await navigate("/sounds/demo-sound", "Edit Sound");
  assert.equal(await evaluate("document.querySelectorAll('audio').length"), 1);
  await screenshot("edit-sound");
  await navigate("/sounds/missing", "Sound not found");
  await navigate("/owners", "Demo Support");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  for (const [path, text] of [["/dashboard", "All owners"], ["/sounds", "Support Voicemail"], ["/sounds/new", "Create Sound"], ["/owners", "Demo Support"]]) {
    await navigate(path, text);
    assert.equal(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), true, `Horizontal overflow: ${path}`);
  }
  await screenshot("owners-mobile");
  assert.deepEqual(failures, []);
  console.log("Browser smoke passed: dashboard, list, validation, upload/create, replace/remove audio, edit/delete, missing record, owners, exclusive playback, mobile overflow (mock API).");
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
