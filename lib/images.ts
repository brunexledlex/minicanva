/**
 * Uploaded images live in IndexedDB, not localStorage: a few photos as data URLs
 * would blow the ~5 MB localStorage quota. Pages store an "idb:<id>" reference.
 */
import { uid } from "@/lib/uid";

const DB_NAME = "minicanva";
const STORE = "images";
const PREFIX = "idb:";
const MAX_EDGE = 2560;

let dbPromise: Promise<IDBDatabase> | null = null;
function db() {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>) {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const req = run(d.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

/** Scales very large photos down so storage and export stay fast; small files are kept as-is. */
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const s = MAX_EDGE / Math.max(bmp.width, bmp.height);
  if (s >= 1 || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  const type = file.type === "image/png" || file.type === "image/webp" ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), type, 0.9));
}

export async function saveImage(file: File): Promise<string> {
  const id = uid();
  // Shrink first: an IndexedDB transaction closes if it waits on other async work.
  const blob = await shrink(file);
  await tx("readwrite", (s) => s.put(blob, id));
  return PREFIX + id;
}

const urlCache = new Map<string, Promise<string>>();
/** Turns a page's imageUrl into something an <img> can load. */
export function resolveImageUrl(src: string): Promise<string> {
  if (!src.startsWith(PREFIX)) return Promise.resolve(src);
  let p = urlCache.get(src);
  if (!p) {
    p = tx<Blob | undefined>("readonly", (s) => s.get(src.slice(PREFIX.length))).then((blob) => {
      if (!blob) throw new Error("Imagem não encontrada");
      return URL.createObjectURL(blob);
    });
    p.catch(() => urlCache.delete(src));
    urlCache.set(src, p);
  }
  return p;
}

const imgCache = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(src: string): Promise<HTMLImageElement> {
  let p = imgCache.get(src);
  if (!p) {
    p = resolveImageUrl(src).then(
      (url) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Falha ao carregar imagem"));
          img.src = url;
        }),
    );
    p.catch(() => imgCache.delete(src));
    imgCache.set(src, p);
  }
  return p;
}

/** Deletes stored images that no page references any more. */
export async function pruneImages(keep: Iterable<string | undefined>) {
  const ids = new Set([...keep].filter((s): s is string => !!s?.startsWith(PREFIX)).map((s) => s.slice(PREFIX.length)));
  const all = await tx<IDBValidKey[]>("readonly", (s) => s.getAllKeys());
  await Promise.all(all.filter((k) => !ids.has(String(k))).map((k) => tx("readwrite", (s) => s.delete(k))));
}
