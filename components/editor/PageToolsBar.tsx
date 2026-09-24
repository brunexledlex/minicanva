"use client";

import { ImagePlus, LayoutTemplate } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LAYOUT_DEFS } from "@/components/story/layouts";
import { resolveImageUrl } from "@/lib/images";
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

function ImageMenu({ page, optional }: { page: StoryPage; optional: boolean }) {
  const updatePage = useEditor((s) => s.updatePage);
  const { upload, busy, error } = usePageImageUpload();
  const { open, setOpen, ref } = useMenu();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setPreview(null);
    if (page.imageUrl) resolveImageUrl(page.imageUrl).then((u) => live && setPreview(u), () => {});
    return () => {
      live = false;
    };
  }, [page.imageUrl]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} title="Imagem" aria-label="Imagem" className={`${trigger} relative`}>
        <ImagePlus size={19} strokeWidth={1.75} />
        {page.imageUrl && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />}
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <p className="mb-2 text-xs font-medium text-neutral-500">Imagem{optional ? " (opcional)" : ""}</p>
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob/object URLs */}
              {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={20} strokeWidth={1.5} />}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => input.current?.click()} disabled={busy} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                {busy ? "A carregar…" : page.imageUrl ? "Trocar" : "Carregar"}
              </button>
              {page.imageUrl && (
                <button onClick={() => updatePage(page.id, { imageUrl: undefined })} className="rounded-lg px-2 py-1.5 text-sm text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  Remover
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-400">{error ?? "Também podes arrastar uma imagem para a página."}</p>
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              upload(page.id, e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
