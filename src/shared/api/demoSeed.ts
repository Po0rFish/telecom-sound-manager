import type { Owner } from "../../features/owners/model/types";
import type { Sound } from "../../features/sounds/model/types";

// Fictional fixtures. Audio is generated here, without network requests or licensed assets.
export const demoOwners: Owner[] = [
  { id: "demo-user", name: "Demo Support", type: "User", extension: "101" },
  { id: "demo-company", name: "Example Telecom", type: "Company" },
  { id: "demo-queue", name: "Support Queue", type: "Queue", extension: "200" },
  { id: "demo-department", name: "Customer Care", type: "Department" },
];

export const demoSounds: Sound[] = [
  { id: "demo-voicemail", name: "Support Voicemail", description: "Synthetic tone for exploring audio playback.", type: "Voicemail", ownerId: "demo-user", ownerType: "User", audioUrl: "demo-audio:sample", fileName: "demo-tone.wav", format: "wav", durationSec: 2, isActive: true, moh: false, dialCode: "*72*1001", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "demo-greeting", name: "Company Greeting", description: "Replace this sample with your own greeting.", type: "Greeting", ownerId: "demo-company", ownerType: "Company", audioUrl: "demo-audio:sample", fileName: "demo-tone.wav", format: "wav", durationSec: 2, isActive: true, moh: false, dialCode: "*72*1002", createdAt: "2026-01-02T00:00:00.000Z" },
  { id: "demo-queue-message", name: "Queue Message", description: "An inactive draft waiting for audio.", type: "Queue", ownerId: "demo-queue", ownerType: "Queue", isActive: false, moh: false, dialCode: "*72*1003", createdAt: "2026-01-03T00:00:00.000Z" },
];

export function createDemoAudio(): Blob {
  const samples = 16000;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const text = (offset: number, value: string) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  text(0, "RIFF"); view.setUint32(4, buffer.byteLength - 8, true); text(8, "WAVEfmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true); view.setUint32(28, 16000, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, "data"); view.setUint32(40, samples * 2, true);
  for (let i = 0; i < samples; i++) {
    const envelope = Math.min(i / 400, (samples - i) / 400, 1);
    view.setInt16(44 + i * 2, Math.sin(2 * Math.PI * 440 * i / 8000) * 3000 * envelope, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}
