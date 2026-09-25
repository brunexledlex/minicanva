"use client";

import { Group, Rect, Text } from "react-konva";
import { CoverImage, editable, fieldText, Folio, folioTop, GHOST_OPACITY, margin, measureText, safeInset, splitColumns } from "../primitives";
import type { LayoutComponent } from "./types";

/** Title across the top, optional image band, and the body flowing through two columns. */
export const TwoColumn: LayoutComponent = (props) => {
  const { page, theme, width: W, height: H, editingField, onEditField, placeholders } = props;
  const { background, text, accent } = theme.colors;
  const m = margin(W);
  const cw = W - m * 2;
  const gutter = m * 0.55;
  const colW = (cw - gutter) / 2;

  const accentY = m * 1.3 + safeInset(W, H);
  const titleF = fieldText(page.title, placeholders?.title);
  const title = titleF.text;
  const titleCfg = { text: title, width: cw, fontFamily: theme.fontHeading, fontSize: W * 0.058, fontStyle: "bold", lineHeight: 1.08 };
  const titleY = accentY + 6 + m * 0.45;
  const titleH = title ? measureText(titleCfg) : 0;

  let y = titleY + titleH + m * 0.5;
  const imgY = y;
  const imgH = page.imageUrl ? Math.round(H * 0.26) : 0;
  if (imgH) y += imgH + m * 0.5;
  const colY = y;
  const colH = Math.max(0, folioTop(W, H) - m * 0.45 - colY);

  const bodyF = fieldText(page.body, placeholders?.body);
  const bodyCfg = { text: bodyF.text, width: colW, fontFamily: theme.fontBody, fontSize: W * 0.027, lineHeight: 1.5 };
  const [col1, col2] = bodyF.text && colH > 0 ? splitColumns(bodyCfg, colH) : ["", ""];

  return (
    <Group>
      <Rect width={W} height={H} fill={background} />
      <Rect x={m} y={accentY} width={W * 0.06} height={6} fill={accent} />
      {title && <Text {...titleCfg} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={m} y={titleY} fill={text} />}
      {imgH > 0 && <CoverImage src={page.imageUrl} x={m} y={imgY} width={cw} height={imgH} placeholder={accent} />}
      {col1 && <Text {...bodyCfg} {...editable("body", editingField, onEditField)} text={col1} x={m} y={colY} height={colH} fill={text} opacity={bodyF.ghost ? GHOST_OPACITY : 0.88} />}
      {col2 && (
        <>
          <Rect x={m + colW + gutter / 2} y={colY} width={1} height={colH} fill={text} opacity={0.18} />
          <Text {...bodyCfg} {...editable("body", editingField, onEditField)} text={col2} x={m + colW + gutter} y={colY} height={colH} fill={text} opacity={bodyF.ghost ? GHOST_OPACITY : 0.88} ellipsis />
        </>
      )}
      <Folio W={W} H={H} theme={theme} pageNumber={props.pageNumber} pageCount={props.pageCount} storyName={props.storyName} />
    </Group>
  );
};
