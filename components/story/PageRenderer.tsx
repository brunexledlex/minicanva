"use client";

import { Group, Rect, Text } from "react-konva";
import { FORMATS } from "@/lib/formats";
import type { StoryFormat, StoryPage, Theme } from "@/types/story";
import { getLayoutDef } from "./layouts";

export type PageRenderProps = {
  page: StoryPage;
  theme: Theme;
  format: StoryFormat;
  storyName: string;
  pageNumber: number;
  pageCount: number;
};

/** Draws one page at its native format size; the Stage handles display scaling. */
export function PageRenderer({ page, theme, format, storyName, pageNumber, pageCount }: PageRenderProps) {
  const { width, height } = FORMATS[format];
  const def = getLayoutDef(page.layout);

  if (!def) {
    return (
      <Group>
        <Rect width={width} height={height} fill={theme.colors.background} />
        <Text width={width} y={height / 2 - 20} align="center" text={`Layout desconhecido: ${page.layout}`} fontSize={36} fill={theme.colors.text} />
      </Group>
    );
  }
  const { Component } = def;
  return <Component page={page} theme={theme} width={width} height={height} pageNumber={pageNumber} pageCount={pageCount} storyName={storyName} />;
}
