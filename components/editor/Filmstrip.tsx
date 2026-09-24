"use client";

import { memo, useState } from "react";
import { PageStage } from "@/components/story/PageStage";
import type { PageRenderProps } from "@/components/story/PageRenderer";
import { FORMATS } from "@/lib/formats";
import { registerStage } from "@/lib/stages";
import { allPages, useEditor } from "@/lib/store";
import { Icon } from "./Icon";

const THUMB_H = 116;

/** Memoised so typing on one page only redraws that page's thumbnail. */
const ThumbStage = memo(function ThumbStage(props: PageRenderProps & { scale: number; fontsRev: number }) {
  return <PageStage {...props} stageRef={(s) => registerStage(props.page.id, s)} />;
});

export function Filmstrip({ fontsRev }: { fontsRev: number | null }) {
  const story = useEditor((s) => s.story);
  const selectedId = useEditor((s) => s.selectedId);
  const { select, addPage, duplicatePage, deletePage, movePage } = useEditor.getState();
  const pages = allPages(story);
  const { width, height } = FORMATS[story.format];
  const scale = THUMB_H / height;

  const [dragId, setDragId] = useState<string | null>(null);
  // Inner-page index the dragged page would be inserted before (0 = right after the cover).
  const [dropAt, setDropAt] = useState<number | null>(null);

  const endDrag = () => {
    setDragId(null);
    setDropAt(null);
  };
  const drop = () => {
    if (dragId && dropAt !== null) {
      const from = story.pages.findIndex((p) => p.id === dragId);
      movePage(dragId, dropAt > from ? dropAt - 1 : dropAt);
    }
    endDrag();
  };

  return (
    <div className="shrink-0 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-end gap-3 overflow-x-auto px-4 pb-3 pt-3">
        {pages.map((page, i) => {
          const inner = i > 0;
          const innerIndex = i - 1;
          const selected = page.id === selectedId;
          return (
            <div
              key={page.id}
              className="relative shrink-0"
              draggable={inner}
              onDragStart={(e) => {
                setDragId(page.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={endDrag}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                const r = e.currentTarget.getBoundingClientRect();
                const after = e.clientX > r.left + r.width / 2;
                setDropAt(inner ? innerIndex + (after ? 1 : 0) : 0);
              }}
              onDrop={(e) => {
                e.preventDefault();
                drop();
              }}
            >
              {dragId && inner && dropAt === innerIndex && <DropMark side="left" />}
              {dragId && inner && innerIndex === story.pages.length - 1 && dropAt === story.pages.length && <DropMark side="right" />}
              <button
                onClick={() => select(page.id)}
                className={`group block rounded-md p-0.5 ring-2 transition ${selected ? "ring-indigo-500" : "ring-transparent hover:ring-neutral-300 dark:hover:ring-neutral-600"} ${dragId === page.id ? "opacity-40" : ""}`}
                style={{ width: width * scale + 4 }}
                title={inner ? `Página ${i + 1}` : "Capa"}
              >
                <div className="overflow-hidden rounded-[3px] bg-neutral-200 dark:bg-neutral-800" style={{ height: THUMB_H }}>
                  {fontsRev !== null && (
                    <ThumbStage
                      page={page}
                      theme={story.theme}
                      format={story.format}
                      storyName={story.name}
                      pageNumber={i + 1}
                      pageCount={pages.length}
                      scale={scale}
                      fontsRev={fontsRev}
                    />
                  )}
                </div>
              </button>
              <div className="mt-1 flex h-6 items-center justify-between gap-1 text-[11px] text-neutral-500">
                <span className="pl-1 font-medium">{inner ? String(i + 1).padStart(2, "0") : "Capa"}</span>
                {inner && selected && (
                  <span className="flex">
                    <button onClick={() => duplicatePage(page.id)} className="grid h-6 w-6 place-items-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" title="Duplicar página">
                      <Icon name="content_copy" className="!text-[16px]" />
                    </button>
                    <button onClick={() => deletePage(page.id)} className="grid h-6 w-6 place-items-center rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950" title="Apagar página">
                      <Icon name="delete" className="!text-[16px]" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <button
          onClick={addPage}
          className="mb-7 grid shrink-0 place-items-center rounded-md border-2 border-dashed border-neutral-300 text-neutral-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-700"
          style={{ width: Math.max(width * scale, 64), height: THUMB_H }}
          title="Adicionar página"
        >
          <span className="flex flex-col items-center gap-1 text-xs">
            <Icon name="add" />
            Página
          </span>
        </button>
      </div>
    </div>
  );
}

function DropMark({ side }: { side: "left" | "right" }) {
  return <div className={`absolute top-0 z-10 h-[120px] w-1 rounded bg-indigo-500 ${side === "left" ? "-left-2" : "-right-2"}`} />;
}
