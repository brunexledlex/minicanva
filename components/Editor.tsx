"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { CanvasView } from "@/components/editor/CanvasView";
import { Filmstrip } from "@/components/editor/Filmstrip";
import { Header } from "@/components/editor/Header";
import { Sidebar } from "@/components/editor/Sidebar";
import { useFontsReady } from "@/components/story/useFontsReady";
import { pruneUnusedImages, useLibrary } from "@/lib/library";
import { allPages, useEditor } from "@/lib/store";
import { THEME_FONTS } from "@/lib/themes";
import { scheduleThumbnail } from "@/lib/thumbnails";

// The sidebar's title/body fields are hidden for now: text is edited directly on the canvas.
// Kept (not deleted) in case it comes back — flip this to show it again.
const SHOW_SIDEBAR = false;

export default function Editor() {
  const fontsRev = useFontsReady(THEME_FONTS);
  const router = useRouter();
  const id = useSearchParams().get("id");
  const loaded = useEditor((s) => s.story.id === id);

  useEffect(() => {
    const story = useLibrary.getState().stories.find((s) => s.id === id);
    if (!story) {
      router.replace("/");
      return;
    }
    // Always from the library: the shelf may have renamed it since it was last open here.
    useEditor.getState().load(story);
    // Every edit goes straight to the library, and may call for a new shelf thumbnail.
    return useEditor.subscribe((s, prev) => {
      if (s.story === prev.story) return;
      useLibrary.getState().save(s.story);
      scheduleThumbnail(s.story.id);
    });
  }, [id, router]);

  useEffect(() => {
    pruneUnusedImages();
  }, []);

  // ← → move between pages when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      const { story, selectedId, select } = useEditor.getState();
      const pages = allPages(story);
      const next = pages[pages.findIndex((p) => p.id === selectedId) + (e.key === "ArrowRight" ? 1 : -1)];
      if (next) select(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-100 text-neutral-900 md:h-dvh dark:bg-neutral-950 dark:text-neutral-100">
      {loaded && (
        <>
          <Header ready={fontsRev !== null} />
          {/* pb-[92px] (matches Filmstrip.FILMSTRIP_H) reserves room for it: fixed to the bottom on
              mobile, so it never covers the content above it; back in flow from md up. */}
          <div className="flex min-h-0 flex-1 flex-col pb-[92px] md:flex-row md:pb-0">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <CanvasView fontsRev={fontsRev} />
              <Filmstrip fontsRev={fontsRev} />
            </div>
            {SHOW_SIDEBAR && <Sidebar />}
          </div>
        </>
      )}
    </div>
  );
}
