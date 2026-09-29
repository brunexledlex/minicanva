"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Filmstrip } from "@/components/editor/Filmstrip";
import { PagePreview } from "@/components/editor/PagePreview";
import { Sidebar } from "@/components/editor/Sidebar";
import { StoryTopBar } from "@/components/editor/StoryTopBar";
import { useStoryLoader } from "@/components/editor/useStoryLoader";
import { useFontsReady } from "@/components/story/useFontsReady";
import { editPageHref, pruneUnusedImages } from "@/lib/library";
import { allPages, useEditor } from "@/lib/store";
import { THEME_FONTS } from "@/lib/themes";

// The sidebar's title/body fields are hidden for now: text is edited directly on the canvas.
// Kept (not deleted) in case it comes back — flip this to show it again.
const SHOW_SIDEBAR = false;

/** The story screen: the selected page large (swipe to turn), page actions on top, every page along the bottom. */
export default function Editor() {
  const fontsRev = useFontsReady(THEME_FONTS);
  const router = useRouter();
  const id = useSearchParams().get("id");
  const loaded = useStoryLoader(id);

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

  const edit = () => {
    const { story, selectedId } = useEditor.getState();
    router.push(editPageHref(story.id, selectedId));
  };

  return (
    <div className="flex h-dvh flex-col bg-[#ececec] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {loaded && (
        <>
          <StoryTopBar ready={fontsRev !== null} onEdit={edit} />
          <div className="flex min-h-0 flex-1 md:flex-row">
            <PagePreview fontsRev={fontsRev} onEdit={edit} />
            {SHOW_SIDEBAR && <Sidebar />}
          </div>
          <Filmstrip fontsRev={fontsRev} />
        </>
      )}
    </div>
  );
}
