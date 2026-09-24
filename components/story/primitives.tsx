"use client";

import Konva from "konva";
import { Group, Image as KImage, Rect, Text } from "react-konva";
import type { Theme } from "@/types/story";
import { useImage } from "./useImage";

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

type CoverImageProps = { src?: string; x: number; y: number; width: number; height: number; placeholder: string };

export function CoverImage({ src, x, y, width, height, placeholder }: CoverImageProps) {
  const img = useImage(src);
  if (!img) return <Rect x={x} y={y} width={width} height={height} fill={placeholder} opacity={0.18} />;
  const crop = coverCrop(img.naturalWidth || img.width, img.naturalHeight || img.height, width, height);
  return <KImage image={img} x={x} y={y} width={width} height={height} crop={crop} />;
}

/** Vertical fade to black, used to keep white text legible over photos. */
export function Shade({ W, y, height, from = 0, to = 0.75, flip = false }: { W: number; y: number; height: number; from?: number; to?: number; flip?: boolean }) {
  const stops = flip ? [0, `rgba(0,0,0,${to})`, 1, `rgba(0,0,0,${from})`] : [0, `rgba(0,0,0,${from})`, 1, `rgba(0,0,0,${to})`];
  return (
    <Rect
      x={0}
      y={y}
      width={W}
      height={height}
      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
      fillLinearGradientEndPoint={{ x: 0, y: height }}
      fillLinearGradientColorStops={stops}
    />
  );
}

export const folioSize = (W: number) => W * 0.019;
/** Top of the folio line at the bottom of an inner page; content should stop above it. */
export const folioTop = (W: number, H: number) => H - safeInset(W, H) - margin(W) * 0.75 - folioSize(W) - margin(W) * 0.3;

type FolioProps = { W: number; H: number; theme: Theme; pageNumber: number; pageCount: number; storyName: string; color?: string };

/** Magazine running foot: hairline, "02 / 06" on the left, story name on the right. */
export function Folio({ W, H, theme, pageNumber, pageCount, storyName, color = theme.colors.text }: FolioProps) {
  const m = margin(W);
  const size = folioSize(W);
  const y = H - safeInset(W, H) - m * 0.75 - size;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <Group>
      <Rect x={m} y={y - m * 0.3} width={W - m * 2} height={1.5} fill={color} opacity={0.22} />
      <Text x={m} y={y} text={`${pad(pageNumber)} / ${pad(pageCount)}`} fontFamily={theme.fontBody} fontSize={size} fontStyle="bold" letterSpacing={2} fill={color} />
      <Text x={m} y={y} width={W - m * 2} align="right" text={storyName.toUpperCase()} fontFamily={theme.fontBody} fontSize={size} letterSpacing={3} fill={color} opacity={0.6} />
    </Group>
  );
}

/** Story name as a masthead across the top of a cover. */
export function Masthead({ W, H, theme, storyName, color }: { W: number; H: number; theme: Theme; storyName: string; color: string }) {
  const m = margin(W);
  const size = W * 0.04;
  const y = m + safeInset(W, H);
  return (
    <Group>
      <Text x={m} y={y} width={W - m * 2} text={storyName.toUpperCase()} fontFamily={theme.fontHeading} fontStyle="bold" fontSize={size} letterSpacing={W * 0.006} fill={color} wrap="none" ellipsis />
      <Rect x={m} y={y + size * 1.5} width={W - m * 2} height={2} fill={color} opacity={0.5} />
    </Group>
  );
}
