"use client";

import { Group, Rect, Text } from "react-konva";
import { clampedHeight, CoverImage, editable, fieldText, fitFontSize, GHOST_OPACITY, margin, measureText, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** Split cover: photo on top, title and dek on a plain block below — no gradient or shading needed. */
export const CoverSplit: LayoutComponent = ({ page, theme, width: W, height: H, storyName, editingField, onEditField, placeholders }) => {
  const { background, text, accent } = theme.colors;
  const m = margin(W);
  const cw = W - m * 2;
  const imgH = Math.round(H * 0.56);
  const kickerSize = W * 0.024;
  const kickerY = imgH + m * 0.7;
  const titleTop = kickerY + kickerSize * 2.2;

  const hintSize = W * 0.02;
  let y = H - safeInset(W, H) - m * 0.85 - hintSize;
  const hintY = y;

  const dekF = fieldText(page.body, placeholders?.body);
  const dek = dekF.text;
  const dekCfg = { text: dek, width: cw, fontFamily: theme.fontBody, fontSize: W * 0.03, lineHeight: 1.35 };
  const dekH = dek ? clampedHeight(dekCfg, 2) : 0;
  if (dek) y -= m * 0.4 + dekH;
  const dekY = y;

  const titleF = fieldText(page.title, placeholders?.title);
  const title = titleF.text;
  const titleBase = { text: title, width: cw, fontFamily: theme.fontHeading, fontStyle: "bold", lineHeight: 1.05, fontSize: W * 0.08 };
  const titleMaxH = Math.max(W * 0.08, y - titleTop - m * 0.4);
  const titleSize = fitFontSize(titleBase, titleMaxH, W * 0.045);
  const titleH = title ? measureText({ ...titleBase, fontSize: titleSize }) : 0;
  const titleY = Math.max(titleTop, y - m * 0.4 - titleH);

  return (
    <Group>
      <Rect width={W} height={H} fill={background} />
      <CoverImage src={page.imageUrl} x={0} y={0} width={W} height={imgH} placeholder={accent} />
      <Text x={m} y={kickerY} width={cw} text={storyName.toUpperCase()} fontFamily={theme.fontBody} fontStyle="bold" fontSize={kickerSize} letterSpacing={3} fill={accent} />
      {title && <Text {...titleBase} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={m} y={titleY} fontSize={titleSize} fill={text} />}
      {dek && <Text {...dekCfg} {...editable("body", editingField, onEditField)} x={m} y={dekY} height={dekH} fill={text} opacity={dekF.ghost ? GHOST_OPACITY : 0.75} ellipsis />}
      <Rect x={m} y={hintY + hintSize * 0.4} width={W * 0.08} height={4} fill={accent} />
      <Text x={m} y={hintY} width={cw} text="DESLIZA →" align="right" fontFamily={theme.fontBody} fontSize={hintSize} fontStyle="bold" letterSpacing={3} fill={text} opacity={0.7} />
    </Group>
  );
};
