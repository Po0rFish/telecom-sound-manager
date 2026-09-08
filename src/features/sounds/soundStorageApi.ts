import { supabase } from "../../shared/api/supabase";
import { getManagedSoundPath } from "./model/storagePath";

export const uploadSoundFile = async (file: File) => {
  if (file.size === 0) {
    throw new Error("File is empty");
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("sounds")
    .upload(filePath, file, {
      contentType: file.type || `audio/${fileExt}`,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("sounds")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const removeUnusedSoundFile = async (audioUrl: string) => {
  const path = getManagedSoundPath(audioUrl, import.meta.env.VITE_SUPABASE_URL);
  if (!path) return;
  const { count, error: referenceError } = await supabase
    .from("sounds")
    .select("id", { count: "exact", head: true })
    .eq("audio_url", audioUrl);
  if (referenceError || count === null) throw new Error("Could not verify audio references");
  if (count > 0) return;
  const { error } = await supabase.storage.from("sounds").remove([path]);
  if (error) throw new Error(error.message);
};
