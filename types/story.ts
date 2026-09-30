/** A typographic style. Its colours aren't part of it: they come from each page's paper and ink (lib/palette.ts). */
export type Theme = {
  id: string;
  name: string;
  fontHeading: string;
  fontBody: string;
};

export type PageLayout =
  | "cover-title-image"
  | "cover-title-only"
  | "cover-split"
  | "cover-minimal"
  | "cover-frame"
  | "text-only"
  | "image-full-bleed"
  | "image-top-text-bottom"
  | "quote-centered"
  | "two-column";

/** The paper a page is printed on: the colour left wherever nothing else is. Unset is white. */
export type PaperColor = "white" | "yellow";

/** The Riso ink a page's text is printed in. Unset is black. */
export type InkId = "black" | "blue" | "red" | "green" | "purple";

/** How a page's image fills its box: "fill" crops to cover it (the default); the rest fit the whole image in, anchored as named. */
export type ImageFit = "fill" | "real" | "center" | "left" | "right";

export type StoryPage = {
  id: string;
  layout: PageLayout;
  title?: string;
  body?: string;
  imageUrl?: string;
  paper?: PaperColor;
  ink?: InkId;
  imageFit?: ImageFit;
};

export type StoryFormat = "1:1" | "4:5" | "9:16";

export type Story = {
  id: string;
  name: string;
  format: StoryFormat;
  theme: Theme;
  cover: StoryPage;
  pages: StoryPage[];
  /** Last edit (ms), for ordering the shelf. */
  updatedAt: number;
  /** Small render of the cover for the shelf, so it doesn't mount a Konva stage per story. */
  coverThumbnailDataUrl?: string;
  /** Fingerprint of what the thumbnail was rendered from; a mismatch means it's stale. */
  coverThumbnailKey?: string;
};
