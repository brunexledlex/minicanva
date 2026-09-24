import type { StoryPage, Theme } from "@/types/story";

/** Everything a layout needs to draw one page at its native size (e.g. 1080×1350). */
export type LayoutProps = {
  page: StoryPage;
  theme: Theme;
  width: number;
  height: number;
  /** 1-based position in the whole story; the cover is page 1. */
  pageNumber: number;
  pageCount: number;
  storyName: string;
};

export type LayoutComponent = (props: LayoutProps) => JSX.Element;
