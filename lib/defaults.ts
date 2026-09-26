import type { Story, StoryFormat, StoryPage } from "@/types/story";
import { THEMES } from "@/lib/themes";
import { uid } from "@/lib/uid";

// GitHub Pages serves this app from /minicanva/, so root-relative public asset paths
// need the same prefix Next.js applies to its own routes (see next.config.mjs).
const publicAsset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

/** Built-in pattern images (public/images), used for covers and as the default image of new pages. */
export const DEFAULT_IMAGES = Array.from({ length: 9 }, (_, i) => publicAsset(`/images/pattern-${String(i + 1).padStart(2, "0")}.jpg`));
/** A different default image each time, so new pages don't all look the same. */
const randomImage = () => DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];

export function newPage(): StoryPage {
  return { id: uid(), layout: "image-top-text-bottom", title: "Novo título", body: "Escreve aqui o texto desta página.", imageUrl: randomImage() };
}

export function blankStory(format: StoryFormat): Story {
  return {
    id: uid(),
    name: "Sem título",
    format,
    theme: THEMES[0],
    cover: { id: uid(), layout: "cover-title-image", title: "Título da capa", body: "Um subtítulo curto para a capa.", imageUrl: randomImage() },
    pages: [newPage()],
    updatedAt: Date.now(),
  };
}
