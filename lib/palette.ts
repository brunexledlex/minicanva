import type { InkId, PaperColor } from "@/types/story";

/*
 * Every colour on a page, as on a Risograph print: the paper it's printed on, and the ink its
 * text is printed in. The paper is what's left wherever nothing else is — take the image away
 * and the paper is what shows. Images are drawn light enough for text in any of the inks to
 * stay legible on them (IMAGE_MIN_LUMINANCE, applied in lib/images.ts).
 */

export const PAPERS: { id: PaperColor; name: string; hex: string }[] = [
  { id: "white", name: "Branco", hex: "#ffffff" },
  { id: "yellow", name: "Amarelo", hex: "#fbf0d1" },
];
export const DEFAULT_PAPER: PaperColor = "white";

/**
 * Five Riso spot inks, at the hex values Riso printers publish for on-screen proofs. Each is
 * dark enough for body text on either paper (≥ 4:1). The brighter classics — Yellow,
 * Fluorescent Pink, Bright Red — are left out: no image light enough to carry them would still
 * look like an image.
 */
export const INKS: { id: InkId; name: string; hex: string }[] = [
  { id: "black", name: "Preto", hex: "#000000" }, // Riso Black
  { id: "blue", name: "Azul", hex: "#0078bf" }, // Riso Blue
  { id: "red", name: "Vermelho", hex: "#a75154" }, // Riso Brick
  { id: "green", name: "Verde", hex: "#397e58" }, // Riso Grass
  { id: "purple", name: "Roxo", hex: "#765ba7" }, // Riso Purple
];
export const DEFAULT_INK: InkId = "black";

export const paperHex = (id: PaperColor | undefined) => (PAPERS.find((p) => p.id === id) ?? PAPERS[0]).hex;
export const inkHex = (id: InkId | undefined) => (INKS.find((i) => i.id === (id ?? DEFAULT_INK)) ?? INKS[0]).hex;

/** "#rrggbb" as its three channels, 0–255. */
export function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

/** An sRGB channel (0–1) in linear light, as WCAG's luminance formula uses it. */
export const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** WCAG relative luminance of a colour, from 0 (black) to 1 (white). */
export function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => toLinear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The least contrast text may have against what it's printed on: WCAG's minimum for large text. */
const MIN_CONTRAST = 3;

/**
 * How light every part of an image has to be for text in each ink to keep MIN_CONTRAST on it.
 * The lightest ink sets it: with Blue, about 0.62 — a pale pastel, but still clearly an image.
 */
export const IMAGE_MIN_LUMINANCE = MIN_CONTRAST * (Math.max(...INKS.map((i) => luminance(i.hex))) + 0.05) - 0.05;
