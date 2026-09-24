"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { blankStory, newPage, sampleStory } from "@/lib/defaults";
import { getTheme } from "@/lib/themes";
import { uid } from "@/lib/uid";
import type { Story, StoryFormat, StoryPage } from "@/types/story";

export type Step = "setup" | "edit";

type EditorState = {
  story: Story;
  selectedId: string;
  /** "setup" = name, format and theme (step 1); "edit" = the pages (step 2). */
  step: Step;
  setStep: (step: Step) => void;
  select: (id: string) => void;
  setName: (name: string) => void;
  setFormat: (format: StoryFormat) => void;
  setTheme: (themeId: string) => void;
  updatePage: (id: string, patch: Partial<StoryPage>) => void;
  addPage: () => void;
  duplicatePage: (id: string) => void;
  deletePage: (id: string) => void;
  movePage: (id: string, toIndex: number) => void;
  newStory: (withSample?: boolean) => void;
};

/** Cover first, then the inner pages: the order pages are shown and exported in. */
export const allPages = (s: Story) => [s.cover, ...s.pages];

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => {
      const initial = sampleStory();
      const patchStory = (patch: Partial<Story>) => set((st) => ({ story: { ...st.story, ...patch } }));
      return {
        story: initial,
        selectedId: initial.cover.id,
        step: "setup",
        setStep: (step) => set({ step }),
        select: (id) => set({ selectedId: id }),
        setName: (name) => patchStory({ name }),
        setFormat: (format) => patchStory({ format }),
        setTheme: (themeId) => patchStory({ theme: getTheme(themeId) }),
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
        newStory: (withSample) => {
          const story = withSample ? sampleStory() : blankStory();
          // A blank story starts at setup; the sample already has content, so it opens on the pages.
          set({ story, selectedId: story.cover.id, step: withSample ? "edit" : "setup" });
        },
      };
    },
    {
      name: "minicanva:story",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ story: s.story, selectedId: s.selectedId, step: s.step }),
    },
  ),
);
