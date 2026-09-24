export type Theme = {
  id: string;
  name: string;
  fontHeading: string;
  fontBody: string;
  colors: { background: string; text: string; accent: string };
};

export type PageLayout =
  | "cover-title-image"
  | "cover-title-only"
  | "text-only"
  | "image-full-bleed"
  | "image-top-text-bottom"
  | "quote-centered"
  | "two-column";

export type StoryPage = {
  id: string;
  layout: PageLayout;
  title?: string;
  body?: string;
  imageUrl?: string;
  themeOverride?: Partial<Theme>;
};

export type StoryFormat = "1:1" | "4:5" | "9:16";

export type Story = {
  id: string;
  name: string;
  format: StoryFormat;
  theme: Theme;
  cover: StoryPage;
  pages: StoryPage[];
};
