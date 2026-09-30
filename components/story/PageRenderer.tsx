"use client";

import { Group, Rect, Text } from "react-konva";
import { FORMATS } from "@/lib/formats";
import type { StoryFormat, StoryPage, Theme } from "@/types/story";
import { getLayoutDef } from "./layouts";
import type { EditableField } from "./layouts/types";
import { inkFill, paperFill } from "./primitives";

export type PageRenderProps = {
  page: StoryPage;
  theme: Theme;
  format: StoryFormat;
  storyName: string;
  pageNumber: number;
  pageCount: number;
  editingField?: EditableField | null;
  onEditField?: (field: EditableField) => void;
};

/** Draws one page at its native format size; the Stage handles display scaling. */
export function PageRenderer({ page, theme, format, storyName, pageNumber, pageCount, editingField, onEditField }: PageRenderProps) {
  const { width, height } = FORMATS[format];
  const def = getLayoutDef(page.layout);

  if (!def) {
    return (
      <Group>
        <Rect width={width} height={height} fill={paperFill(page)} />
        <Text width={width} y={height / 2 - 20} align="center" text={`Layout desconhecido: ${page.layout}`} fontSize={36} fill={inkFill(page)} />
      </Group>
    );
  }
  const { Component } = def;
  // Placeholders only where fields can be edited (the main canvas passes onEditField); the
  // labels are the layout's own names for its fields ("Título", "Citação", "Legenda"…).
  const placeholders = onEditField ? { title: def.fields.title, body: def.fields.body } : undefined;
  return (
    <Component
      placeholders={placeholders}
      page={page}
      theme={theme}
      width={width}
      height={height}
      pageNumber={pageNumber}
      pageCount={pageCount}
      storyName={storyName}
      editingField={editingField}
      onEditField={onEditField}
    />
  );
}
