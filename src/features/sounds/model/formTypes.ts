import type { OwnerType } from "../../owners/model/types";
import type { AudioFormat, SoundType } from "./types";

export interface FormState {
  name: string;
  description: string;
  type: SoundType | "";
  ownerId: string;
  ownerType: OwnerType | "";

  file?: File;
  fileName?: string;
  audioUrl?: string;

  durationSec?: number;
  format?: AudioFormat;

  isActive: boolean;
  moh: boolean;

  removeAudio?: boolean;
}

export interface SoundFormPayload {
  name: string;
  description: string;
  type: SoundType;
  ownerId: string;
  ownerType: OwnerType;

  fileName?: string;
  audioUrl?: string;

  durationSec?: number;
  format?: AudioFormat;

  isActive: boolean;
  moh: boolean;
}