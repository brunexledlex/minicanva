import type { StoryPage, Theme } from "@/types/story";

/** A page field that can be edited by double-clicking its text directly on the canvas. */
export type EditableField = "title" | "body";

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
  /** The field currently being edited inline on canvas, if any; its Text node hides so the HTML overlay can stand in for it. */
  editingField?: EditableField | null;
  /** Call when the title/body (or quote/author, dek, caption — whatever the layout calls them) text is double-clicked. */
  onEditField?: (field: EditableField) => void;
};

export type LayoutComponent = (props: LayoutProps) => JSX.Element;
