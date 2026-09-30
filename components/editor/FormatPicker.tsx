"use client";

import { useEffect, useRef, useState } from "react";
import { FORMAT_KEYS, FORMATS } from "@/lib/formats";
import type { StoryFormat } from "@/types/story";
import { Icon } from "./Icon";

/** Small square outline matching a format's proportions. */
export function FormatShape({ format, size, active }: { format: StoryFormat; size: number; active?: boolean }) {
  const { width, height } = FORMATS[format];
  return <span className={`shrink-0 rounded-[2px] border-[1.5px] border-current ${active ? "" : "opacity-70"}`} style={{ width: size, height: (size * height) / width }} />;
}

/** The format label doubles as a dropdown: picking another format calls back with it. "lg" is the story screen's top-bar version: just the name, bigger. */
export function FormatPicker({ format, onChange, size = "sm" }: { format: StoryFormat; onChange: (f: StoryFormat) => void; size?: "sm" | "lg" }) {
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
      {size === "lg" ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="-ml-2 flex h-10 min-w-0 items-center gap-1 rounded-lg px-2 text-base font-medium hover:bg-black/5 dark:hover:bg-white/10"
        >
          <span className="min-w-0 truncate">{label}</span>
          <Icon name="expand_more" className="!text-[20px] shrink-0" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Formato: ${label}`}
          className="-mx-1.5 -my-1 flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-neutral-500 hover:bg-white dark:hover:bg-neutral-800"
        >
          <FormatShape format={format} size={8} active />
          <span className="min-w-0 truncate">
            {fw}×{fh}
          </span>
          <Icon name="expand_more" className="!text-[16px] shrink-0 text-neutral-400" />
        </button>
      )}
      {open && (
        // One row of equal-width options, each a shape with its name underneath. Under the top bar's label it hangs from the left; in the dialog it's centred on the preview.
        <div
          role="radiogroup"
          aria-label="Formato"
          className={`absolute top-full z-20 mt-1 grid w-max grid-cols-3 gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 ${
            size === "lg" ? "left-0" : "left-1/2 -translate-x-1/2"
          }`}
        >
          {FORMAT_KEYS.map((f) => {
            const active = f === format;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  onChange(f);
                  setOpen(false);
                }}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-sm ${
                  active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <span className="grid h-7 shrink-0 place-items-center">
                  <FormatShape format={f} size={14} active={active} />
                </span>
                {FORMATS[f].label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
