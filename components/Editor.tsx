"use client";

import { useEffect } from "react";
import { CanvasView } from "@/components/editor/CanvasView";
import { Filmstrip } from "@/components/editor/Filmstrip";
import { Header } from "@/components/editor/Header";
import { Sidebar } from "@/components/editor/Sidebar";
import { StorySetup } from "@/components/editor/StorySetup";
import { useFontsReady } from "@/components/story/useFontsReady";
import { pruneImages } from "@/lib/images";
import { allPages, useEditor } from "@/lib/store";
import { THEME_FONTS } from "@/lib/themes";

export default function Editor() {
  const fontsRev = useFontsReady(THEME_FONTS);
  const step = useEditor((s) => s.step);

  // Drop uploaded images that no page uses any more (deleted pages, replaced images).
  useEffect(() => {
    pruneImages(allPages(useEditor.getState().story).map((p) => p.imageUrl)).catch(() => {});
  }, []);

  // ← → move between pages when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      const { story, selectedId, select, step } = useEditor.getState();
      if (step !== "edit") return;
      const pages = allPages(story);
      const next = pages[pages.findIndex((p) => p.id === selectedId) + (e.key === "ArrowRight" ? 1 : -1)];
      if (next) select(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-100 text-neutral-900 md:h-dvh dark:bg-neutral-950 dark:text-neutral-100">
      <Header ready={fontsRev !== null} />
      {step === "setup" && <StorySetup fontsRev={fontsRev} />}
      {/* Kept mounted (just hidden) during setup: exports render from the filmstrip's stages. */}
      <div className={step === "edit" ? "flex min-h-0 flex-1 flex-col md:flex-row" : "hidden"}>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <CanvasView fontsRev={fontsRev} />
          <Filmstrip fontsRev={fontsRev} />
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
