export function getManagedSoundPath(audioUrl: string, projectUrl: string): string | undefined {
  try {
    const url = new URL(audioUrl);
    const project = new URL(projectUrl);
    const prefix = `${project.pathname.replace(/\/$/, "")}/storage/v1/object/public/sounds/`;
    if (url.origin !== project.origin || !url.pathname.startsWith(prefix)) return undefined;
    const path = decodeURIComponent(url.pathname.slice(prefix.length));
    // Only manage filenames created by this application, never arbitrary bucket paths.
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp3|wav|ogg)$/i.test(path) ? path : undefined;
  } catch {
    return undefined;
  }
}
