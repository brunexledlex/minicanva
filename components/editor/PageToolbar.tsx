"use client";

import { useEditor } from "@/lib/store";
import type { StoryFormat, StoryPage } from "@/types/story";
import { FormatPicker } from "./FormatPicker";
import { Icon } from "./Icon";

export const TOOLBAR_H = 44;
// Below this, the format label (its longest case: "Story · 1080×1920") would crowd or
// overlap the duplicate/delete buttons; the toolbar keeps at least this width instead.
export const TOOLBAR_MIN_W = 240;

/** Format picker (applies to the whole story) and page actions, sitting right above the page preview. */
export function PageToolbar({ page, index, format, width }: { page: StoryPage; index: number; format: StoryFormat; width: number }) {
  const { duplicatePage, deletePage, setFormat } = useEditor.getState();
  const isCover = index === 0;

  return (
    <div className="flex items-center justify-between gap-2" style={{ width, height: TOOLBAR_H }}>
      <FormatPicker format={format} onChange={setFormat} />
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
