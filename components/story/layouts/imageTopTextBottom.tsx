"use client";

import { Group, Rect, Text } from "react-konva";
import { CoverImage, Folio, folioTop, margin, measureText } from "../primitives";
import type { LayoutComponent } from "./types";

/** Full-bleed image on the top half, then accent rule, title and body above the folio. */
export const ImageTopTextBottom: LayoutComponent = (props) => {
  const { page, theme, width: W, height: H } = props;
  const { background, text, accent } = theme.colors;
  const m = margin(W);
  const cw = W - m * 2;
  const imgH = Math.round(H * 0.5);

  const title = page.title ?? "";
  const titleCfg = { text: title, width: cw, fontFamily: theme.fontHeading, fontSize: W * 0.062, fontStyle: "bold", lineHeight: 1.08 };
  const accentY = imgH + m * 0.9;
  const titleY = accentY + 6 + m * 0.45;
  const titleH = title ? measureText(titleCfg) : 0;
  const bodyY = titleY + titleH + m * 0.35;
  const bodyH = Math.max(0, folioTop(W, H) - m * 0.4 - bodyY);

  return (
    <Group>
      <Rect width={W} height={H} fill={background} />
      <CoverImage src={page.imageUrl} x={0} y={0} width={W} height={imgH} placeholder={accent} />
      <Rect x={m} y={accentY} width={W * 0.06} height={6} fill={accent} />
      {title && <Text {...titleCfg} x={m} y={titleY} fill={text} />}
      {page.body && bodyH > 0 && (
        <Text x={m} y={bodyY} width={cw} height={bodyH} text={page.body} fontFamily={theme.fontBody} fontSize={W * 0.03} lineHeight={1.45} fill={text} opacity={0.85} ellipsis />
      )}
      <Folio W={W} H={H} theme={theme} pageNumber={props.pageNumber} pageCount={props.pageCount} storyName={props.storyName} />
    </Group>
  );
};
