"use client";

import { Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { exportPagePng, exportPdf, exportZip } from "@/lib/export";
import { FORMATS } from "@/lib/formats";
import { useEditor } from "@/lib/store";

/** The story screen's download icon: resolution plus the four exports, in a dropdown. */
export function ExportMenu({ ready, className }: { ready: boolean; className: string }) {
  const format = useEditor((s) => s.story.format);
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const { width, height } = FORMATS[format];
  const size = (s: number) => `${width * s}×${height * s}`;
  const st = () => useEditor.getState();

  const run = (fn: (scale: number) => Promise<void>) => async () => {
    setOpen(false);
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn(scale);
    } catch (e) {
      setError(e instanceof Error ? e.message : "A exportação falhou.");
    } finally {
      setBusy(false);
    }
  };

  const items = [
    { label: "PNG desta página", hint: `${size(scale)} px`, onClick: run((s) => exportPagePng(st().story, st().selectedId, s)) },
    { label: "Todas as páginas (ZIP)", hint: "Um PNG por página", onClick: run((s) => exportZip(st().story, s)) },
    { label: "PDF no tamanho do formato", hint: "Uma página do PDF por página", onClick: run((s) => exportPdf(st().story, "format", s)) },
    { label: "PDF em A4", hint: "Cada página centrada numa folha A4", onClick: run((s) => exportPdf(st().story, "a4", s)) },
  ];

  return (
    <div ref={ref} className="relative flex items-center">
      {error && <span className="mr-2 hidden text-xs text-red-600 md:inline">{error}</span>}
      <button onClick={() => setOpen((o) => !o)} title={error ?? "Exportar"} aria-label="Exportar" disabled={!ready} className={className}>
        {busy ? <Loader2 size={20} strokeWidth={1.75} className="animate-spin" /> : <Download size={20} strokeWidth={1.75} />}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-30 w-64 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mb-1 border-b border-neutral-200 px-2 pb-2 pt-1.5 dark:border-neutral-700">
            <span className="mb-1.5 block text-xs font-medium text-neutral-500">Resolução</span>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800" role="radiogroup" aria-label="Resolução">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={scale === s}
                  onClick={() => setScale(s)}
                  className={`rounded-md px-2 py-1 text-left text-xs ${scale === s ? "bg-white shadow-sm dark:bg-neutral-700" : "text-neutral-500"}`}
                >
                  <span className="block font-semibold">{s}×</span>
                  <span className="block tabular-nums">{size(s)}</span>
                </button>
              ))}
            </div>
          </div>
          {items.map((it) => (
            <button key={it.label} onClick={it.onClick} className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
              {it.label}
              <span className="text-xs tabular-nums text-neutral-500">{it.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
