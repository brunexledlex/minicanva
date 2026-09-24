"use client";

import { memo, useState } from "react";
import { PageStage } from "@/components/story/PageStage";
import type { PageRenderProps } from "@/components/story/PageRenderer";
import { FORMATS } from "@/lib/formats";
import { registerStage } from "@/lib/stages";
import { allPages, useEditor } from "@/lib/store";
import { Icon } from "./Icon";

const THUMB_H = 58; // half the original 116, per request

/** Memoised so typing on one page only redraws that page's thumbnail. */
const ThumbStage = memo(function ThumbStage(props: PageRenderProps & { scale: number; fontsRev: number }) {
  return <PageStage {...props} stageRef={(s) => registerStage(props.page.id, s)} />;
});

export function Filmstrip({ fontsRev }: { fontsRev: number | null }) {
  const story = useEditor((s) => s.story);
  const selectedId = useEditor((s) => s.selectedId);
  const { select, addPage, movePage } = useEditor.getState();
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
      <div className="flex items-end gap-1.5 overflow-x-auto px-3 pb-1.5 pt-1.5">
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
                <div
                  className="overflow-hidden rounded-[3px] bg-neutral-200 outline outline-1 -outline-offset-1 outline-black/10 dark:bg-neutral-800 dark:outline-white/10"
                  style={{ height: THUMB_H }}
                >
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
              {/* Duplicate/delete live only in the page toolbar above the main canvas, not here. */}
              <div className="mt-0.5 h-3.5 truncate pl-1 text-[10px] font-medium leading-[14px] text-neutral-500">{inner ? String(i + 1).padStart(2, "0") : "Capa"}</div>
            </div>
          );
        })}
        <button
          onClick={addPage}
          className="mb-4 grid shrink-0 place-items-center rounded-md border-2 border-dashed border-neutral-300 text-neutral-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-700"
          style={{ width: Math.max(width * scale, 40), height: THUMB_H }}
          title="Adicionar página"
          aria-label="Adicionar página"
        >
          <Icon name="add" className="!text-[18px]" />
        </button>
      </div>
    </div>
  );
}

function DropMark({ side }: { side: "left" | "right" }) {
  return <div className={`absolute top-0 z-10 h-[62px] w-1 rounded bg-indigo-500 ${side === "left" ? "-left-1.5" : "-right-1.5"}`} />;
}
