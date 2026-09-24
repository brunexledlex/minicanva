import type { Theme } from "@/types/story";

export const THEMES: Theme[] = [
  {
    id: "editorial-serif",
    name: "Editorial serif",
    fontHeading: "Playfair Display",
    fontBody: "Source Serif 4",
    colors: { background: "#f4efe6", text: "#1b1a17", accent: "#c8553d" },
  },
  {
    id: "tech-mono",
    name: "Tech mono",
    fontHeading: "Space Mono",
    fontBody: "IBM Plex Mono",
    colors: { background: "#0f1115", text: "#e8ecef", accent: "#7cf29a" },
  },
  {
    id: "minimal-sans",
    name: "Minimal sans",
    fontHeading: "Inter",
    fontBody: "Inter",
    colors: { background: "#ffffff", text: "#111111", accent: "#2f5bff" },
  },
];

/** Every family the page themes use; all are loaded up front so switching themes is instant. */
export const THEME_FONTS = [...new Set(THEMES.flatMap((t) => [t.fontHeading, t.fontBody]))];

export const getTheme = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0];

/** Merges a page's partial override onto the story theme (colors merge key by key). */
export function resolveTheme(base: Theme, override?: Partial<Theme>): Theme {
  if (!override) return base;
  return { ...base, ...override, colors: { ...base.colors, ...override.colors } };
}
