import assert from "node:assert/strict";
import { test } from "node:test";
import { createDemoFetch, DEMO_MESSAGE } from "../src/shared/api/demoMode.ts";

test("demo blocks database, RPC and Storage writes without sending a request", async () => {
  let calls = 0;
  const guarded = createDemoFetch(async () => { calls++; return new Response("ok"); });
  for (const path of ["rest/v1/sounds", "rest/v1/rpc/action", "storage/v1/object/sounds/test.wav"]) {
    for (const method of ["POST", "PATCH", "PUT", "DELETE"]) {
      const response = await guarded(`https://demo.example/${path}`, { method });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).message, DEMO_MESSAGE);
    }
  }
  assert.equal((await guarded(new Request("https://demo.example", { method: "POST" }))).status, 403);
  assert.equal(calls, 0);
});

test("demo forwards reads and honors the effective Request method", async () => {
  const calls: unknown[][] = [];
  const guarded = createDemoFetch(async (...args) => { calls.push(args); return new Response("ok"); });
  await guarded("https://demo.example");
  await guarded("https://demo.example", { method: "HEAD" });
  await guarded(new Request("https://demo.example", { method: "POST" }), { method: "GET" });
  assert.equal(calls.length, 3);
  await guarded(new Request("https://demo.example"), { method: "DELETE" });
  assert.equal(calls.length, 3);
});
