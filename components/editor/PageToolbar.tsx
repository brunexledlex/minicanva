"use client";

import { useEditor } from "@/lib/store";
import type { StoryPage } from "@/types/story";
import { Icon } from "./Icon";

export const TOOLBAR_H = 44;

/** Page label and page actions, sitting right above the page preview. */
export function PageToolbar({ page, index, pageCount, width }: { page: StoryPage; index: number; pageCount: number; width: number }) {
  const { duplicatePage, deletePage } = useEditor.getState();
  const isCover = index === 0;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center justify-between gap-2" style={{ width, height: TOOLBAR_H }}>
      <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        {isCover ? "Capa" : `Página ${pad(index + 1)}`}
        <span className="font-normal normal-case tracking-normal text-neutral-400"> de {pad(pageCount)}</span>
      </span>
      {!isCover && (
        <div className="flex shrink-0 text-neutral-600 dark:text-neutral-300">
          <ToolButton icon="content_copy" title="Duplicar página" onClick={() => duplicatePage(page.id)} />
          <ToolButton icon="delete" title="Apagar página" danger onClick={() => deletePage(page.id)} />
        </div>
      )}
    </div>
  );
}

function ToolButton({ icon, title, onClick, danger }: { icon: string; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`grid h-8 w-8 place-items-center rounded-md hover:bg-white dark:hover:bg-neutral-800 ${danger ? "text-red-600" : ""}`}
    >
      <Icon name={icon} className="!text-[18px]" />
    </button>
  );
}
