"use client";

import { useEffect, useRef, useState } from "react";
import { PageStage } from "@/components/story/PageStage";
import { FORMATS } from "@/lib/formats";
import { allPages, useEditor } from "@/lib/store";
import { LAYOUT_BAR_H, LayoutBar } from "./LayoutBar";
import { PageToolbar, TOOLBAR_H, TOOLBAR_MIN_W } from "./PageToolbar";
import { usePageImageUpload } from "./usePageImage";

/** The large preview of the selected page, fitted to the available space. */
export function CanvasView({ fontsRev }: { fontsRev: number | null }) {
  const story = useEditor((s) => s.story);
  const selectedId = useEditor((s) => s.selectedId);
  const pages = allPages(story);
  const index = Math.max(0, pages.findIndex((p) => p.id === selectedId));
  const page = pages[index];
  const { width, height } = FORMATS[story.format];

  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // The toolbar sits above the page and the layout bar below it; the page gets the height left over.
  const chrome = TOOLBAR_H + LAYOUT_BAR_H;
  const scale = box.w && box.h > chrome ? Math.min(box.w / width, (box.h - chrome) / height, 1) : 0;

  const { upload } = usePageImageUpload();
  const [dropping, setDropping] = useState(false);

  return (
    <div
      className="relative min-h-[55vh] flex-1 md:min-h-0"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropping(false);
        upload(page.id, e.dataTransfer.files[0]);
      }}
    >
      {/* Absolutely positioned so its size is definite even when the parent only has a min-height (mobile). */}
      <div ref={boxRef} className="absolute inset-5 flex items-center justify-center md:inset-10">
        {scale > 0 && fontsRev !== null ? (
          // items-center: the toolbar can be wider than the page (it has a minimum width),
          // so this keeps the page and layout bar centred underneath it.
          <div className="flex flex-col items-center">
            <PageToolbar page={page} index={index} format={story.format} width={Math.max(width * scale, TOOLBAR_MIN_W)} />
            <div className="shadow-[0_12px_40px_rgba(0,0,0,.18)]">
              <PageStage
              page={page}
              theme={story.theme}
              format={story.format}
              storyName={story.name}
              pageNumber={index + 1}
              pageCount={pages.length}
              scale={scale}
              fontsRev={fontsRev}
              />
            </div>
            <LayoutBar page={page} isCover={index === 0} width={width * scale} />
          </div>
        ) : (
          <p className="text-sm text-neutral-500">A carregar…</p>
        )}
      </div>

      {dropping && (
        <div className="pointer-events-none absolute inset-3 grid place-items-center rounded-2xl border-2 border-dashed border-indigo-500 bg-indigo-500/10 text-sm font-medium text-indigo-600">
          Larga a imagem para a usar nesta página
        </div>
      )}
    </div>
  );
}
