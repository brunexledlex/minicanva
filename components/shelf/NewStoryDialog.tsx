"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormatPicker } from "@/components/editor/FormatPicker";
import { PageStage } from "@/components/story/PageStage";
import { useFontsReady } from "@/components/story/useFontsReady";
import { blankStory } from "@/lib/defaults";
import { FORMATS } from "@/lib/formats";
import { editorHref } from "@/lib/library";
import { useEditor } from "@/lib/store";
import { getTheme, THEME_FONTS, THEMES } from "@/lib/themes";
import type { StoryFormat } from "@/types/story";
import { btnPrimary, Dialog } from "./Dialog";

/** The cover preview's height is fixed and its width follows the chosen format, so a tall
 * (9:16) format doesn't grow the dialog past the screen and force it to scroll. */
const PREVIEW_H = 190;

/** Picks a new story's format and theme, previewing its cover live, then creates it (a cover and one inner page) and opens it in the editor. */
export function NewStoryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const newStory = useEditor((s) => s.newStory);
  const fontsRev = useFontsReady(THEME_FONTS);
  const [name, setName] = useState("");
  const [format, setFormat] = useState<StoryFormat>("4:5");
  const [themeId, setThemeId] = useState(THEMES[0].id);
  // A stand-in cover (title, dek, a random image) that only depends on being open once — so the
  // preview doesn't reshuffle its image every time the format or theme is tried out.
  const [cover] = useState(() => blankStory("4:5").cover);
  const theme = getTheme(themeId);
  const { width, height } = FORMATS[format];
  const previewW = (PREVIEW_H * width) / height;

  const create = () => {
    const id = newStory(format, theme, name.trim() || undefined);
    onClose();
    router.push(editorHref(id));
  };

  return (
    <Dialog open={open} onClose={onClose} title="Novo Story">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
        className="flex flex-col items-center"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          autoFocus
          placeholder="Sem título"
          aria-label="Nome do Story"
          className="mb-4 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c8553d] dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="mb-2 w-full" style={{ maxWidth: previewW }}>
          <FormatPicker format={format} onChange={setFormat} />
        </div>
        <div className="relative shadow-[0_10px_30px_rgba(0,0,0,.15)]" style={{ width: previewW, height: PREVIEW_H }}>
          {fontsRev !== null && (
            <PageStage page={cover} theme={theme} format={format} storyName="" pageNumber={1} pageCount={2} scale={previewW / width} fontsRev={fontsRev} />
          )}
        </div>

        <div className="mt-5 flex w-full gap-2" role="radiogroup" aria-label="Estilo">
          {THEMES.map((t) => {
            const active = t.id === themeId;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setThemeId(t.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-1 ${
                  active ? "border-indigo-500 ring-1 ring-indigo-500" : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700"
                }`}
              >
                <span
                  className="grid h-8 w-full place-items-center rounded-lg text-base font-bold"
                  style={{ background: t.colors.background, color: t.colors.text, fontFamily: `"${t.fontHeading}"` }}
                >
                  Aa
                </span>
                <span className="w-full truncate text-center text-[11px] font-medium">{t.name}</span>
              </button>
            );
          })}
        </div>

        <button type="submit" className={`${btnPrimary} mt-5 w-full`}>
          Criar
        </button>
      </form>
    </Dialog>
  );
}
