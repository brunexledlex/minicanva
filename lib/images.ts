/**
 * Uploaded images live in IndexedDB, not localStorage: a few photos as data URLs
 * would blow the ~5 MB localStorage quota. Pages store an "idb:<id>" reference.
 */
import { IMAGE_MIN_LUMINANCE, PAPERS, rgb, toLinear } from "@/lib/palette";
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

/** Share of an image allowed to stay darker than IMAGE_MIN_LUMINANCE: a few specks shouldn't wash out the whole picture. */
const DARK_SHARE = 0.005;
/**
 * Longest side images are measured at: the most detail a page ever shows of them (a 2×
 * export of a full-width image). Measured smaller, thin dark lines blur lighter than they print.
 */
const MEASURE_EDGE = 2160;
const LINEAR = Array.from({ length: 256 }, (_, v) => toLinear(v / 255));
/** Luminance of an 8-bit colour, through per-channel lookup tables (by default, plain sRGB to linear). */
const SRGB = [LINEAR, LINEAR, LINEAR];
const lum = (r: number, g: number, b: number, lin = SRGB) => 0.2126 * lin[0][r] + 0.7152 * lin[1][g] + 0.0722 * lin[2][b];

// Pixels are tallied by colour, 6 bits a channel, so fading can be tried against a few thousand
// colours instead of millions of pixels. Each colour stands in at the darkest end of its step,
// which can only fade an image slightly more than it needs.
const bucket = (r: number, g: number, b: number) => ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);
const bucketLum = (k: number, lin = SRGB) => lum((k >> 12) << 2, ((k >> 6) & 63) << 2, (k & 63) << 2, lin);

/**
 * The most opaque an image can be drawn on this paper while all but `allowed` of its pixels
 * reach IMAGE_MIN_LUMINANCE, with the paper showing through the rest of the way. Blends as
 * canvas does, per sRGB channel: pixel · opacity + paper · (1 − opacity).
 */
function opacityOn(counts: Uint32Array, candidates: number[], allowed: number, paper: number[]) {
  const tooDark = (opacity: number) => {
    const lin = paper.map((p) => LINEAR.map((_, v) => toLinear((v * opacity + p * (1 - opacity)) / 255)));
    let n = 0;
    for (const k of candidates) if (bucketLum(k, lin) < IMAGE_MIN_LUMINANCE && (n += counts[k]) > allowed) return true;
    return false;
  };
  if (!tooDark(1)) return 1;
  // The paper alone (opacity 0) is always light enough; halve the gap to the first opacity that isn't.
  let lo = 0;
  let hi = 1;
  for (let step = 0; step < 12; step++) {
    const mid = (lo + hi) / 2;
    if (tooDark(mid)) hi = mid;
    else lo = mid;
  }
  return lo;
}

/** How opaque to draw an image on each paper (by hex) so text in any ink stays legible on it: 1 where it's light enough as it is. */
function measure(img: HTMLImageElement): Record<string, number> {
  const asIs = Object.fromEntries(PAPERS.map((p) => [p.hex, 1]));
  const s = Math.min(1, MEASURE_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * s);
  canvas.height = Math.round(img.naturalHeight * s);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || !canvas.width || !canvas.height) return asIs;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  let px: Uint8ClampedArray;
  try {
    px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch {
    return asIs; // a cross-origin image can't be read, so it's drawn as it is
  }
  const counts = new Uint32Array(1 << 18);
  let opaque = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 128) continue; // mostly transparent: the paper shows there anyway
    opaque++;
    counts[bucket(px[i], px[i + 1], px[i + 2])]++;
  }
  canvas.width = canvas.height = 0; // let the pixels go now rather than whenever the canvas is collected
  // Only colours at or near the minimum can end up below it; the rest stay light enough however much paper shows.
  const candidates: number[] = [];
  for (let k = 0; k < counts.length; k++) if (counts[k] && bucketLum(k) < IMAGE_MIN_LUMINANCE + 0.05) candidates.push(k);
  return Object.fromEntries(PAPERS.map((p) => [p.hex, opacityOn(counts, candidates, opaque * DARK_SHARE, rgb(p.hex))]));
}

/** A page's image as drawn: the picture, and how opaque it's drawn on each paper (keyed by the paper's hex). */
export type PageImage = { image: HTMLImageElement; opacity: Record<string, number> };

const pageImageCache = new Map<string, Promise<PageImage>>();
/**
 * Loads a page's image, measured for how much of the paper has to show through it. Images are
 * never drawn darker than text in every ink can bear: a dark photo comes out faded into the
 * paper, one that's light enough already is left alone.
 */
export function loadPageImage(src: string): Promise<PageImage> {
  let p = pageImageCache.get(src);
  if (!p) {
    p = loadImage(src).then((image) => ({ image, opacity: measure(image) }));
    p.catch(() => pageImageCache.delete(src));
    pageImageCache.set(src, p);
  }
  return p;
}

/** Deletes stored images that no page references any more. */
export async function pruneImages(keep: Iterable<string | undefined>) {
  const ids = new Set([...keep].filter((s): s is string => !!s?.startsWith(PREFIX)).map((s) => s.slice(PREFIX.length)));
  const all = await tx<IDBValidKey[]>("readonly", (s) => s.getAllKeys());
  await Promise.all(all.filter((k) => !ids.has(String(k))).map((k) => tx("readwrite", (s) => s.delete(k))));
}
