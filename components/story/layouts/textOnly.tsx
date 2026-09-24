"use client";

import { Group, Rect, Text } from "react-konva";
import { Folio, folioTop, margin, measureText, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** A reading page: accent rule, title and a generous body column. */
export const TextOnly: LayoutComponent = (props) => {
  const { page, theme, width: W, height: H } = props;
  const { background, text, accent } = theme.colors;
  const m = margin(W);
  const cw = W - m * 2;

  const accentY = m * 1.4 + safeInset(W, H);
  const title = page.title ?? "";
  const titleCfg = { text: title, width: cw, fontFamily: theme.fontHeading, fontSize: W * 0.07, fontStyle: "bold", lineHeight: 1.06 };
  const titleY = accentY + 6 + m * 0.5;
  const titleH = title ? measureText(titleCfg) : 0;
  const bodyY = titleY + titleH + m * 0.5;
  const bodyH = Math.max(0, folioTop(W, H) - m * 0.5 - bodyY);

  return (
    <Group>
      <Rect width={W} height={H} fill={background} />
      <Rect x={m} y={accentY} width={W * 0.06} height={6} fill={accent} />
      {title && <Text {...titleCfg} x={m} y={titleY} fill={text} />}
      {page.body && bodyH > 0 && (
        <Text x={m} y={bodyY} width={cw} height={bodyH} text={page.body} fontFamily={theme.fontBody} fontSize={W * 0.035} lineHeight={1.5} fill={text} opacity={0.88} ellipsis />
      )}
      <Folio W={W} H={H} theme={theme} pageNumber={props.pageNumber} pageCount={props.pageCount} storyName={props.storyName} />
    </Group>
  );
};
