"use client";

import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { allPages, useEditor } from "@/lib/store";
import { ExportMenu } from "./ExportMenu";
import { FormatPicker } from "./FormatPicker";

export const TOP_BAR_H = 56;

const iconBtn =
  "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-neutral-800 hover:bg-black/5 disabled:pointer-events-none disabled:opacity-30 dark:text-neutral-200 dark:hover:bg-white/10";

/** The story screen's top bar: the story's format, and the page actions for the selected page. */
export function StoryTopBar({ ready, onEdit }: { ready: boolean; onEdit: () => void }) {
  const format = useEditor((s) => s.story.format);
  const selectedId = useEditor((s) => s.selectedId);
  const isCover = useEditor((s) => allPages(s.story)[0].id === s.selectedId);
  const { setFormat, addPage, duplicatePage, deletePage } = useEditor.getState();

  return (
    <div className="flex shrink-0 items-center gap-1 px-4 md:px-6" style={{ height: TOP_BAR_H }}>
      <FormatPicker format={format} onChange={setFormat} size="lg" />
      <div className="flex-1" />
      <button onClick={addPage} title="Adicionar página" aria-label="Adicionar página" className={iconBtn}>
        <Plus size={20} strokeWidth={1.75} />
      </button>
      <button onClick={() => duplicatePage(selectedId)} disabled={isCover} title="Duplicar página" aria-label="Duplicar página" className={iconBtn}>
        <Copy size={20} strokeWidth={1.75} />
      </button>
      <button onClick={onEdit} title="Editar página" aria-label="Editar página" className={iconBtn}>
        <Pencil size={20} strokeWidth={1.75} />
      </button>
      <ExportMenu ready={ready} className={iconBtn} />
      <button onClick={() => deletePage(selectedId)} disabled={isCover} title="Apagar página" aria-label="Apagar página" className={iconBtn}>
        <Trash2 size={20} strokeWidth={1.75} />
      </button>
    </div>
  );
}
