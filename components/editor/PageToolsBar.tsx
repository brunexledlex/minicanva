"use client";

import { AlignCenterHorizontal, AlignLeft, AlignRight, ImageOff, ImagePlus, LayoutTemplate, Loader2, Maximize2, Minimize2, Palette, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LAYOUT_DEFS } from "@/components/story/layouts";
import { DEFAULT_IMAGES } from "@/lib/defaults";
import { useEditor } from "@/lib/store";
import type { ImageFit, PaperColor, StoryPage } from "@/types/story";
import { LayoutIcon } from "./LayoutIcon";
import { usePageImageUpload } from "./usePageImage";

export const TOOLS_BAR_H = 48;

const trigger =
  "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white";

/** A dropdown's panel: spans the toolbar's own width (not just its trigger's), so it reads as one consistent drawer regardless of which button opened it — and its content scrolls horizontally rather than wrapping, which suits narrow screens. */
const panel = "absolute inset-x-0 bottom-full z-20 mb-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900";
const row = "no-scrollbar flex items-start gap-2 overflow-x-auto";

/** Icon + label button, for one option in a horizontal picker (layout, paper colour). */
const chip = "flex shrink-0 flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center text-[11px] leading-tight";
const chipActive = "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";
const chipIdle = "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300";

/** Icon-only square button, for a picker whose options are self-explanatory (image fit modes). */
const iconBtn = "grid h-12 w-12 shrink-0 place-items-center rounded-lg border";

/** Row under the page, always left-aligned: "Papel" (background), "Imagem" (when the layout has one) and "Layout" — each opens a horizontal, scrollable dropdown above the page. */
export function PageToolsBar({ page, isCover, width }: { page: StoryPage; isCover: boolean; width: number }) {
  const layouts = LAYOUT_DEFS.filter((l) => l.kind === (isCover ? "cover" : "inner"));
  const def = LAYOUT_DEFS.find((l) => l.id === page.layout);

  return (
    <div className="relative flex items-center justify-start gap-2" style={{ width, height: TOOLS_BAR_H }}>
      <PaperMenu page={page} />
      {def?.fields.image && <ImageMenu page={page} optional={def.fields.image === "optional"} />}
      <TemplatesMenu page={page} layouts={layouts} />
    </div>
  );
}

/** Shared open/close-on-outside-click plumbing for the dropdowns below. */
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

const PAPER_OPTIONS: { id: PaperColor; label: string; swatch: string }[] = [
  { id: "white", label: "Branco", swatch: "#ffffff" },
  { id: "yellow", label: "Amarelo", swatch: "#fbf0d1" },
];

function PaperMenu({ page }: { page: StoryPage }) {
  const updatePage = useEditor((s) => s.updatePage);
  const { open, setOpen, ref } = useMenu();

  return (
    <div ref={ref}>
      <button onClick={() => setOpen((o) => !o)} title="Papel" aria-label="Papel" className={trigger}>
        <Palette size={19} strokeWidth={1.75} />
      </button>
      {open && (
        <div className={panel} role="radiogroup" aria-label="Cor do papel">
          <div className={row}>
            {PAPER_OPTIONS.map((opt) => {
              const active = page.paper === opt.id;
              return (
                <button
                  key={opt.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    updatePage(page.id, { paper: opt.id });
                    setOpen(false);
                  }}
                  className={`${chip} ${active ? chipActive : chipIdle}`}
                >
                  <span className="h-6 w-6 rounded-full border border-black/10 dark:border-white/20" style={{ background: opt.swatch }} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TemplatesMenu({ page, layouts }: { page: StoryPage; layouts: typeof LAYOUT_DEFS }) {
  const updatePage = useEditor((s) => s.updatePage);
  const { open, setOpen, ref } = useMenu();

  return (
    <div ref={ref}>
      <button onClick={() => setOpen((o) => !o)} title="Layout" aria-label="Layout" className={trigger}>
        <LayoutTemplate size={19} strokeWidth={1.75} />
      </button>
      {open && (
        <div className={panel} role="radiogroup" aria-label="Layout da página">
          <div className={row}>
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
                  className={`${chip} ${active ? chipActive : chipIdle} w-[68px]`}
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

const FIT_OPTIONS: { id: ImageFit; label: string; Icon: typeof Maximize2 }[] = [
  { id: "fill", label: "Preencher", Icon: Maximize2 },
  { id: "real", label: "Tamanho real", Icon: Minimize2 },
  { id: "center", label: "Centrada", Icon: AlignCenterHorizontal },
  { id: "left", label: "Esquerda", Icon: AlignLeft },
  { id: "right", label: "Direita", Icon: AlignRight },
];

function ImageMenu({ page, optional }: { page: StoryPage; optional: boolean }) {
  const updatePage = useEditor((s) => s.updatePage);
  const { upload, busy, error } = usePageImageUpload();
  const { open, setOpen, ref } = useMenu();
  const input = useRef<HTMLInputElement>(null);

  const choose = (imageUrl: string | undefined) => {
    updatePage(page.id, { imageUrl });
    setOpen(false);
  };
  const fit = page.imageFit ?? "fill";

  return (
    <div ref={ref}>
      <button onClick={() => setOpen((o) => !o)} title="Imagem" aria-label="Imagem" className={`${trigger} relative`}>
        <ImagePlus size={19} strokeWidth={1.75} />
        {page.imageUrl && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />}
      </button>
      {open && (
        <div className={panel}>
          <p className="mb-1.5 px-0.5 text-xs font-medium text-neutral-500">Imagem{optional ? " (opcional)" : ""}</p>
          <div className={row}>
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
          {page.imageUrl && (
            <div className={`${row} mt-2 border-t border-neutral-100 pt-2 dark:border-neutral-800`} role="radiogroup" aria-label="Enquadramento da imagem">
              {FIT_OPTIONS.map(({ id, label, Icon }) => {
                const active = fit === id;
                return (
                  <button
                    key={id}
                    role="radio"
                    aria-checked={active}
                    title={label}
                    aria-label={label}
                    onClick={() => updatePage(page.id, { imageFit: id })}
                    className={`${iconBtn} ${active ? chipActive : chipIdle}`}
                  >
                    <Icon size={19} strokeWidth={1.75} />
                  </button>
                );
              })}
            </div>
          )}
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
