"use client";

import Konva from "konva";
import { Group, Image as KImage, Rect } from "react-konva";
import { inkHex, paperHex } from "@/lib/palette";
import type { ImageFit, StoryPage } from "@/types/story";
import type { EditableField } from "./layouts/types";
import { useImage } from "./useImage";

/**
 * Props that make a title/body Text node double-click-editable on the edit screen:
 * a `name` the inline text overlay can find and measure, hidden while its own edit
 * session is open (an HTML textarea stands in for it), and a double-click to start.
 */
export function editable(field: EditableField, editingField: EditableField | null | undefined, onEditField: ((field: EditableField) => void) | undefined) {
  return {
    name: `editable-${field}`,
    visible: editingField !== field,
    onDblClick: () => onEditField?.(field),
    onDblTap: () => onEditField?.(field),
  };
}

/** Opacity for placeholder (ghost) text standing in for an empty field. */
export const GHOST_OPACITY = 0.3;

/** What to draw for a field: its value, or — when a placeholder is given — ghost text so an empty field stays double-clickable. */
export function fieldText(value: string | undefined, placeholder: string | undefined) {
  if (value) return { text: value, ghost: false };
  if (placeholder) return { text: placeholder, ghost: true };
  return { text: "", ghost: false };
}

/** Outer margin for a page, ~80px at 1080 wide. */
export const margin = (W: number) => W * 0.074;

/** Extra top/bottom inset on 9:16 pages: Instagram's Story UI covers roughly the outer 250px of each end. */
export const safeInset = (W: number, H: number) => (H / W > 1.7 ? H * 0.1 : 0);

/** Height a Konva.Text would take with these settings, so blocks can stack around it. */
export function measureText(config: Konva.TextConfig) {
  return new Konva.Text(config).height();
}

/** Largest font size (from config.fontSize down to minSize) whose wrapped text fits maxHeight. */
export function fitFontSize(config: Konva.TextConfig, maxHeight: number, minSize: number) {
  let size = config.fontSize ?? 40;
  while (size > minSize && measureText({ ...config, fontSize: size }) > maxHeight) size *= 0.93;
  return Math.max(size, minSize);
}

/** Height of at most `maxLines` lines of this text. */
export function clampedHeight(config: Konva.TextConfig, maxLines: number) {
  const lineH = (config.fontSize ?? 40) * (config.lineHeight ?? 1);
  return Math.min(measureText(config), lineH * maxLines);
}

/**
 * Splits text across two columns of `height`: balanced when it all fits,
 * otherwise the first column is filled and the rest overflows into the second.
 */
export function splitColumns(config: Konva.TextConfig, height: number): [string, string] {
  const t = new Konva.Text(config);
  const capacity = Math.max(1, Math.floor(height / ((config.fontSize ?? 40) * (config.lineHeight ?? 1))));
  const perCol = Math.min(capacity, Math.ceil(t.textArr.length / 2));
  if (t.textArr.length <= 1) return [String(config.text ?? ""), ""];
  const join = (lines: typeof t.textArr) =>
    lines.map((l, i) => l.text + (i < lines.length - 1 ? (l.lastInParagraph ? "\n" : " ") : "")).join("");
  return [join(t.textArr.slice(0, perCol)), join(t.textArr.slice(perCol))];
}

/** Crop that fills the target box without distortion, like CSS object-fit: cover. */
function coverCrop(iw: number, ih: number, w: number, h: number) {
  const r = w / h;
  if (iw / ih > r) {
    const cw = ih * r;
    return { x: (iw - cw) / 2, y: 0, width: cw, height: ih };
  }
  const ch = iw / r;
  return { x: 0, y: (ih - ch) / 2, width: iw, height: ch };
}

/** A page's paper (lib/palette.ts): the page's base fill, and what shows wherever nothing else is. */
export const paperFill = (page: StoryPage) => paperHex(page.paper);

/** The ink a page's text is printed in (lib/palette.ts). */
export const inkFill = (page: StoryPage) => inkHex(page.ink);

type CoverImageProps = {
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** The page's paper: what the image is faded into, and what shows around it when it doesn't fill its box. */
  paper: string;
  fit?: ImageFit;
};

/**
 * A page's image, drawn according to its fit mode ("fill" — crop to cover, the default — or
 * the whole image placed at its natural or a contained size), and faded into the paper as far
 * as text in any ink needs to stay legible on it (see loadPageImage). With no image there's
 * nothing to draw: the paper shows.
 */
export function CoverImage({ src, x, y, width, height, paper, fit = "fill" }: CoverImageProps) {
  const loaded = useImage(src);
  if (!loaded) return null;
  const { image: img } = loaded;
  const opacity = loaded.opacity[paper] ?? 1;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  if (fit === "fill") {
    // The page's own paper fill is already under the box, so the fade has something to show.
    const crop = coverCrop(iw, ih, width, height);
    return <KImage image={img} x={x} y={y} width={width} height={height} crop={crop} opacity={opacity} />;
  }

  // "real": the image at its native pixel size. Otherwise scaled down (never up) to fit
  // entirely inside the box, then anchored per `fit`. Either way, the box may show more of
  // the paper than the image covers, so it's filled first and clipped.
  const scale = fit === "real" ? 1 : Math.min(width / iw, height / ih, 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = fit === "left" ? x : fit === "right" ? x + (width - dw) : x + (width - dw) / 2;
  const dy = y + (height - dh) / 2;
  return (
    <Group clipX={x} clipY={y} clipWidth={width} clipHeight={height}>
      <Rect x={x} y={y} width={width} height={height} fill={paper} />
      <KImage image={img} x={dx} y={dy} width={dw} height={dh} opacity={opacity} />
    </Group>
  );
}

/** Bottom edge content should stop above, on an inner page (no footer reserved any more). */
export const contentBottom = (W: number, H: number) => H - safeInset(W, H) - margin(W);
