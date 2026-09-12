import type { Sound } from "../../features/sounds/model/types";
import type { SoundFormPayload } from "../../features/sounds/model/formTypes";
import { createDemoAudio, demoOwners, demoSounds } from "./demoSeed";

const DATABASE = "telecom-sound-manager-demo";
const STORES = ["sounds", "audio", "meta"];
const AUDIO_LIMIT = 50 * 1024 * 1024;
const urls = new Map<string, string>();
let connection: Promise<IDBDatabase> | undefined;

function releaseAudio(key: string) {
  const url = urls.get(key);
  if (url) URL.revokeObjectURL(url);
  urls.delete(key);
}

function request<T>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(value.error);
  });
}

function open(): Promise<IDBDatabase> {
  if (!connection) {
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      const opening = indexedDB.open(DATABASE, 1);
      opening.onupgradeneeded = () => STORES.forEach(name => opening.result.createObjectStore(name));
      opening.onerror = () => reject(new Error("Browser storage is unavailable. Allow site storage and try again."));
      opening.onblocked = () => reject(new Error("Close other tabs of this demo and try again."));
      opening.onsuccess = () => {
        opening.result.onversionchange = () => { opening.result.close(); connection = undefined; };
        resolve(opening.result);
      };
    }).catch(error => { connection = undefined; throw error; });
  }
  return connection;
}

async function transaction<T>(mode: IDBTransactionMode, action: (tx: IDBTransaction) => Promise<T>): Promise<T> {
  const db = await open();
  const tx = db.transaction(STORES, mode);
  const completed = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error("Browser storage operation was cancelled."));
    tx.onerror = () => reject(tx.error ?? new Error("Could not save browser data. Free some site storage and try again."));
  });
  try {
    const result = await action(tx);
    await completed;
    return result;
  } catch (error) {
    try { tx.abort(); } catch { /* Already completed or aborted. */ }
    await completed.catch(() => undefined);
    throw error;
  }
}

function seed(tx: IDBTransaction) {
  for (const name of STORES) tx.objectStore(name).clear();
  for (const sound of demoSounds) tx.objectStore("sounds").put(sound, sound.id);
  tx.objectStore("audio").put(createDemoAudio(), "demo-audio:sample");
  tx.objectStore("meta").put(true, "initialized");
}

async function initialize() {
  await transaction("readwrite", async tx => {
    if (!await request(tx.objectStore("meta").get("initialized"))) seed(tx);
  });
}

function storageUrl(url: string | undefined) {
  if (!url) return undefined;
  if (url.startsWith("demo-audio:")) return url;
  for (const [key, value] of urls) if (value === url) return key;
  throw new Error("This audio is no longer available. Select the file again.");
}

async function playable(sound: Sound): Promise<Sound> {
  if (!sound.audioUrl) return sound;
  const key = sound.audioUrl;
  if (!urls.has(key)) {
    const blob = await transaction("readonly", tx => request<Blob | undefined>(tx.objectStore("audio").get(key)));
    if (!blob) throw new Error("Saved audio is missing. Reset the demo to restore sample data.");
    // Another query may have resolved the same blob while this one was waiting.
    if (!urls.has(key)) urls.set(key, URL.createObjectURL(blob));
  }
  return { ...sound, audioUrl: urls.get(key) };
}

export const browserDemo = {
  async getOwners() { await initialize(); return structuredClone(demoOwners); },
  async getSounds() {
    await initialize();
    const rows = await transaction("readonly", tx => request<Sound[]>(tx.objectStore("sounds").getAll()));
    return Promise.all(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(playable));
  },
  async getSound(id: string) {
    await initialize();
    const sound = await transaction("readonly", tx => request<Sound | undefined>(tx.objectStore("sounds").get(id)));
    if (!sound) throw new Error("Sound not found");
    return playable(sound);
  },
  async save(payload: SoundFormPayload, id?: string) {
    await initialize();
    const sound = await transaction("readwrite", async tx => {
      const store = tx.objectStore("sounds");
      const previous: Sound | undefined = id ? await request(store.get(id)) : undefined;
      if (id && !previous) throw new Error("Sound not found");
      if (!demoOwners.some(owner => owner.id === payload.ownerId && owner.type === payload.ownerType)) throw new Error("Invalid owner");
      const audioUrl = storageUrl(payload.audioUrl);
      if (audioUrl && !await request(tx.objectStore("audio").getKey(audioUrl))) throw new Error("Audio file not found. Select the file again.");
      const row: Sound = { ...payload, audioUrl, isActive: Boolean(audioUrl) && payload.isActive,
        id: id ?? crypto.randomUUID(), createdAt: previous?.createdAt ?? new Date().toISOString(),
        updatedAt: id ? new Date().toISOString() : undefined, dialCode: previous?.dialCode ?? `*72*${Math.floor(1000 + Math.random() * 9000)}` };
      store.put(row, row.id);
      return row;
    });
    return playable(sound);
  },
  async deleteSound(id: string) {
    await initialize();
    const removedAudio = await transaction("readwrite", async tx => {
      const store = tx.objectStore("sounds");
      const row: Sound | undefined = await request(store.get(id));
      if (!row) throw new Error("Sound not found");
      await request(store.delete(id));
      const remaining = await request<Sound[]>(store.getAll());
      if (row.audioUrl && !remaining.some(sound => sound.audioUrl === row.audioUrl)) {
        tx.objectStore("audio").delete(row.audioUrl);
        return row.audioUrl;
      }
    });
    if (removedAudio) releaseAudio(removedAudio);
    return { id };
  },
  async upload(file: File) {
    if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("Choose a non-empty audio file up to 5 MB.");
    if (!/\.(mp3|wav|ogg)$/i.test(file.name)) throw new Error("Choose an MP3, WAV or OGG file.");
    await initialize();
    const key = `demo-audio:${crypto.randomUUID()}`;
    await transaction("readwrite", async tx => {
      const store = tx.objectStore("audio");
      const blobs = await request<Blob[]>(store.getAll());
      if (blobs.reduce((size, blob) => size + blob.size, 0) + file.size > AUDIO_LIMIT) throw new Error("Demo audio limit (50 MB) reached. Remove unused audio or reset the demo.");
      store.put(file, key);
    });
    const url = URL.createObjectURL(file);
    urls.set(key, url);
    return url;
  },
  async cleanup(url: string) {
    const key = storageUrl(url);
    if (!key) return;
    const removed = await transaction("readwrite", async tx => {
      const rows = await request<Sound[]>(tx.objectStore("sounds").getAll());
      if (rows.some(row => row.audioUrl === key)) return false;
      tx.objectStore("audio").delete(key);
      return true;
    });
    if (removed) releaseAudio(key);
  },
  async reset() {
    await transaction("readwrite", async tx => { seed(tx); });
    // Reload unmounts players/forms and discards RTK Query caches and object URLs.
  },
};
