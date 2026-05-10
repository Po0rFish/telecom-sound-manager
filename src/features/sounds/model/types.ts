import type {  OwnerType } from "../../owners/model/types";

export interface Sound {
  id: string;
  name: string;
  description: string;
  type: SoundType;
  ownerId: string;
  ownerType: OwnerType;
  fileName?: string;
  audioUrl?: string;
  durationSec?: number;
  format?: AudioFormat;
  dialCode?: string;
  isActive: boolean;
  moh: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type SoundType =
  | "Greeting"
  | "IVR"
  | "Queue"
  | "MusicOnHold"
  | "Voicemail"
  | "Announcement";

export type AudioFormat = "mp3" | "wav" | "ogg";


