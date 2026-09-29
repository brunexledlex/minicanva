"use client";

import { AnimatePresence, motion, type PanInfo, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PageStage } from "@/components/story/PageStage";
import { FORMATS } from "@/lib/formats";
import { allPages, useEditor } from "@/lib/store";

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
 * without the page ballooning over the bars (3 gave ~40%).
 */
const TURN_PERSPECTIVE = 12;
/** For people who've asked their OS for reduced motion: a plain crossfade instead of the turn. */
const FADE: Variants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

/** How far (px) or how fast (px/s) a horizontal drag must go to count as a swipe. */
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 500;

/** The Edit button's size; it overhangs the page's bottom-right corner, so the page leaves room for part of it. */
const EDIT_SIZE = 72;
const EDIT_OVERHANG = 24;

/** The story screen's large, read-only view of the selected page: swipe to turn pages, "Editar" to edit it. */
export function PagePreview({ fontsRev, onEdit }: { fontsRev: number | null; onEdit: () => void }) {
  const story = useEditor((s) => s.story);
  const selectedId = useEditor((s) => s.selectedId);
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

  // Swipe left for the next page, right for the previous — only mostly-horizontal drags.
  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
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
  const room = EDIT_OVERHANG;
  const scale = box.w > room && box.h > room ? Math.min((box.w - room) / width, (box.h - room) / height, 1) * 0.95 : 0;

  return (
    <div className="relative min-h-0 flex-1">
      {/* Absolutely positioned so its size is definite whatever the column around it does. */}
      <div ref={boxRef} className="absolute inset-4 flex items-center justify-center md:inset-8">
        {scale > 0 && fontsRev !== null ? (
          <div className="relative" style={{ width: width * scale, height: height * scale }}>
            {/* Receives the swipe. pan-y keeps vertical scrolling on touch screens; horizontal drags come here. */}
            <motion.div className="relative h-full w-full" style={{ perspective: width * scale * TURN_PERSPECTIVE, touchAction: "pan-y" }} onPanEnd={onPanEnd}>
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
                    page={page}
                    theme={story.theme}
                    format={story.format}
                    storyName={story.name}
                    pageNumber={index + 1}
                    pageCount={pages.length}
                    scale={scale}
                    fontsRev={fontsRev}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
            <button
              onClick={onEdit}
              className="absolute z-10 grid place-items-center rounded-full bg-[#1b1a17] text-sm font-semibold text-[#a3ffa3] shadow-[0_8px_24px_rgba(0,0,0,.3)] transition-transform hover:scale-105 active:scale-95"
              style={{ width: EDIT_SIZE, height: EDIT_SIZE, right: -EDIT_OVERHANG, bottom: -EDIT_OVERHANG }}
            >
              Editar
            </button>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">A carregar…</p>
        )}
      </div>
    </div>
  );
}
