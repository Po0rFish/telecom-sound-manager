import type { FormState } from "./formTypes";
import type { AudioFormat, SoundType } from "./types";



export const soundTypes: SoundType[] = [
  "Greeting",
  "IVR",
  "Queue",
  "MusicOnHold",
  "Voicemail",
  "Announcement",
];

export const soundTypeOptions: Array<{
  value: SoundType | "";
  label: string;
}> = [
    { value: "", label: "All types" },
    { value: "Greeting", label: "Greeting" },
    { value: "IVR", label: "IVR" },
    { value: "Queue", label: "Queue" },
    { value: "MusicOnHold", label: "Music On Hold" },
    { value: "Voicemail", label: "Voicemail" },
    { value: "Announcement", label: "Announcement" },
  ];

export const emptyAudioState: Partial<FormState> = {
  file: undefined,
  fileName: undefined,
  audioUrl: undefined,
  durationSec: undefined,
  format: undefined,
  isActive: false,
  removeAudio: true,
};

export const allowedAudioFormats: AudioFormat[] = ["mp3", "wav", "ogg"];

export const maxAudioFileSizeMb = 5;

export const maxAudioFileSizeBytes = maxAudioFileSizeMb * 1024 * 1024;

export const soundNamePattern = /^[\w -]+$/;