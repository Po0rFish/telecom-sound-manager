import type { OwnerType } from "../../owners/model/types";
import type { AudioFormat, SoundType } from "./types";


export interface SoundRow {
  id: string;
  name: string;
  description: string;
  type: SoundType;
  owner_id: string;
  owner_type: OwnerType;
  file_name: string | null;
  audio_url: string | null;
  duration_sec: number | null;
  format: AudioFormat | null;
  dial_code: string | null;
  is_active: boolean;
  moh: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface SoundPayloadRow {
  name: string;
  description: string;
  type: SoundType;
  owner_id: string;
  owner_type: OwnerType;
  file_name: string | null;
  audio_url: string | null;
  duration_sec: number | null;
  format: AudioFormat | null;
  is_active: boolean;
  moh: boolean;
  dial_code?: string;
}