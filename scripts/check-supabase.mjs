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
  console.log(`${table}: ${records.length ? "sample record available" : "no visible records"}`);
  if (table === "sounds") {
    url.searchParams.set("audio_url", "not.is.null");
    const sample = await fetch(url, { headers: { apikey: key }, signal: AbortSignal.timeout(15000) });
    if (!sample.ok) { console.log(`Audio lookup: HTTP ${sample.status}`); process.exitCode = 1; continue; }
    const [record] = await sample.json();
    if (!record?.audio_url) { console.log("Sample audio: unavailable; playback could not be verified"); process.exitCode = 1; continue; }
    const audio = await fetch(record.audio_url, { method: "HEAD", signal: AbortSignal.timeout(15000) });
    console.log(`Sample audio: HTTP ${audio.status}`);
    if (!audio.ok) process.exitCode = 1;
  }
}
