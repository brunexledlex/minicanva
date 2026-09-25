"use client";

import type Konva from "konva";
import { useLayoutEffect, useRef, useState } from "react";
import type { EditableField } from "@/components/story/layouts/types";

type Rect = { left: number; top: number; width: number; height: number };
type FontStyle = { fontFamily: string; fontSize: number; fontWeight: number; fontStyle: string; lineHeight: number; letterSpacing: number; color: string; textAlign: "left" | "center" | "right"; opacity: number };

type Props = {
  stage: Konva.Stage | null;
  /** Which field is being edited; the overlay unmounts (and its Text node reappears) when this is null. */
  field: EditableField | null;
  value: string;
  /** Shown while the field is empty — the same label the canvas uses as ghost text. */
  placeholder?: string;
  onChange: (value: string) => void;
  onClose: () => void;
  scale: number;
  /** Re-measure whenever these change — typically the live text plus anything that can reflow the page. */
  measureDeps: unknown[];
};

/**
 * An HTML textarea placed exactly over a page's title/body Konva.Text node(s), so double-clicking
 * text on the canvas edits it in place. The Text node(s) hide themselves (see primitives.tsx's
 * `editable`) while this is open, and re-measures on every keystroke since typing can reflow
 * the whole page (a taller title pushes the body down, etc).
 */
export function InlineTextOverlay({ stage, field, value, placeholder, onChange, onClose, scale, measureDeps }: Props) {
  const [box, setBox] = useState<{ rect: Rect; font: FontStyle } | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (!stage || !field) {
      setBox(null);
      return;
    }
    const nodes = stage.find(`.editable-${field}`) as Konva.Text[];
    if (!nodes.length) {
      onClose();
      return;
    }
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const n of nodes) {
      const r = n.getClientRect({ relativeTo: stage });
      x0 = Math.min(x0, r.x);
      y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.x + r.width);
      y1 = Math.max(y1, r.y + r.height);
    }
    const f = nodes[0];
    const style = f.fontStyle();
    setBox({
      rect: { left: x0 * scale, top: y0 * scale, width: (x1 - x0) * scale, height: (y1 - y0) * scale },
      font: {
        // Quoted: some family names (e.g. "Source Serif 4") end in a bare digit, which the
        // browser silently rejects as an unquoted CSS identifier — the old font-family just
        // sticks. Quoting always works and matches how CSS itself expects such names.
        fontFamily: `"${f.fontFamily()}"`,
        fontSize: f.fontSize() * scale,
        fontWeight: style.includes("bold") ? 700 : 400,
        fontStyle: style.includes("italic") ? "italic" : "normal",
        lineHeight: f.lineHeight(),
        letterSpacing: f.letterSpacing() * scale,
        color: String(f.fill()),
        textAlign: (f.align() as FontStyle["textAlign"]) || "left",
        opacity: f.opacity(),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measureDeps drives re-measurement on purpose
  }, [stage, field, scale, ...measureDeps]);

  // The textarea only mounts once `box` is set (one render after `field` changes, since
  // measuring happens in the effect above) — focusing on `field` alone would fire before it
  // exists. Track which field we've already focused so re-measuring mid-edit (every keystroke,
  // since typing can reflow the box) doesn't keep re-focusing and re-selecting the text.
  const focusedFieldRef = useRef<EditableField | null>(null);
  useLayoutEffect(() => {
    if (!field) {
      focusedFieldRef.current = null;
    } else if (box && focusedFieldRef.current !== field) {
      ref.current?.focus();
      focusedFieldRef.current = field;
    }
  }, [field, box]);

  // A canvas font and an HTML textarea don't always wrap text at exactly the same width
  // (kerning/shaping differ slightly), so Konva's measured box can be a touch short and
  // clip the last line. Grow the textarea to fit its own content, never below that box.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !box) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(box.rect.height, el.scrollHeight)}px`;
  }, [box, value]);

  if (!field || !box) return null;

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") ref.current?.blur();
      }}
      onFocus={(e) => e.currentTarget.select()}
      placeholder={placeholder}
      spellCheck={false}
      // z-10: above the page, which carries a z-index (up to 2) while turning.
      className="absolute z-10 resize-none border-none bg-transparent p-0 outline-none"
      // An empty field was measured from its faded ghost text; don't carry that fade into
      // the editor, or the placeholder and the first typed letters would be barely visible.
      style={{ ...box.rect, ...box.font, opacity: value ? box.font.opacity : 1, caretColor: box.font.color }}
    />
  );
}
