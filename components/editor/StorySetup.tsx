"use client";

import { useEffect, useRef, useState } from "react";
import { PageStage } from "@/components/story/PageStage";
import { FORMATS } from "@/lib/formats";
import { allPages, useEditor } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import { Icon } from "./Icon";

const label = "mb-2 block text-xs font-medium text-neutral-500";
const card = "rounded-xl border bg-white dark:bg-neutral-900";
const cardActive = "border-indigo-500 ring-1 ring-indigo-500";
const cardIdle = "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700";

/** Step 1: the story-wide settings (name, format, theme), with a live preview. */
export function StorySetup({ fontsRev }: { fontsRev: number | null }) {
  const story = useEditor((s) => s.story);
  const { setName, setTheme, setStep } = useEditor.getState();
  const format = FORMATS[story.format];
  // Name and theme apply live as they're edited; remembering the values from when this
  // step opened lets "Cancelar" put them back instead of just leaving the edits in place.
  const [initial] = useState(() => ({ name: story.name, themeId: story.theme.id }));
  const cancel = () => {
    setName(initial.name);
    setTheme(initial.themeId);
    setStep("edit");
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-8 px-5 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12 md:px-10 md:py-12">
        <div className="order-2 md:order-1">
          <p className="mb-8 inline-flex items-center gap-2 rounded-full bg-neutral-200/70 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <span className="rounded-[2px] border-[1.5px] border-current" style={{ width: 9, height: (9 * format.height) / format.width }} />
            {format.label} · {story.format} · {format.width}×{format.height}
          </p>

          <label className="mb-7 block">
            <span className={label}>Título</span>
            <input
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900"
              value={story.name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

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

          <div className="flex gap-3">
            <button
              onClick={cancel}
              className="flex h-11 flex-1 items-center justify-center rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-100 sm:flex-none sm:px-6 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancelar
            </button>
            <button
              onClick={() => setStep("edit")}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-700 sm:flex-none sm:px-6 dark:bg-white dark:text-neutral-900"
            >
              Páginas
              <Icon name="arrow_forward" className="!text-[18px]" />
            </button>
          </div>
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

/** Live preview of the cover, labelled with the theme it is shown in. */
function Preview({ fontsRev }: { fontsRev: number | null }) {
  const story = useEditor((s) => s.story);
  const pageCount = allPages(story).length;
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

  const maxH = boxW < 500 ? 300 : 460;
  const scale = boxW ? Math.min(boxW / width, maxH / height) : 0;

  return (
    <div ref={ref} className="flex justify-center pb-4">
      {fontsRev !== null && scale > 0 && (
        <div className="relative shadow-[0_10px_30px_rgba(0,0,0,.15)]">
          <PageStage page={story.cover} theme={story.theme} format={story.format} storyName={story.name} pageNumber={1} pageCount={pageCount} scale={scale} fontsRev={fontsRev} />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white shadow-md dark:bg-white dark:text-neutral-900">
            {story.theme.name}
          </span>
        </div>
      )}
    </div>
  );
}
