import type {
  Sound,
  SoundType,
} from "./types";
import type { OwnerType, Owner } from "../../owners/model/types";
import type { FormState, SoundFormPayload } from "./formTypes";
import type { OwnerRow } from "../../owners/model/dbTypes";
import type { SoundPayloadRow, SoundRow } from "./dbTypes";

const nullableToUndefined = <T>(value: T | null): T | undefined => {
  return value ?? undefined;
};

export const mapOwner = (row: OwnerRow): Owner => ({
  id: row.id,
  name: row.name,
  type: row.type,
  extension: nullableToUndefined(row.extension),
});

export const mapSound = (row: SoundRow): Sound => ({
  id: row.id,
  name: row.name,
  description: row.description,
  type: row.type,

  ownerId: row.owner_id,

  // helper metadata / fallback value
  ownerType: row.owner_type,

  fileName: nullableToUndefined(row.file_name),
  audioUrl: nullableToUndefined(row.audio_url),
  durationSec: nullableToUndefined(row.duration_sec),
  format: nullableToUndefined(row.format),
  dialCode: nullableToUndefined(row.dial_code),

  isActive: row.is_active,
  moh: row.moh,

  createdAt: row.created_at,
  updatedAt: nullableToUndefined(row.updated_at),
});

export const mapSoundFormToPayload = (
  form: FormState,
  uploadedAudioUrl?: string
): SoundFormPayload => {
  const audioUrl = uploadedAudioUrl ?? form.audioUrl;
  const hasAudio = Boolean(uploadedAudioUrl);

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    type: form.type as SoundType,
    ownerId: form.ownerId,

    // helper metadata, auto-filled from selected owner
    ownerType: form.ownerType as OwnerType,

    fileName: hasAudio ? form.fileName : undefined,
    audioUrl,
    durationSec: hasAudio ? form.durationSec : undefined,
    format: hasAudio ? form.format : undefined,

    // business rule: sound without audio cannot be active
    isActive: hasAudio ? form.isActive : false,
    moh: form.moh,
  };
};

const generateDialCode = () => {
  const pin = Math.floor(1000 + Math.random() * 9000);

  return `*72*${pin}`;
};
export const mapSoundPayloadToRow = (
  payload: SoundFormPayload,
  options?: {
    includeDialCode?: boolean;
  }
): SoundPayloadRow => {
  const row: SoundPayloadRow = {
    name: payload.name,
    description: payload.description,
    type: payload.type,
    owner_id: payload.ownerId,
    owner_type: payload.ownerType,

    file_name: payload.fileName ?? null,
    audio_url: payload.audioUrl ?? null,
    duration_sec: payload.durationSec ?? null,
    format: payload.format ?? null,

    is_active: payload.isActive,
    moh: payload.moh,
  };

  if (options?.includeDialCode) {
    row.dial_code = generateDialCode();
  }

  return row;
};

export const mapSoundToFormState = (sound: Sound): FormState => ({
  name: sound.name,
  description: sound.description,
  type: sound.type,
  ownerId: sound.ownerId,
  ownerType: sound.ownerType,

  fileName: sound.fileName,
  audioUrl: sound.audioUrl,
  durationSec: sound.durationSec,
  format: sound.format,

  isActive: sound.isActive,
  moh: sound.moh,

  removeAudio: false,
});