"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { blankStory } from "@/lib/defaults";
import { pruneImages } from "@/lib/images";
import { uid } from "@/lib/uid";
import type { Story, StoryFormat, Theme } from "@/types/story";

type LibraryState = {
  /** Every saved story, in no particular order; the shelf sorts them. */
  stories: Story[];
  /** Adds a blank story (a cover and one inner page, in this format, theme and name) and returns it. */
  create: (format: StoryFormat, theme?: Theme, name?: string) => Story;
  /** Stores the editor's copy of a story. The thumbnail fields are the library's own and are kept. */
  save: (story: Story) => void;
  rename: (id: string, name: string) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  setThumbnail: (id: string, dataUrl: string, key: string) => void;
};

const LIBRARY_KEY = "minicanva:library";
const THUMBNAIL_FIELDS = new Set(["coverThumbnailDataUrl", "coverThumbnailKey"]);

// Thumbnails are a cache the shelf can regenerate: if localStorage is full, save the stories
// without them rather than failing to save the stories at all.
const storage = createJSONStorage(() => ({
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      localStorage.setItem(key, JSON.stringify(JSON.parse(value), (k, v) => (THUMBNAIL_FIELDS.has(k) ? undefined : v)));
    }
  },
  removeItem: (key: string) => localStorage.removeItem(key),
}));

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => {
      const patch = (id: string, fn: (s: Story) => Story) => set(({ stories }) => ({ stories: stories.map((s) => (s.id === id ? fn(s) : s)) }));
      return {
        stories: [],
        create: (format, theme, name) => {
          const story = blankStory(format, theme, name);
          set(({ stories }) => ({ stories: [...stories, story] }));
          return story;
        },
        save: (story) =>
          patch(story.id, (prev) => ({
            ...story,
            coverThumbnailDataUrl: prev.coverThumbnailDataUrl,
            coverThumbnailKey: prev.coverThumbnailKey,
            updatedAt: Date.now(),
          })),
        rename: (id, name) => patch(id, (s) => ({ ...s, name, updatedAt: Date.now() })),
        duplicate: (id) => {
          const src = get().stories.find((s) => s.id === id);
          if (!src) return;
          // New page ids too: the filmstrip and exports key their stages by page id.
          const copy: Story = {
            ...src,
            id: uid(),
            name: `${src.name} (cópia)`,
            cover: { ...src.cover, id: uid() },
            pages: src.pages.map((p) => ({ ...p, id: uid() })),
            updatedAt: Date.now(),
          };
          set(({ stories }) => ({ stories: [...stories, copy] }));
        },
        remove: (id) => set(({ stories }) => ({ stories: stories.filter((s) => s.id !== id) })),
        setThumbnail: (id, dataUrl, key) => patch(id, (s) => ({ ...s, coverThumbnailDataUrl: dataUrl, coverThumbnailKey: key })),
      };
    },
    { name: LIBRARY_KEY, version: 1, storage },
  ),
);

export const editorHref = (id: string) => `/editor/?id=${encodeURIComponent(id)}`;
/** The edit screen for one page. `fromStory`: opened from the story screen, so leaving it can simply go back. */
export const editPageHref = (id: string, pageId: string, fromStory = true) =>
  `/editor/edit/?id=${encodeURIComponent(id)}&page=${encodeURIComponent(pageId)}${fromStory ? "&from=story" : ""}`;

/** Deletes uploaded images that no page of any story uses any more (replaced images, deleted pages or stories). */
export function pruneUnusedImages() {
  const used = useLibrary.getState().stories.flatMap((s) => [s.cover, ...s.pages].map((p) => p.imageUrl));
  return pruneImages(used).catch(() => {});
}

// Before the shelf existed, the editor kept its one story under this key. Move it onto the
// shelf once; the old key is only removed after the library has been written with it.
const LEGACY_KEY = "minicanva:story";
if (typeof window !== "undefined") {
  try {
    const legacy: Story | undefined = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "null")?.state?.story;
    if (legacy?.cover) {
      if (!useLibrary.getState().stories.some((s) => s.id === legacy.id)) {
        useLibrary.setState(({ stories }) => ({ stories: [...stories, { ...legacy, updatedAt: Date.now() }] }));
      }
      if (localStorage.getItem(LIBRARY_KEY)?.includes(`"id":"${legacy.id}"`)) localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    // Unreadable old data: leave it where it is rather than lose it.
  }
}
