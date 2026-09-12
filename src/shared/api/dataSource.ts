// Build-time selection only. The public site defaults to isolated browser storage.
export const isBrowserDemo = import.meta.env.VITE_DATA_SOURCE !== "supabase";
