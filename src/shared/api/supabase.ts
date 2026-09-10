import { createClient } from "@supabase/supabase-js";
import { createDemoFetch } from "./demoMode";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: createDemoFetch((input, init) => fetch(input, init)) },
});
