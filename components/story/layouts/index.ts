import type { PageLayout } from "@/types/story";
import { CoverTitleImage } from "./coverTitleImage";
import { CoverTitleOnly } from "./coverTitleOnly";
import { ImageFullBleed } from "./imageFullBleed";
import { ImageTopTextBottom } from "./imageTopTextBottom";
import { QuoteCentered } from "./quoteCentered";
import { TextOnly } from "./textOnly";
import { TwoColumn } from "./twoColumn";
import type { LayoutComponent } from "./types";

export type LayoutDef = {
  id: PageLayout;
  name: string;
  kind: "cover" | "inner";
  /** Which page fields this layout shows, and what the sidebar should call them. */
  fields: { title?: string; body?: string; image?: "required" | "optional" };
  Component: LayoutComponent;
};

export const LAYOUT_DEFS: LayoutDef[] = [
  { id: "cover-title-image", name: "Capa com imagem", kind: "cover", fields: { title: "Título", body: "Subtítulo", image: "required" }, Component: CoverTitleImage },
  { id: "cover-title-only", name: "Capa tipográfica", kind: "cover", fields: { title: "Título", body: "Subtítulo" }, Component: CoverTitleOnly },
  { id: "image-top-text-bottom", name: "Imagem e texto", kind: "inner", fields: { title: "Título", body: "Texto", image: "required" }, Component: ImageTopTextBottom },
  { id: "text-only", name: "Só texto", kind: "inner", fields: { title: "Título", body: "Texto" }, Component: TextOnly },
  { id: "two-column", name: "Duas colunas", kind: "inner", fields: { title: "Título", body: "Texto", image: "optional" }, Component: TwoColumn },
  { id: "image-full-bleed", name: "Imagem inteira", kind: "inner", fields: { title: "Título", body: "Legenda", image: "required" }, Component: ImageFullBleed },
  { id: "quote-centered", name: "Citação", kind: "inner", fields: { title: "Citação", body: "Autor" }, Component: QuoteCentered },
];

export const getLayoutDef = (id: PageLayout) => LAYOUT_DEFS.find((l) => l.id === id);
