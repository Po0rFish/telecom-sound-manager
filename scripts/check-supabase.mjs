// Read-only connectivity smoke check. Never print credentials or record contents.
const project = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!project || !key) throw new Error("Set the Supabase environment variables first");
for (const table of ["owners", "sounds"]) {
  const url = new URL(`/rest/v1/${table}`, project);
  url.searchParams.set("select", table === "sounds" ? "id,audio_url" : "id");
  url.searchParams.set("limit", "1");
  const response = await fetch(url, { headers: { apikey: key }, signal: AbortSignal.timeout(15000) });
  console.log(`${table}: HTTP ${response.status}`);
  if (!response.ok) { process.exitCode = 1; continue; }
  const records = await response.json();
  if (table === "sounds" && records[0]?.audio_url) {
    const audio = await fetch(records[0].audio_url, { method: "HEAD", signal: AbortSignal.timeout(15000) });
    console.log(`Sample audio: HTTP ${audio.status}`);
    if (!audio.ok) process.exitCode = 1;
  }
}
