import type { Theme } from "@/types/story";

export const THEMES: Theme[] = [
  { id: "editorial-serif", name: "Editorial", fontHeading: "Playfair Display", fontBody: "Source Serif 4" },
  { id: "tech-mono", name: "Tech", fontHeading: "Space Mono", fontBody: "IBM Plex Mono" },
  { id: "minimal-sans", name: "Minimal", fontHeading: "Inter", fontBody: "Inter" },
];

/** Every family the page themes use; all are loaded up front so switching themes is instant. */
export const THEME_FONTS = [...new Set(THEMES.flatMap((t) => [t.fontHeading, t.fontBody]))];

export const getTheme = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0];
