import type { AudioFormat } from "./types";
import {
  allowedAudioFormats,
  maxAudioFileSizeBytes,
  maxAudioFileSizeMb,
  soundNamePattern,
} from "./sound.constants";
import type { FormState } from "./formTypes";

export interface SoundFormErrors {
  name: string;
  type: string;
  owner: string;
}

export type FileValidationResult =
  | { isValid: true; extension: AudioFormat }
  | { isValid: false; error: string };

export const validateSoundForm = (
  form: FormState,
  submitted: boolean
): SoundFormErrors => {
  if (!submitted) {
    return { name: "", type: "", owner: "" };
  }

  const name = form.name.trim();

  let nameError = "";

  if (!name) {
    nameError = "Name is required";
  } else if (name.length < 3) {
    nameError = "Name must be at least 3 characters";
  } else if (!soundNamePattern.test(name)) {
    nameError = "Do not use special characters";
  }

  return {
    name: nameError,
    type: !form.type ? "Sound type is required" : "",
    owner: !form.ownerId ? "Owner is required" : "",
  };
};
export const hasSoundFormErrors = (errors: SoundFormErrors) =>
  Boolean(errors.name || errors.type || errors.owner);

export const validateSoundFile = (file: File): FileValidationResult => {
  if (file.size === 0) {
    return { isValid: false, error: "File is empty" };
  }

  if (file.size > maxAudioFileSizeBytes) {
    return {
      isValid: false,
      error: `File is too large (max ${maxAudioFileSizeMb}MB)`,
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!allowedAudioFormats.includes(extension as AudioFormat)) {
    return { isValid: false, error: "Unsupported file format" };
  }

  return { isValid: true, extension: extension as AudioFormat };
};