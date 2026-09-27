"use client";

import { create } from "zustand";
import { blankStory, newPage } from "@/lib/defaults";
import { useLibrary } from "@/lib/library";
import { uid } from "@/lib/uid";
import type { Story, StoryFormat, StoryPage, Theme } from "@/types/story";

/** The story open in the editor. Not persisted itself: the editor saves every change to the library. */
type EditorState = {
  story: Story;
  selectedId: string;
  /** Opens a saved story on its pages, or, if it's the story already open, refreshes it in place. */
  load: (story: Story) => void;
  select: (id: string) => void;
  setFormat: (format: StoryFormat) => void;
  updatePage: (id: string, patch: Partial<StoryPage>) => void;
  addPage: () => void;
  duplicatePage: (id: string) => void;
  deletePage: (id: string) => void;
  movePage: (id: string, toIndex: number) => void;
  /** Adds a blank story in the given format, theme and name (fixed at creation) to the library and opens it on its pages; returns its id. */
  newStory: (format: StoryFormat, theme?: Theme, name?: string) => string;
};

/** Cover first, then the inner pages: the order pages are shown and exported in. */
export const allPages = (s: Story) => [s.cover, ...s.pages];

export const useEditor = create<EditorState>()((set, get) => {
  // Placeholder until the editor loads a story from the library; never shown.
  const initial = blankStory("4:5");
  const patchStory = (patch: Partial<Story>) => set((st) => ({ story: { ...st.story, ...patch } }));
  return {
    story: initial,
    selectedId: initial.cover.id,
    load: (story) =>
      set((st) => ({
        story,
        // Same story (e.g. one just created): keep the page it's on.
        selectedId: st.story.id === story.id && allPages(story).some((p) => p.id === st.selectedId) ? st.selectedId : story.cover.id,
      })),
    select: (id) => set({ selectedId: id }),
    setFormat: (format) => patchStory({ format }),
    updatePage: (id, patch) =>
      set(({ story }) => ({
        story:
          story.cover.id === id
            ? { ...story, cover: { ...story.cover, ...patch } }
            : { ...story, pages: story.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)) },
      })),
    addPage: () => {
      const { story, selectedId } = get();
      const page = newPage();
      const at = story.pages.findIndex((p) => p.id === selectedId) + 1; // after the selection, or first after the cover
      const pages = [...story.pages];
      pages.splice(at, 0, page);
      set({ story: { ...story, pages }, selectedId: page.id });
    },
    duplicatePage: (id) => {
      const { story } = get();
      const i = story.pages.findIndex((p) => p.id === id);
      if (i < 0) return;
      const copy = { ...story.pages[i], id: uid() };
      const pages = [...story.pages];
      pages.splice(i + 1, 0, copy);
      set({ story: { ...story, pages }, selectedId: copy.id });
    },
    deletePage: (id) => {
      const { story, selectedId } = get();
      const i = story.pages.findIndex((p) => p.id === id);
      if (i < 0) return;
      const pages = story.pages.filter((p) => p.id !== id);
      const next = selectedId === id ? (pages[Math.min(i, pages.length - 1)]?.id ?? story.cover.id) : selectedId;
      set({ story: { ...story, pages }, selectedId: next });
    },
    movePage: (id, toIndex) => {
      const { story } = get();
      const from = story.pages.findIndex((p) => p.id === id);
      if (from < 0) return;
      const pages = [...story.pages];
      const [page] = pages.splice(from, 1);
      pages.splice(Math.max(0, Math.min(toIndex, pages.length)), 0, page);
      set({ story: { ...story, pages } });
    },
    newStory: (format, theme, name) => {
      const story = useLibrary.getState().create(format, theme, name);
      set({ story, selectedId: story.cover.id });
      return story.id;
    },
  };
});
