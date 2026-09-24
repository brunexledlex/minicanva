"use client";

import { useEffect, useRef, useState } from "react";
import { PageStage } from "@/components/story/PageStage";
import { FORMATS } from "@/lib/formats";
import { allPages, useEditor } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import type { StoryFormat } from "@/types/story";
import { Icon } from "./Icon";

const label = "mb-2 block text-xs font-medium text-neutral-500";
const card = "rounded-xl border bg-white dark:bg-neutral-900";
const cardActive = "border-indigo-500 ring-1 ring-indigo-500";
const cardIdle = "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700";

/** Step 1: the story-wide settings (name, format, theme), with a live preview. */
export function StorySetup({ fontsRev }: { fontsRev: number | null }) {
  const story = useEditor((s) => s.story);
  const { setName, setFormat, setTheme, setStep } = useEditor.getState();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-8 md:grid-cols-2 md:gap-12 md:px-10 md:py-12">
        <div className="order-2 md:order-1">
          <h1 className="text-2xl font-semibold tracking-tight">Configura o teu Story</h1>
          <p className="mb-8 mt-1 text-sm text-neutral-500">O nome, o formato e o tema valem para todas as páginas. Podes voltar a este passo a qualquer momento.</p>

          <label className="mb-7 block">
            <span className={label}>Nome</span>
            <input
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900"
              value={story.name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <span className={label}>Formato</span>
          <div className="mb-7 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Formato">
            {(Object.keys(FORMATS) as StoryFormat[]).map((f) => {
              const { width, height, label: name } = FORMATS[f];
              const active = f === story.format;
              return (
                <button
                  key={f}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFormat(f)}
                  className={`${card} ${active ? cardActive : cardIdle} flex flex-col items-center gap-2 px-2 pb-3 pt-4`}
                >
                  <span className="flex h-10 items-end">
                    <span className={`rounded-[3px] border-2 ${active ? "border-indigo-500" : "border-neutral-400"}`} style={{ width: 22, height: (22 * height) / width }} />
                  </span>
                  <span className={`text-sm font-medium ${active ? "text-indigo-700 dark:text-indigo-300" : ""}`}>{name}</span>
                  <span className="text-center text-[11px] leading-tight tabular-nums text-neutral-400">
                    {f}
                    <br />
                    {width}×{height}
                  </span>
                </button>
              );
            })}
          </div>

          <span className={label}>Tema</span>
          <div className="mb-8 grid gap-2" role="radiogroup" aria-label="Tema">
            {THEMES.map((t) => {
              const active = t.id === story.theme.id;
              return (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(t.id)}
                  className={`${card} ${active ? cardActive : cardIdle} flex items-center gap-3 p-2.5 text-left`}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-lg font-bold" style={{ background: t.colors.background, color: t.colors.text, fontFamily: `"${t.fontHeading}"` }}>
                    Aa
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="block truncate text-xs text-neutral-500">
                      {t.fontHeading}
                      {t.fontBody !== t.fontHeading ? ` + ${t.fontBody}` : ""}
                    </span>
                  </span>
                  <span className="flex gap-1">
                    {Object.values(t.colors).map((c) => (
                      <span key={c} className="h-3 w-3 rounded-full border border-black/10" style={{ background: c }} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep("edit")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-700 sm:w-auto sm:px-6 dark:bg-white dark:text-neutral-900"
          >
            Continuar para as páginas
            <Icon name="arrow_forward" className="!text-[18px]" />
          </button>
        </div>

        <div className="order-1 md:order-2">
          <div className="md:sticky md:top-12">
            <Preview fontsRev={fontsRev} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cover and first inner page side by side, re-rendered live as settings change. */
function Preview({ fontsRev }: { fontsRev: number | null }) {
  const story = useEditor((s) => s.story);
  const pages = allPages(story).slice(0, 2);
  const { width, height } = FORMATS[story.format];

  const ref = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gap = 12;
  const maxH = boxW < 500 ? 260 : 440;
  const scale = boxW ? Math.min((boxW - gap * (pages.length - 1)) / pages.length / width, maxH / height) : 0;

  return (
    <div ref={ref}>
      <div className="flex justify-center" style={{ gap }}>
        {fontsRev !== null &&
          scale > 0 &&
          pages.map((page, i) => (
            <div key={page.id} className="shadow-[0_10px_30px_rgba(0,0,0,.15)]">
              <PageStage page={page} theme={story.theme} format={story.format} storyName={story.name} pageNumber={i + 1} pageCount={allPages(story).length} scale={scale} fontsRev={fontsRev} />
            </div>
          ))}
      </div>
      <p className="mt-3 text-center text-xs text-neutral-400">Pré-visualização da capa e da primeira página</p>
    </div>
  );
}
