"use client";

import { useEffect, useRef, useState } from "react";
import { FORMATS } from "@/lib/formats";
import { useEditor } from "@/lib/store";
import type { StoryFormat, StoryPage } from "@/types/story";
import { Icon } from "./Icon";

export const TOOLBAR_H = 44;
// Below this, the format label (its longest case: "Story · 1080×1920") would crowd or
// overlap the duplicate/delete buttons; the toolbar keeps at least this width instead.
export const TOOLBAR_MIN_W = 240;

/** Format picker (applies to the whole story) and page actions, sitting right above the page preview. */
export function PageToolbar({ page, index, format, width }: { page: StoryPage; index: number; format: StoryFormat; width: number }) {
  const { duplicatePage, deletePage } = useEditor.getState();
  const isCover = index === 0;

  return (
    <div className="flex items-center justify-between gap-2" style={{ width, height: TOOLBAR_H }}>
      <FormatPicker format={format} />
      {!isCover && (
        <div className="flex shrink-0 text-neutral-600 dark:text-neutral-300">
          <ToolButton icon="content_copy" title="Duplicar página" onClick={() => duplicatePage(page.id)} />
          <ToolButton icon="delete" title="Apagar página" danger onClick={() => deletePage(page.id)} />
        </div>
      )}
    </div>
  );
}

const FORMAT_KEYS = Object.keys(FORMATS) as StoryFormat[];

/** Small square outline matching a format's proportions. */
function FormatShape({ format, size, active }: { format: StoryFormat; size: number; active?: boolean }) {
  const { width, height } = FORMATS[format];
  return <span className={`shrink-0 rounded-[2px] border-[1.5px] border-current ${active ? "" : "opacity-70"}`} style={{ width: size, height: (size * height) / width }} />;
}

/** The format label doubles as a dropdown: picking another format applies it to the whole story. */
function FormatPicker({ format }: { format: StoryFormat }) {
  const setFormat = useEditor.getState().setFormat;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const { width: fw, height: fh, label } = FORMATS[format];

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="-mx-1.5 -my-1 flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-neutral-500 hover:bg-white dark:hover:bg-neutral-800"
      >
        <FormatShape format={format} size={8} active />
        <span className="min-w-0 truncate">
          {label} · {fw}×{fh}
        </span>
        <Icon name="expand_more" className="!text-[16px] shrink-0 text-neutral-400" />
      </button>
      {open && (
        <div role="radiogroup" aria-label="Formato" className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          {FORMAT_KEYS.map((f) => {
            const info = FORMATS[f];
            const active = f === format;
            return (
              <button
                key={f}
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setFormat(f);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm ${
                  active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <span className="grid h-6 w-5 shrink-0 place-items-center">
                  <FormatShape format={f} size={14} active={active} />
                </span>
                <span className="min-w-0">
                  {info.label}
                  <span className="block text-xs tabular-nums text-neutral-400">
                    {f} · {info.width}×{info.height}
                  </span>
                </span>
              </button>
            );
          })}
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
