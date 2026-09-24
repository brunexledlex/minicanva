"use client";

import { getLayoutDef } from "@/components/story/layouts";
import { allPages, useEditor } from "@/lib/store";
import type { StoryPage } from "@/types/story";

const label = "mb-1.5 block text-xs font-medium text-neutral-500";
const field =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-900";
const section = "border-b border-neutral-200 px-4 py-5 dark:border-neutral-800";
const heading = "mb-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500";

export function Sidebar() {
  const story = useEditor((s) => s.story);
  const selectedId = useEditor((s) => s.selectedId);
  const pages = allPages(story);
  const index = Math.max(0, pages.findIndex((p) => p.id === selectedId));
  const page = pages[index];

  return (
    <aside className="w-full shrink-0 border-t border-neutral-200 bg-white md:w-80 md:overflow-y-auto md:border-l md:border-t-0 dark:border-neutral-800 dark:bg-neutral-900">
      <PageSection page={page} index={index} />
    </aside>
  );
}

function PageSection({ page, index }: { page: StoryPage; index: number }) {
  const updatePage = useEditor((s) => s.updatePage);
  const isCover = index === 0;
  const def = getLayoutDef(page.layout);
  const set = (patch: Partial<StoryPage>) => updatePage(page.id, patch);

  return (
    <section className={section}>
      <h2 className={heading}>{isCover ? "Capa" : `Página ${String(index + 1).padStart(2, "0")}`}</h2>

      {def?.fields.title && (
        <label className="mb-4 block">
          <span className={label}>{def.fields.title}</span>
          <textarea rows={2} className={field + " resize-y"} value={page.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
        </label>
      )}
      {def?.fields.body && (
        <label className="mb-4 block">
          <span className={label}>{def.fields.body}</span>
          <textarea rows={def.fields.body === "Texto" ? 6 : 2} className={field + " resize-y"} value={page.body ?? ""} onChange={(e) => set({ body: e.target.value })} />
        </label>
      )}
    </section>
  );
}

