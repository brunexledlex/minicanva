"use client";

import { Group, Rect, Text } from "react-konva";
import { contentBottom, CoverImage, editable, fieldText, GHOST_OPACITY, margin, measureText, paperFill, safeInset, splitColumns } from "../primitives";
import type { LayoutComponent } from "./types";

/** Title across the top, optional image band, and the body flowing through two columns. */
export const TwoColumn: LayoutComponent = (props) => {
  const { page, theme, width: W, height: H, editingField, onEditField, placeholders } = props;
  const { text, accent } = theme.colors;
  const paper = paperFill(page, theme);
  const m = margin(W);
  const cw = W - m * 2;
  const gutter = m * 0.55;
  const colW = (cw - gutter) / 2;

  const titleF = fieldText(page.title, placeholders?.title);
  const title = titleF.text;
  const titleCfg = { text: title, width: cw, fontFamily: theme.fontHeading, fontSize: W * 0.058, fontStyle: "bold", lineHeight: 1.08 };
  const titleY = m * 1.3 + safeInset(W, H);
  const titleH = title ? measureText(titleCfg) : 0;

  let y = titleY + titleH + m * 0.5;
  const imgY = y;
  const imgH = page.imageUrl ? Math.round(H * 0.26) : 0;
  if (imgH) y += imgH + m * 0.5;
  const colY = y;
  const colH = Math.max(0, contentBottom(W, H) - colY);

  const bodyF = fieldText(page.body, placeholders?.body);
  const bodyCfg = { text: bodyF.text, width: colW, fontFamily: theme.fontBody, fontSize: W * 0.027, lineHeight: 1.5 };
  const [col1, col2] = bodyF.text && colH > 0 ? splitColumns(bodyCfg, colH) : ["", ""];

  return (
    <Group>
      <Rect width={W} height={H} fill={paper} />
      {title && <Text {...titleCfg} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={m} y={titleY} fill={text} />}
      {imgH > 0 && <CoverImage src={page.imageUrl} x={m} y={imgY} width={cw} height={imgH} placeholder={accent} background={paper} fit={page.imageFit} />}
      {col1 && <Text {...bodyCfg} {...editable("body", editingField, onEditField)} text={col1} x={m} y={colY} height={colH} fill={text} opacity={bodyF.ghost ? GHOST_OPACITY : 0.88} />}
      {col2 && (
        <Text {...bodyCfg} {...editable("body", editingField, onEditField)} text={col2} x={m + colW + gutter} y={colY} height={colH} fill={text} opacity={bodyF.ghost ? GHOST_OPACITY : 0.88} ellipsis />
      )}
    </Group>
  );
};
