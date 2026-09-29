"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EditMenu } from "@/components/editor/EditMenu";
import { PageEditCanvas } from "@/components/editor/PageEditCanvas";
import { useStoryLoader } from "@/components/editor/useStoryLoader";
import { useFontsReady } from "@/components/story/useFontsReady";
import { editorHref } from "@/lib/library";
import { allPages, useEditor } from "@/lib/store";
import { THEME_FONTS } from "@/lib/themes";
import type { StoryPage } from "@/types/story";

/**
 * The edit screen: one page, changed as a draft through the bottom menu or by double-tapping
 * its text. Nothing reaches the story until "Guardar", which also returns to the story screen;
 * leaving any other way (the browser's back) drops the draft.
 */
export default function EditScreen() {
  const fontsRev = useFontsReady(THEME_FONTS);
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const pageId = params.get("page");
  const fromStory = params.get("from") === "story";
  const loaded = useStoryLoader(id);
  const isCover = useEditor((s) => s.story.cover.id === pageId);
  const [draft, setDraft] = useState<StoryPage | null>(null);

  // Start the draft from the saved page once the story is in; a page that's gone means back to the story.
  useEffect(() => {
    if (!loaded || draft) return;
    const page = allPages(useEditor.getState().story).find((p) => p.id === pageId);
    if (!page) {
      router.replace(editorHref(id));
      return;
    }
    useEditor.getState().select(page.id);
    setDraft(page);
  }, [loaded, draft, pageId, id, router]);

  const save = () => {
    if (draft) useEditor.getState().updatePage(draft.id, draft);
    // Opened from the story screen: going back returns there without a duplicate history entry.
    if (fromStory) router.back();
    else router.replace(editorHref(id));
  };

  const change = (patch: Partial<StoryPage>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  return (
    <div className="flex h-dvh flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {loaded && draft && (
        <>
          <PageEditCanvas page={draft} fontsRev={fontsRev} onChange={change} />
          <EditMenu page={draft} isCover={isCover} onChange={change} onSave={save} />
        </>
      )}
    </div>
  );
}
