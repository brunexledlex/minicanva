"use client";

import { useLibrary } from "@/lib/library";
import type { Story } from "@/types/story";

/** Bump when the renderer changes how covers look, so every saved thumbnail is redrawn. 2: paper and ink colours. */
const RENDER_VERSION = 2;

/** Short fingerprint of everything that can change how a cover looks. */
export function coverKey(s: Story) {
  const str = JSON.stringify([RENDER_VERSION, s.format, s.theme, s.name, s.cover]);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export const needsThumbnail = (s: Story) => !s.coverThumbnailDataUrl || s.coverThumbnailKey !== coverKey(s);

const timers = new Map<string, ReturnType<typeof setTimeout>>();
let queue = Promise.resolve();

const whenIdle = (fn: () => void) => (typeof requestIdleCallback === "function" ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 0));

/**
 * Re-renders a story's shelf thumbnail once edits pause for `delay` ms and the browser is idle,
 * if its cover actually changed. Renders run one at a time, so a shelf full of stories saved
 * before thumbnails existed fills in gradually instead of all at once.
 */
export function scheduleThumbnail(id: string, delay = 800) {
  clearTimeout(timers.get(id));
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id);
      whenIdle(() => {
        queue = queue.then(() => refresh(id));
      });
    }, delay),
  );
}

async function refresh(id: string) {
  // The latest saved version, which may have changed since this was scheduled.
  const story = useLibrary.getState().stories.find((s) => s.id === id);
  if (!story || !needsThumbnail(story)) return;
  const key = coverKey(story);
  try {
    // Konva only loads when a thumbnail is actually needed, not with the shelf itself.
    const { generateCoverThumbnail } = await import("@/lib/coverThumbnail");
    useLibrary.getState().setThumbnail(id, await generateCoverThumbnail(story), key);
  } catch {
    // Keep the old thumbnail; the next edit or visit to the shelf tries again.
  }
}
