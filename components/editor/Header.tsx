"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { exportPagePng, exportPdf, exportZip } from "@/lib/export";
import { FORMATS } from "@/lib/formats";
import { type Step, useEditor } from "@/lib/store";
import type { StoryFormat } from "@/types/story";
import { Icon } from "./Icon";

const FORMAT_KEYS = Object.keys(FORMATS) as StoryFormat[];

/** Outline of the format's proportions, for the "Novo" menu. */
function FormatShape({ format }: { format: StoryFormat }) {
  const { width, height } = FORMATS[format];
  return (
    <span className="flex h-7 w-6 shrink-0 items-center justify-center">
      <span className="rounded-[2px] border-2 border-neutral-400" style={{ width: 16, height: (16 * height) / width }} />
    </span>
  );
}

export function Header({ ready }: { ready: boolean }) {
  const newStory = useEditor((s) => s.newStory);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">mc</span>
      <span className="hidden font-semibold tracking-tight md:inline">minicanva</span>
      <Stepper />
      <div className="flex-1" />
      <Menu
        label="Novo"
        icon="note_add"
        items={FORMAT_KEYS.map((f) => {
            const { width, height, label } = FORMATS[f];
            return {
              label,
              hint: `${f} · ${width}×${height}`,
              icon: <FormatShape format={f} />,
              onClick: () => confirm(`Começar um Story novo em ${label.toLowerCase()} (${f})? O atual é substituído.`) && newStory(f),
            };
          })}
      />
      <ExportMenu ready={ready} />
    </header>
  );
}

const STEPS: { id: Step; label: string }[] = [
  { id: "setup", label: "Story" },
  { id: "edit", label: "Páginas" },
];

/** 1 Story › 2 Páginas — both steps stay reachable at any time. */
function Stepper() {
  const step = useEditor((s) => s.step);
  const setStep = useEditor((s) => s.setStep);
  return (
    <nav aria-label="Passos" className="flex items-center gap-0.5 md:ml-4">
      {STEPS.map((st, i) => {
        const active = st.id === step;
        return (
          <span key={st.id} className="flex items-center gap-0.5">
            {i > 0 && <Icon name="chevron_right" className="!text-[16px] text-neutral-300 dark:text-neutral-600" />}
            <button
              onClick={() => setStep(st.id)}
              aria-current={active ? "step" : undefined}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm ${active ? "font-medium" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold ${
                  active ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                }`}
              >
                {i + 1}
              </span>
              {st.label}
            </button>
          </span>
        );
      })}
    </nav>
  );
}

type Item = { label: string; hint?: string; icon?: ReactNode; onClick: () => void };

type MenuProps = { label: string; icon: string; items: Item[]; primary?: boolean; /** Controls above the items that don't close the menu. */ header?: ReactNode };

function Menu({ label, icon, items, primary, header }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium ${
          primary ? "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`}
      >
        <Icon name={icon} className="!text-[18px]" />
        <span className="hidden sm:inline">{label}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-64 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          {header}
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {it.icon}
              <span className="min-w-0">
                {it.label}
                {it.hint && <span className="block text-xs tabular-nums text-neutral-500">{it.hint}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ExportMenu({ ready }: { ready: boolean }) {
  const format = useEditor((s) => s.story.format);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = FORMATS[format];
  const size = (s: number) => `${width * s}×${height * s}`;

  const run = (fn: (scale: number) => Promise<void>) => async () => {
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
  const st = () => useEditor.getState();

  const resolution = (
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
  );

  return (
    <div className="flex items-center gap-2">
      {error && <span className="hidden text-xs text-red-600 md:inline">{error}</span>}
      <Menu
        label={busy ? "A exportar…" : "Exportar"}
        icon={busy ? "hourglass_top" : "download"}
        primary
        header={resolution}
        items={[
          { label: "PNG desta página", hint: `${size(scale)} px`, onClick: run((s) => exportPagePng(st().story, st().selectedId, s)) },
          { label: "Todas as páginas (ZIP)", hint: "Um PNG por página", onClick: run((s) => exportZip(st().story, s)) },
          { label: "PDF no tamanho do formato", hint: "Uma página do PDF por página", onClick: run((s) => exportPdf(st().story, "format", s)) },
          { label: "PDF em A4", hint: "Cada página centrada numa folha A4", onClick: run((s) => exportPdf(st().story, "a4", s)) },
        ]}
      />
    </div>
  );
}
