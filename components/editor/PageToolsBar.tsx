"use client";

import { ImageOff, ImagePlus, LayoutTemplate, Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LAYOUT_DEFS } from "@/components/story/layouts";
import { DEFAULT_IMAGES } from "@/lib/defaults";
import { useEditor } from "@/lib/store";
import type { StoryPage } from "@/types/story";
import { LayoutIcon } from "./LayoutIcon";
import { usePageImageUpload } from "./usePageImage";

export const TOOLS_BAR_H = 48;

const trigger =
  "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white";

/** Row under the page: a "Layout" picker and, when the layout has an image, an "Imagem" picker — both open a dropdown. */
export function PageToolsBar({ page, isCover, width }: { page: StoryPage; isCover: boolean; width: number }) {
  const layouts = LAYOUT_DEFS.filter((l) => l.kind === (isCover ? "cover" : "inner"));
  const def = LAYOUT_DEFS.find((l) => l.id === page.layout);

  return (
    <div className="flex items-center justify-center gap-2" style={{ width, height: TOOLS_BAR_H }}>
      <TemplatesMenu page={page} layouts={layouts} />
      {def?.fields.image && <ImageMenu page={page} optional={def.fields.image === "optional"} />}
    </div>
  );
}

/** Shared open/close-on-outside-click plumbing for the two dropdowns below. */
function useMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return { open, setOpen, ref };
}

function TemplatesMenu({ page, layouts }: { page: StoryPage; layouts: typeof LAYOUT_DEFS }) {
  const updatePage = useEditor((s) => s.updatePage);
  const { open, setOpen, ref } = useMenu();

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} title="Layout" aria-label="Layout" className={trigger}>
        <LayoutTemplate size={19} strokeWidth={1.75} />
      </button>
      {open && (
        <div role="radiogroup" aria-label="Layout da página" className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="grid grid-cols-3 gap-2">
            {layouts.map((l) => {
              const active = l.id === page.layout;
              return (
                <button
                  key={l.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    updatePage(page.id, { layout: l.id });
                    setOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] leading-tight ${
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <LayoutIcon id={l.id} />
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** A handful of the built-in patterns, offered as one-click presets. */
const IMAGE_PRESETS = [DEFAULT_IMAGES[0], DEFAULT_IMAGES[2], DEFAULT_IMAGES[5], DEFAULT_IMAGES[7]];

const swatch = "h-11 w-11 shrink-0 rounded-lg border";
const swatchActive = "border-indigo-500 ring-2 ring-indigo-500";
const swatchIdle = "border-neutral-200 dark:border-neutral-700";

function ImageMenu({ page, optional }: { page: StoryPage; optional: boolean }) {
  const updatePage = useEditor((s) => s.updatePage);
  const { upload, busy, error } = usePageImageUpload();
  const { open, setOpen, ref } = useMenu();
  const input = useRef<HTMLInputElement>(null);

  const choose = (imageUrl: string | undefined) => {
    updatePage(page.id, { imageUrl });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} title="Imagem" aria-label="Imagem" className={`${trigger} relative`}>
        <ImagePlus size={19} strokeWidth={1.75} />
        {page.imageUrl && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />}
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <p className="mb-2 text-xs font-medium text-neutral-500">Imagem{optional ? " (opcional)" : ""}</p>
          <div className="grid grid-cols-3 gap-2">
            {IMAGE_PRESETS.map((src) => (
              <button key={src} onClick={() => choose(src)} title="Usar esta imagem" className={`${swatch} ${page.imageUrl === src ? swatchActive : swatchIdle} overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- small local preset thumbnail */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            <button
              onClick={() => choose(undefined)}
              title="Sem imagem"
              aria-label="Sem imagem"
              className={`${swatch} ${!page.imageUrl ? swatchActive : swatchIdle} grid place-items-center text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white`}
            >
              <ImageOff size={18} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => input.current?.click()}
              disabled={busy}
              title="Carregar imagem"
              aria-label="Carregar imagem"
              className={`${swatch} ${swatchIdle} grid place-items-center text-neutral-500 hover:text-neutral-800 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-white`}
            >
              {busy ? <Loader2 size={18} strokeWidth={1.75} className="animate-spin" /> : <Upload size={18} strokeWidth={1.75} />}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              upload(page.id, e.target.files?.[0]);
              e.target.value = "";
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
