"use client";

import { AlignCenterHorizontal, AlignLeft, AlignRight, ArrowLeft, ImageOff, ImagePlus, Loader2, Maximize2, Minimize2, Palette, PanelTop, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { getLayoutDef, LAYOUT_DEFS } from "@/components/story/layouts";
import { DEFAULT_IMAGES } from "@/lib/defaults";
import type { ImageFit, PaperColor, StoryPage } from "@/types/story";
import { LayoutIcon } from "./LayoutIcon";
import { usePageImageUpload } from "./usePageImage";

type Tool = "paper" | "image" | "layout";
type Change = (patch: Partial<StoryPage>) => void;

/** A square tile, the unit both levels of the menu are built from. */
const tile = "grid h-14 w-14 shrink-0 place-items-center rounded-xl border bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";
const idle = "border-neutral-200 shadow-sm hover:border-neutral-300 dark:border-neutral-700";
const active = "border-indigo-500 ring-2 ring-indigo-500";
const row = "no-scrollbar flex items-start gap-2 overflow-x-auto";

/**
 * The edit screen's bottom menu, two levels deep. The first shows the tools (Papel, Imagem,
 * Layout) and "Guardar"; tapping a tool swaps in its options behind a back arrow. Choosing an
 * option applies it to the draft right away and stays on that level, so options can be compared.
 */
export function EditMenu({ page, isCover, onChange, onSave }: { page: StoryPage; isCover: boolean; onChange: Change; onSave: () => void }) {
  const [tool, setTool] = useState<Tool | null>(null);
  const hasImage = !!getLayoutDef(page.layout)?.fields.image;
  // Switching to a layout without an image leaves nothing for the image menu to show.
  const open = tool === "image" && !hasImage ? null : tool;

  return (
    <div className="shrink-0 border-t border-neutral-200 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-neutral-800 dark:bg-neutral-900">
      {open === null ? (
        <div className="flex items-center gap-2">
          <button onClick={() => setTool("paper")} title="Papel" aria-label="Papel" className={`${tile} ${idle}`}>
            <Palette size={22} strokeWidth={1.75} />
          </button>
          {hasImage && (
            <button onClick={() => setTool("image")} title="Imagem" aria-label="Imagem" className={`${tile} ${idle}`}>
              <ImagePlus size={22} strokeWidth={1.75} />
            </button>
          )}
          <button onClick={() => setTool("layout")} title="Layout" aria-label="Layout" className={`${tile} ${idle}`}>
            <PanelTop size={22} strokeWidth={1.75} />
          </button>
          <div className="flex-1" />
          <button onClick={onSave} className="h-14 shrink-0 rounded-xl bg-[#a3ffa3] px-7 text-sm font-semibold text-[#1b1a17] hover:brightness-95">
            Guardar
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <button onClick={() => setTool(null)} title="Voltar" aria-label="Voltar" className={`${tile} ${idle}`}>
            <ArrowLeft size={22} strokeWidth={1.75} />
          </button>
          <div className="min-w-0 flex-1">
            {open === "paper" && <PaperOptions page={page} onChange={onChange} />}
            {open === "image" && <ImageOptions page={page} onChange={onChange} />}
            {open === "layout" && <LayoutOptions page={page} isCover={isCover} onChange={onChange} />}
          </div>
        </div>
      )}
    </div>
  );
}

const PAPER_OPTIONS: { id: PaperColor; label: string; swatch: string }[] = [
  { id: "white", label: "Branco", swatch: "#ffffff" },
  { id: "yellow", label: "Amarelo", swatch: "#fbf0d1" },
];

function PaperOptions({ page, onChange }: { page: StoryPage; onChange: Change }) {
  return (
    <div className={row} role="radiogroup" aria-label="Cor do papel">
      {PAPER_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          role="radio"
          aria-checked={page.paper === opt.id}
          title={opt.label}
          aria-label={opt.label}
          onClick={() => onChange({ paper: opt.id })}
          className={`${tile} ${page.paper === opt.id ? active : idle}`}
          style={{ background: opt.swatch }}
        />
      ))}
    </div>
  );
}

/** A handful of the built-in patterns, offered as one-click presets. */
const IMAGE_PRESETS = [DEFAULT_IMAGES[0], DEFAULT_IMAGES[2], DEFAULT_IMAGES[5], DEFAULT_IMAGES[7]];

const FIT_OPTIONS: { id: ImageFit; label: string; Icon: typeof Maximize2 }[] = [
  { id: "fill", label: "Preencher", Icon: Maximize2 },
  { id: "real", label: "Tamanho real", Icon: Minimize2 },
  { id: "center", label: "Centrada", Icon: AlignCenterHorizontal },
  { id: "left", label: "Esquerda", Icon: AlignLeft },
  { id: "right", label: "Direita", Icon: AlignRight },
];

function ImageOptions({ page, onChange }: { page: StoryPage; onChange: Change }) {
  const { upload, busy, error } = usePageImageUpload();
  const input = useRef<HTMLInputElement>(null);
  const fit = page.imageFit ?? "fill";

  return (
    <>
      <div className={row}>
        {IMAGE_PRESETS.map((src) => (
          <button key={src} onClick={() => onChange({ imageUrl: src })} title="Usar esta imagem" className={`${tile} ${page.imageUrl === src ? active : idle} overflow-hidden`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small local preset thumbnail */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
        <button onClick={() => onChange({ imageUrl: undefined })} title="Sem imagem" aria-label="Sem imagem" className={`${tile} ${!page.imageUrl ? active : idle}`}>
          <ImageOff size={20} strokeWidth={1.75} />
        </button>
        <button onClick={() => input.current?.click()} disabled={busy} title="Carregar imagem" aria-label="Carregar imagem" className={`${tile} ${idle} disabled:opacity-50`}>
          {busy ? <Loader2 size={20} strokeWidth={1.75} className="animate-spin" /> : <Upload size={20} strokeWidth={1.75} />}
        </button>
      </div>
      {page.imageUrl && (
        <div className={`${row} mt-2`} role="radiogroup" aria-label="Enquadramento da imagem">
          {FIT_OPTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="radio"
              aria-checked={fit === id}
              title={label}
              aria-label={label}
              onClick={() => onChange({ imageFit: id })}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border ${
                fit === id ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              <Icon size={19} strokeWidth={1.75} />
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const imageUrl = await upload(e.target.files?.[0]);
          e.target.value = "";
          if (imageUrl) onChange({ imageUrl });
        }}
      />
    </>
  );
}

function LayoutOptions({ page, isCover, onChange }: { page: StoryPage; isCover: boolean; onChange: Change }) {
  const layouts = LAYOUT_DEFS.filter((l) => l.kind === (isCover ? "cover" : "inner"));
  return (
    <div className={row} role="radiogroup" aria-label="Layout da página">
      {layouts.map((l) => {
        const on = l.id === page.layout;
        return (
          <button
            key={l.id}
            role="radio"
            aria-checked={on}
            onClick={() => onChange({ layout: l.id })}
            className={`flex w-[68px] shrink-0 flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center text-[11px] leading-tight ${
              on ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300"
            }`}
          >
            <LayoutIcon id={l.id} />
            {l.name}
          </button>
        );
      })}
    </div>
  );
}
