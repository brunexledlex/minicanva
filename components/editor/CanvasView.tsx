"use client";

import type Konva from "konva";
import { AnimatePresence, motion, type PanInfo, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getLayoutDef } from "@/components/story/layouts";
import type { EditableField } from "@/components/story/layouts/types";
import { PageStage } from "@/components/story/PageStage";
import { FORMATS } from "@/lib/formats";
import { allPages, useEditor } from "@/lib/store";
import { InlineTextOverlay } from "./InlineTextOverlay";
import { PageToolbar, TOOLBAR_H, TOOLBAR_MIN_W } from "./PageToolbar";
import { PageToolsBar, TOOLS_BAR_H } from "./PageToolsBar";
import { usePageImageUpload } from "./usePageImage";

/**
 * Magazine page turn, pivoting on the left edge (the spine). Going forward, the current page
 * swings over and away, revealing the next one waiting underneath; going back, the previous
 * page swings back down on top. Past 90° the backface is hidden, so a page simply vanishes
 * rather than showing mirrored. The page lifts toward the viewer (negative rotateY), so its
 * free edge grows a little as it turns — see TURN_PERSPECTIVE for how much.
 * `dir` is 1 forward, -1 back.
 */
const TURN: Variants = {
  enter: (dir: number) => (dir > 0 ? { rotateY: 0, scale: 0.96, opacity: 0.6, zIndex: 0 } : { rotateY: -95, scale: 1, opacity: 1, zIndex: 2 }),
  center: { rotateY: 0, scale: 1, opacity: 1, zIndex: 1 },
  exit: (dir: number) => (dir > 0 ? { rotateY: -95, scale: 1, opacity: 1, zIndex: 2 } : { rotateY: 0, scale: 0.96, opacity: 0.6, zIndex: 0 }),
};
/**
 * Perspective distance, in page widths. The turning edge comes up to one page width toward the
 * viewer, so it grows by p / (p − 1): 12 → at most ~9% (≈8% at 60°) — enough to sell the lift
 * without the page ballooning over the toolbars (3 gave ~40%).
 */
const TURN_PERSPECTIVE = 12;
/** For people who've asked their OS for reduced motion: a plain crossfade instead of the turn. */
const FADE: Variants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

/** How far (px) or how fast (px/s) a horizontal drag must go to count as a swipe. */
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 500;

/** The large preview of the selected page, fitted to the available space. */
export function CanvasView({ fontsRev }: { fontsRev: number | null }) {
  const story = useEditor((s) => s.story);
  const selectedId = useEditor((s) => s.selectedId);
  const updatePage = useEditor((s) => s.updatePage);
  const select = useEditor((s) => s.select);
  const pages = allPages(story);
  const index = Math.max(0, pages.findIndex((p) => p.id === selectedId));
  const page = pages[index];
  const { width, height } = FORMATS[story.format];
  const reduceMotion = useReducedMotion();

  // Which way the last page change went, so the turn animates forward or back. Any navigation
  // counts — swipe, filmstrip, arrow keys — using React's "adjust state while rendering" pattern.
  const [shownIndex, setShownIndex] = useState(index);
  const [dir, setDir] = useState(1);
  if (index !== shownIndex) {
    setShownIndex(index);
    setDir(index > shownIndex ? 1 : -1);
  }

  const stageRef = useRef<Konva.Stage | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  // Leaving the page (by navigating, or because its layout dropped the field) closes any open editor.
  useEffect(() => setEditingField(null), [page.id]);

  // Swipe left for the next page, right for the previous — only mostly-horizontal drags, and
  // not while editing text (selecting text in the editor would otherwise turn the page).
  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    if (editingField) return;
    const { offset, velocity } = info;
    if (Math.abs(offset.x) < Math.abs(offset.y)) return;
    if (Math.abs(offset.x) < SWIPE_DISTANCE && Math.abs(velocity.x) < SWIPE_VELOCITY) return;
    const next = pages[index + (offset.x < 0 ? 1 : -1)];
    if (next) select(next.id);
  };

  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // The toolbar sits above the page and the tools bar below it; the page gets the height left over.
  // The page itself only fills 95% of that, leaving a little breathing room around it.
  const chrome = TOOLBAR_H + TOOLS_BAR_H;
  const fit = box.w && box.h > chrome ? Math.min(box.w / width, (box.h - chrome) / height, 1) : 0;
  const scale = fit * 0.95;

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
            {/* Receives the swipe. pan-y keeps vertical scrolling on touch screens; horizontal drags come here. */}
            <motion.div
              className="relative"
              style={{ width: width * scale, height: height * scale, perspective: width * scale * TURN_PERSPECTIVE, touchAction: "pan-y" }}
              onPanEnd={onPanEnd}
            >
              {/* During a turn the old and new page are both mounted, stacked in the same spot. */}
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={page.id}
                  custom={dir}
                  variants={reduceMotion ? FADE : TURN}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 shadow-[0_12px_40px_rgba(0,0,0,.18)]"
                  style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
                >
                  <PageStage
                    // Only ever set, never cleared: the outgoing page's stage unmounts after the
                    // incoming one has mounted, and clearing then would drop the live stage.
                    stageRef={(s) => {
                      if (s) stageRef.current = s;
                    }}
                    interactive
                    page={page}
                    theme={story.theme}
                    format={story.format}
                    storyName={story.name}
                    pageNumber={index + 1}
                    pageCount={pages.length}
                    scale={scale}
                    fontsRev={fontsRev}
                    editingField={editingField}
                    onEditField={setEditingField}
                  />
                </motion.div>
              </AnimatePresence>
              <InlineTextOverlay
                stage={stageRef.current}
                field={editingField}
                value={(editingField === "title" ? page.title : editingField === "body" ? page.body : "") ?? ""}
                placeholder={editingField ? getLayoutDef(page.layout)?.fields[editingField] : undefined}
                onChange={(v) => updatePage(page.id, editingField === "title" ? { title: v } : { body: v })}
                onClose={() => setEditingField(null)}
                scale={scale}
                measureDeps={[page.title, page.body, page.layout]}
              />
            </motion.div>
            <PageToolsBar page={page} isCover={index === 0} width={width * scale} />
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
