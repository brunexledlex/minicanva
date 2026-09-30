"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/editor/Icon";
import { FORMATS } from "@/lib/formats";
import { editorHref, useLibrary } from "@/lib/library";
import { inkHex, paperHex } from "@/lib/palette";
import type { Story } from "@/types/story";

/** Thickness of the shelf board, and the room under it for each cover's name. */
export const PLANK_H = 10;
export const LABEL_H = 40;

// Revealed on hover where there is a mouse; always visible on touch screens, which can't hover.
const reveal = "transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100";

type Props = { story: Story; onRename: (s: Story) => void; onDelete: (s: Story) => void };

/** One story on the shelf: its cover standing on the board, lifting a little on hover like a magazine being pulled out. */
export function Book({ story, onRename, onDelete }: Props) {
  const { width, height } = FORMATS[story.format];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    // z-10 while the menu is open, so it isn't covered by the covers next to it.
    <div className={`group relative flex min-w-0 flex-col ${menuOpen ? "z-10" : ""}`}>
      <div
        className={`relative origin-bottom transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:-rotate-1 ${menuOpen ? "-translate-y-1 -rotate-1" : ""}`}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Link
          href={editorHref(story.id)}
          aria-label={`Abrir “${story.name}”`}
          className="relative block h-full overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,.12),0_8px_16px_-6px_rgba(70,45,20,.35)] outline-none transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-[#c8553d] focus-visible:ring-offset-2 group-hover:shadow-[0_2px_4px_rgba(0,0,0,.12),0_18px_28px_-10px_rgba(70,45,20,.5)]"
        >
          {story.coverThumbnailDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- a data URL from the thumbnail cache
            <img src={story.coverThumbnailDataUrl} alt="" decoding="async" draggable={false} className="h-full w-full object-cover" />
          ) : (
            <PendingCover story={story} />
          )}
          {/* The spine: a soft fold along the left edge. */}
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/25 via-white/15 to-transparent" />
        </Link>
        <BookMenu story={story} open={menuOpen} setOpen={setMenuOpen} onRename={onRename} onDelete={onDelete} />
      </div>
      <div style={{ height: PLANK_H }} />
      <p className={`truncate px-1 pt-2.5 text-center text-xs font-medium ${menuOpen ? "" : reveal}`} style={{ height: LABEL_H }} title={story.name}>
        {story.name}
      </p>
    </div>
  );
}

/** Stand-in while a thumbnail is being made: the cover's paper and ink, and its title. */
function PendingCover({ story }: { story: Story }) {
  return (
    <div className="flex h-full w-full animate-pulse items-end p-[9%]" style={{ background: paperHex(story.cover.paper), color: inkHex(story.cover.ink) }}>
      <span className="line-clamp-4 text-[13px] font-bold leading-tight" style={{ fontFamily: `"${story.theme.fontHeading}"` }}>
        {story.cover.title || story.name}
      </span>
    </div>
  );
}

type MenuProps = { story: Story; open: boolean; setOpen: (open: boolean) => void; onRename: (s: Story) => void; onDelete: (s: Story) => void };

function BookMenu({ story, open, setOpen, onRename, onDelete }: MenuProps) {
  const router = useRouter();
  const duplicate = useLibrary((s) => s.duplicate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const items = [
    { label: "Abrir", icon: "menu_book", run: () => router.push(editorHref(story.id)) },
    { label: "Duplicar", icon: "content_copy", run: () => duplicate(story.id) },
    { label: "Renomear", icon: "edit", run: () => onRename(story) },
    { label: "Apagar", icon: "delete", run: () => onDelete(story), danger: true },
  ];

  return (
    <div ref={ref} className="absolute right-1.5 top-1.5">
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Mais ações para “${story.name}”`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`grid h-8 w-8 place-items-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur hover:bg-white ${open ? "" : reveal}`}
      >
        <Icon name="more_horiz" className="!text-[20px]" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 w-40 rounded-xl border border-neutral-200 bg-white p-1 text-neutral-900 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
          {items.map((it) => (
            <button
              key={it.label}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                it.run();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 ${it.danger ? "text-red-600 dark:text-red-400" : ""}`}
            >
              <Icon name={it.icon} className="!text-[18px]" />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
