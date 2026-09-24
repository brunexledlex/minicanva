"use client";

import { useEffect, useRef, useState } from "react";
import { getLayoutDef } from "@/components/story/layouts";
import { resolveImageUrl } from "@/lib/images";
import { allPages, useEditor } from "@/lib/store";
import { resolveTheme, THEMES } from "@/lib/themes";
import type { StoryPage, Theme } from "@/types/story";
import { Icon } from "./Icon";
import { usePageImageUpload } from "./usePageImage";

const label = "mb-1.5 block text-xs font-medium text-neutral-500";
const field =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-900";
const section = "border-b border-neutral-200 px-4 py-5 dark:border-neutral-800";
const heading = "mb-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500";

export function Sidebar() {
  const story = useEditor((s) => s.story);
  const selectedId = useEditor((s) => s.selectedId);
  const pages = allPages(story);
  const index = Math.max(0, pages.findIndex((p) => p.id === selectedId));
  const page = pages[index];

  return (
    <aside className="w-full shrink-0 border-t border-neutral-200 bg-white md:w-80 md:overflow-y-auto md:border-l md:border-t-0 dark:border-neutral-800 dark:bg-neutral-900">
      <PageSection page={page} index={index} storyTheme={story.theme} />
    </aside>
  );
}

function PageSection({ page, index, storyTheme }: { page: StoryPage; index: number; storyTheme: Theme }) {
  const updatePage = useEditor((s) => s.updatePage);
  const isCover = index === 0;
  const def = getLayoutDef(page.layout);
  const set = (patch: Partial<StoryPage>) => updatePage(page.id, patch);

  return (
    <section className={section}>
      <h2 className={heading}>{isCover ? "Capa" : `Página ${String(index + 1).padStart(2, "0")}`}</h2>

      {def?.fields.title && (
        <label className="mb-4 block">
          <span className={label}>{def.fields.title}</span>
          <textarea rows={2} className={field + " resize-y"} value={page.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
        </label>
      )}
      {def?.fields.body && (
        <label className="mb-4 block">
          <span className={label}>{def.fields.body}</span>
          <textarea rows={def.fields.body === "Texto" ? 6 : 2} className={field + " resize-y"} value={page.body ?? ""} onChange={(e) => set({ body: e.target.value })} />
        </label>
      )}
      {def?.fields.image && <ImageField page={page} optional={def.fields.image === "optional"} />}

      <PageThemeField page={page} storyTheme={storyTheme} />
    </section>
  );
}

function ImageField({ page, optional }: { page: StoryPage; optional: boolean }) {
  const updatePage = useEditor((s) => s.updatePage);
  const { upload, busy, error } = usePageImageUpload();
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
    <div className="mb-5">
      <span className={label}>Imagem{optional ? " (opcional)" : ""}</span>
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob/object URLs */}
          {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Icon name="image" />}
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
  );
}

const COLOR_FIELDS: [keyof Theme["colors"], string][] = [
  ["background", "Fundo"],
  ["text", "Texto"],
  ["accent", "Destaque"],
];

/** Per-page theme override: pick another theme and/or tweak its three colours. */
function PageThemeField({ page, storyTheme }: { page: StoryPage; storyTheme: Theme }) {
  const updatePage = useEditor((s) => s.updatePage);
  const resolved = resolveTheme(storyTheme, page.themeOverride);
  const override = page.themeOverride;

  return (
    <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/60">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">Tema desta página</span>
        {override && (
          <button onClick={() => updatePage(page.id, { themeOverride: undefined })} className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
            Repor
          </button>
        )}
      </div>
      <select
        className={field + " mb-3"}
        value={override?.id ?? ""}
        onChange={(e) => {
          const t = THEMES.find((x) => x.id === e.target.value);
          updatePage(page.id, { themeOverride: t ? { ...t } : undefined });
        }}
      >
        <option value="">Igual ao Story ({storyTheme.name})</option>
        {THEMES.filter((t) => t.id !== storyTheme.id).map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-3 gap-2">
        {COLOR_FIELDS.map(([key, name]) => (
          <label key={key} className="text-[11px] text-neutral-500">
            {name}
            <input
              type="color"
              className="mt-1 block h-8 w-full cursor-pointer rounded-md border border-neutral-200 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-900"
              value={resolved.colors[key]}
              onChange={(e) => updatePage(page.id, { themeOverride: { ...override, colors: { ...resolved.colors, [key]: e.target.value } } })}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
