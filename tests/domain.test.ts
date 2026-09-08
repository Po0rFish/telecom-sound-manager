import assert from "node:assert/strict";
import { test } from "node:test";
import { getDashboardStats } from "../src/features/dashboard/model/dashboardStats.ts";
import { getOwnerSetupChecklist } from "../src/features/owners/model/ownerSetup.ts";
import { mapSoundFormToPayload, mapSoundPayloadToRow } from "../src/features/sounds/model/mappers.ts";
import { validateSoundFile } from "../src/features/sounds/model/sound.validation.ts";
import type { Owner } from "../src/features/owners/model/types.ts";
import type { Sound } from "../src/features/sounds/model/types.ts";

const owner: Owner = { id: "owner", name: "Demo user", type: "User" };
const sound: Sound = {
  id: "sound", name: "Greeting", description: "", type: "Voicemail",
  ownerId: owner.id, ownerType: owner.type, audioUrl: "https://example.com/audio.wav",
  fileName: "audio.wav", format: "wav", isActive: true, moh: false, createdAt: "2026-01-01",
};

test("empty dashboard does not invent configured owners", () => {
  const stats = getDashboardStats([], []);
  assert.equal(stats.totalSounds, 0);
  assert.equal(stats.complete, 0);
  assert.deepEqual(stats.incomplete, []);
});

test("configuration requires active audio, scoped to its owner", () => {
  const other: Owner = { ...owner, id: "other" };
  const stats = getDashboardStats([owner, other], [sound]);
  assert.equal(stats.complete, 1);
  assert.equal(stats.configuredByType.User, 1);
  assert.equal(stats.incomplete[0].owner.id, "other");
  assert.equal(stats.withAudio, 1);
  assert.equal(getDashboardStats([owner], [{ ...sound, isActive: false }]).complete, 0);
  assert.equal(getDashboardStats([owner], [{ ...sound, audioUrl: undefined }]).complete, 0);
});

test("ready duplicate satisfies required setup even when another recording lacks audio", () => {
  const checklist = getOwnerSetupChecklist(owner, [{ ...sound, id: "draft", audioUrl: undefined }, sound]);
  assert.equal(checklist[0].status, "Ready");
  assert.equal(checklist[0].soundId, sound.id);
});

test("editing metadata preserves existing audio and active status", () => {
  const payload = mapSoundFormToPayload(sound);
  assert.equal(payload.audioUrl, sound.audioUrl);
  assert.equal(payload.fileName, sound.fileName);
  assert.equal(payload.isActive, true);
});

test("removing audio clears database metadata and deactivates the record", () => {
  const row = mapSoundPayloadToRow(mapSoundFormToPayload({ ...sound, removeAudio: true }));
  assert.equal(row.audio_url, null);
  assert.equal(row.file_name, null);
  assert.equal(row.format, null);
  assert.equal(row.is_active, false);
});

test("file validation rejects empty, oversized and unsupported files", () => {
  assert.equal(validateSoundFile(new File([], "empty.wav")).isValid, false);
  assert.equal(validateSoundFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.wav")).isValid, false);
  assert.equal(validateSoundFile(new File(["x"], "file.exe")).isValid, false);
  assert.deepEqual(validateSoundFile(new File(["x"], "file.WAV")), { isValid: true, extension: "wav" });
});
