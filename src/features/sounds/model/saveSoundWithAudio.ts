import type { FormState, SoundFormPayload } from "./formTypes";
import { mapSoundFormToPayload } from "./mappers.ts";

interface Dependencies {
  upload: (file: File) => Promise<string>;
  cleanup: (url: string) => Promise<void>;
  save: (payload: SoundFormPayload) => Promise<unknown>;
}

// Storage and database writes are separate operations. Cleanup must check references.
export async function saveSoundWithAudio(form: FormState, originalUrl: string | undefined, dependencies: Dependencies) {
  let uploadedUrl: string | undefined;
  try {
    if (form.file && !form.removeAudio) uploadedUrl = await dependencies.upload(form.file);
    await dependencies.save(mapSoundFormToPayload(form, uploadedUrl));
  } catch (error) {
    if (uploadedUrl) {
      try {
        await dependencies.cleanup(uploadedUrl);
      } catch {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`${message}. The uploaded file could not be cleaned up; check Storage before retrying.`);
      }
    }
    throw error;
  }

  const savedUrl = form.removeAudio ? undefined : uploadedUrl ?? form.audioUrl;
  if (originalUrl && originalUrl !== savedUrl) {
    try {
      await dependencies.cleanup(originalUrl);
    } catch {
      return "Sound saved, but the previous audio file could not be cleaned up.";
    }
  }
  return undefined;
}
