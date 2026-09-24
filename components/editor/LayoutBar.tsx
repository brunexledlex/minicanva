"use client";

import { LAYOUT_DEFS } from "@/components/story/layouts";
import { useEditor } from "@/lib/store";
import type { StoryPage } from "@/types/story";
import { LayoutIcon } from "./LayoutIcon";

export const LAYOUT_BAR_H = 60;

/** Scrollable row of layout thumbnails under the page; covers and inner pages get their own set. */
export function LayoutBar({ page, isCover, width }: { page: StoryPage; isCover: boolean; width: number }) {
  const updatePage = useEditor((s) => s.updatePage);
  const layouts = LAYOUT_DEFS.filter((l) => l.kind === (isCover ? "cover" : "inner"));

  return (
    <div className="no-scrollbar flex items-end overflow-x-auto" style={{ width, height: LAYOUT_BAR_H }} role="radiogroup" aria-label="Layout da página">
      {/* w-max + mx-auto: centred while it fits, scrollable once it doesn't. */}
      <div className="mx-auto flex w-max gap-1.5 p-0.5">
        {layouts.map((l) => {
          const active = l.id === page.layout;
          return (
            <button
              key={l.id}
              role="radio"
              aria-checked={active}
              aria-label={l.name}
              title={l.name}
              onClick={() => updatePage(page.id, { layout: l.id })}
              className={`grid shrink-0 place-items-center rounded-md border px-1.5 py-1 ${
                active
                  ? "border-indigo-500 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
              }`}
            >
              <LayoutIcon id={l.id} className="h-[35px] w-[28px]" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
