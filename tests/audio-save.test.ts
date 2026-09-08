import assert from "node:assert/strict";
import { test } from "node:test";
import { saveSoundWithAudio } from "../src/features/sounds/model/saveSoundWithAudio.ts";
import { getManagedSoundPath } from "../src/features/sounds/model/storagePath.ts";
import type { FormState } from "../src/features/sounds/model/formTypes.ts";

const form: FormState = {
  name: "Demo", description: "", type: "Greeting", ownerId: "owner", ownerType: "Company",
  isActive: true, moh: false, file: new File(["audio"], "test.wav"), audioUrl: "blob:preview",
};

test("replacement removes the old file only after a successful save", async () => {
  const events: string[] = [];
  await saveSoundWithAudio(form, "old", {
    upload: async () => { events.push("upload"); return "new"; },
    save: async payload => { assert.equal(payload.audioUrl, "new"); events.push("save"); },
    cleanup: async url => { events.push(`cleanup:${url}`); },
  });
  assert.deepEqual(events, ["upload", "save", "cleanup:old"]);
});

test("failed database save cleans up the new upload and retains old audio", async () => {
  const cleaned: string[] = [];
  await assert.rejects(saveSoundWithAudio(form, "old", {
    upload: async () => "new",
    save: async () => { throw new Error("Database unavailable"); },
    cleanup: async url => { cleaned.push(url); },
  }), /Database unavailable/);
  assert.deepEqual(cleaned, ["new"]);
});

test("cleanup failure after saving returns a warning instead of reporting save failure", async () => {
  const warning = await saveSoundWithAudio(form, "old", {
    upload: async () => "new",
    save: async () => undefined,
    cleanup: async () => { throw new Error("Denied"); },
  });
  assert.match(warning ?? "", /Sound saved/);
});

test("upload failure does not save a record or remove old audio", async () => {
  await assert.rejects(saveSoundWithAudio(form, "old", {
    upload: async () => { throw new Error("Upload failed"); },
    save: async () => assert.fail("must not save"),
    cleanup: async () => assert.fail("must not clean up"),
  }), /Upload failed/);
});

test("storage cleanup only accepts managed filenames on the configured project", () => {
  const project = "https://demo.supabase.co";
  const name = "12345678-1234-1234-1234-123456789abc.wav";
  assert.equal(getManagedSoundPath(`${project}/storage/v1/object/public/sounds/${name}`, project), name);
  assert.equal(getManagedSoundPath(`https://other.supabase.co/storage/v1/object/public/sounds/${name}`, project), undefined);
  assert.equal(getManagedSoundPath(`${project}/storage/v1/object/public/other/${name}`, project), undefined);
  assert.equal(getManagedSoundPath(`${project}/storage/v1/object/public/sounds/legacy.wav`, project), undefined);
  assert.equal(getManagedSoundPath("blob:preview", project), undefined);
});
