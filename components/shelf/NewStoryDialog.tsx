"use client";

import { useRouter } from "next/navigation";
import { FORMAT_KEYS, FORMATS } from "@/lib/formats";
import { editorHref } from "@/lib/library";
import { useEditor } from "@/lib/store";
import { Dialog } from "./Dialog";

/** Picks the format of a new story, then creates it (a cover and one inner page) and opens it in the editor. */
export function NewStoryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const newStory = useEditor((s) => s.newStory);

  return (
    <Dialog open={open} onClose={onClose} title="Novo Story">
      <p className="mb-4 text-sm text-neutral-500">Escolhe o formato das páginas.</p>
      <div className="grid grid-cols-3 gap-2">
        {FORMAT_KEYS.map((f) => {
          const { width, height, label } = FORMATS[f];
          return (
            <button
              key={f}
              onClick={() => router.push(editorHref(newStory(f)))}
              className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 px-2 pb-3 pt-4 outline-none hover:border-neutral-400 hover:bg-neutral-50 focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-[#c8553d]/40 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
            >
              <span className="mb-2 flex h-16 items-end">
                <span className="rounded-[3px] border-2 border-neutral-400" style={{ width: 36, height: (36 * height) / width }} />
              </span>
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs tabular-nums text-neutral-500">{f}</span>
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
