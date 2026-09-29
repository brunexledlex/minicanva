"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLibrary } from "@/lib/library";
import { useEditor } from "@/lib/store";
import { scheduleThumbnail } from "@/lib/thumbnails";

/**
 * Opens a saved story in the editor store and, while mounted, saves every change back to the
 * library (and refreshes its shelf thumbnail). Goes back to the shelf if the story is gone.
 * Returns whether it's loaded yet.
 */
export function useStoryLoader(id: string | null) {
  const router = useRouter();
  const loaded = useEditor((s) => s.story.id === id);

  useEffect(() => {
    const story = useLibrary.getState().stories.find((s) => s.id === id);
    if (!story) {
      router.replace("/");
      return;
    }
    // Always from the library: the shelf may have renamed it since it was last open here.
    useEditor.getState().load(story);
    return useEditor.subscribe((s, prev) => {
      if (s.story === prev.story) return;
      useLibrary.getState().save(s.story);
      scheduleThumbnail(s.story.id);
    });
  }, [id, router]);

  return loaded;
}
