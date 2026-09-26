"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/editor/Icon";
import { pruneUnusedImages, useLibrary } from "@/lib/library";
import { needsThumbnail, scheduleThumbnail } from "@/lib/thumbnails";
import type { Story } from "@/types/story";
import { Book, LABEL_H, PLANK_H } from "./Book";
import { btnPrimary, btnSecondary, Dialog } from "./Dialog";
import { NewStoryDialog } from "./NewStoryDialog";

const MIN_COVER_W = 150;
const serif = "font-['Playfair_Display',serif]";

type Sort = "recent" | "name";

/** The entry screen: every saved story as its own cover, standing on shelves. */
export default function Shelf() {
  const stories = useLibrary((s) => s.stories);
  const [sort, setSort] = useState<Sort>("recent");
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<Story | null>(null);
  const [deleting, setDeleting] = useState<Story | null>(null);

  const sorted = useMemo(
    () => [...stories].sort(sort === "recent" ? (a, b) => b.updatedAt - a.updatedAt : (a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" })),
    [stories, sort],
  );

  // Stories saved before thumbnails existed, or whose cover changed moments ago in the editor.
  useEffect(() => {
    for (const s of stories) if (needsThumbnail(s)) scheduleThumbnail(s.id, 0);
  }, [stories]);

  // Real shelves rather than one CSS grid, so each row gets its own full-width board, even a
  // half-empty last one. The columns follow the width, like repeat(auto-fill, minmax(150px, 1fr)).
  const mainRef = useRef<HTMLElement>(null);
  const [grid, setGrid] = useState({ cols: 0, gap: 0 });
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      const gap = w < 640 ? 18 : 32;
      setGrid({ cols: Math.max(2, Math.floor((w + gap) / (MIN_COVER_W + gap))), gap });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const rows: Story[][] = [];
  for (let i = 0; grid.cols && i < sorted.length; i += grid.cols) rows.push(sorted.slice(i, i + grid.cols));

  return (
    <div className="min-h-dvh bg-[#f3ede3] text-[#1b1a17] dark:bg-[#15130f] dark:text-[#ece6db]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f3ede3]/85 backdrop-blur dark:border-white/5 dark:bg-[#15130f]/85">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:px-8">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1b1a17] text-xs font-bold text-white dark:bg-[#ece6db] dark:text-[#1b1a17]">mc</span>
          <span className="hidden font-semibold tracking-tight min-[360px]:inline">minicanva</span>
          <div className="flex-1" />
          <button onClick={() => setCreating(true)} className={`${btnPrimary} flex items-center gap-1.5 whitespace-nowrap pl-3`}>
            <Icon name="add" className="!text-[18px]" />
            Novo Story
          </button>
        </div>
      </header>

      <main ref={mainRef} className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-8 md:pt-12">
        {stories.length === 0 ? (
          <EmptyShelf onCreate={() => setCreating(true)} />
        ) : (
          <>
            <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
              <div>
                <h1 className={`${serif} text-3xl font-bold tracking-tight md:text-4xl`}>A tua estante</h1>
                <p className="mt-1 text-sm opacity-60">{stories.length === 1 ? "1 Story" : `${stories.length} Stories`}</p>
              </div>
              {stories.length > 1 && (
                <label>
                  <span className="sr-only">Ordenar</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="h-9 rounded-lg border border-black/10 bg-transparent px-2 text-sm outline-none focus:border-[#c8553d] dark:border-white/15"
                  >
                    <option value="recent">Mais recentes</option>
                    <option value="name">Nome A–Z</option>
                  </select>
                </label>
              )}
            </div>
            {rows.map((row, i) => (
              <div key={i} className="relative mb-4 md:mb-8">
                <Plank />
                <div className="relative grid items-end" style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`, columnGap: grid.gap }}>
                  {row.map((s) => (
                    <Book key={s.id} story={s} onRename={setRenaming} onDelete={setDeleting} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      <NewStoryDialog open={creating} onClose={() => setCreating(false)} />
      <Dialog open={!!renaming} onClose={() => setRenaming(null)} title="Renomear Story">
        {renaming && <RenameForm story={renaming} onDone={() => setRenaming(null)} />}
      </Dialog>
      <Dialog open={!!deleting} onClose={() => setDeleting(null)} title="Apagar Story?">
        {deleting && <DeleteConfirm story={deleting} onDone={() => setDeleting(null)} />}
      </Dialog>
    </div>
  );
}

/** The board the covers stand on. Purely decorative. */
function Plank({ bottom = LABEL_H }: { bottom?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-x-3 rounded-[2px] border-t border-white/70 bg-gradient-to-b from-[#e4d9c7] to-[#cdbea6] shadow-[0_10px_16px_-8px_rgba(80,55,25,.45)] dark:border-white/10 dark:from-[#3b342b] dark:to-[#2a241d] dark:shadow-[0_10px_16px_-8px_rgba(0,0,0,.8)]"
      style={{ bottom, height: PLANK_H }}
    />
  );
}

function EmptyShelf({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center pt-4 text-center md:pt-10">
      <div className="relative mb-8 w-56">
        <Plank bottom={0} />
        <button
          onClick={onCreate}
          aria-label="Criar o primeiro Story"
          className="mx-auto grid aspect-[4/5] w-36 place-items-center rounded-[3px] border-2 border-dashed border-[#1b1a17]/25 text-[#1b1a17]/35 transition hover:-translate-y-1 hover:border-[#1b1a17]/50 hover:text-[#1b1a17]/60 dark:border-white/20 dark:text-white/30 dark:hover:border-white/40 dark:hover:text-white/60"
        >
          <Icon name="add" className="!text-[32px]" />
        </button>
        <div style={{ height: PLANK_H }} />
      </div>
      <h1 className={`${serif} text-2xl font-bold tracking-tight md:text-3xl`}>A tua estante está vazia</h1>
      <p className="mt-2 text-sm opacity-60">Cada Story que criares fica aqui, com a capa à vista, como numa revistaria.</p>
      <button onClick={onCreate} className={`${btnPrimary} mt-6 flex items-center gap-1.5 pl-3`}>
        <Icon name="add" className="!text-[18px]" />
        Criar o primeiro Story
      </button>
    </div>
  );
}

function RenameForm({ story, onDone }: { story: Story; onDone: () => void }) {
  const rename = useLibrary((s) => s.rename);
  const [name, setName] = useState(story.name);
  const input = useRef<HTMLInputElement>(null);
  // Selected up front so typing replaces the old name; the dialog then focuses it (autoFocus).
  useEffect(() => input.current?.select(), []);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const next = name.trim();
        if (next && next !== story.name) rename(story.id, next);
        onDone();
      }}
    >
      <input
        ref={input}
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Nome do Story"
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c8553d] dark:border-neutral-700 dark:bg-neutral-900"
      />
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onDone} className={btnSecondary}>
          Cancelar
        </button>
        <button type="submit" className={btnPrimary}>
          Guardar
        </button>
      </div>
    </form>
  );
}

function DeleteConfirm({ story, onDone }: { story: Story; onDone: () => void }) {
  const remove = useLibrary((s) => s.remove);
  return (
    <>
      <p className="text-sm text-neutral-500">“{story.name}” e todas as suas páginas vão ser apagados deste browser. Não dá para desfazer.</p>
      <div className="mt-5 flex justify-end gap-2">
        <button autoFocus onClick={onDone} className={btnSecondary}>
          Cancelar
        </button>
        <button
          onClick={() => {
            remove(story.id);
            pruneUnusedImages();
            onDone();
          }}
          className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
        >
          Apagar
        </button>
      </div>
    </>
  );
}
