import { supabase } from "../../lib/supabase";

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