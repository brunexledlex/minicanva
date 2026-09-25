"use client";

import { Group, Rect, Text } from "react-konva";
import { clampedHeight, CoverImage, editable, fieldText, fitFontSize, GHOST_OPACITY, margin, measureText, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** Photo card cover: the image sits inset with a thin frame, breathing room all around, title below. */
export const CoverFrame: LayoutComponent = ({ page, theme, width: W, height: H, storyName, editingField, onEditField, placeholders }) => {
  const { background, text, accent } = theme.colors;
  const m = margin(W);
  const cw = W - m * 2;
  const frameTop = m * 1.6 + safeInset(W, H);
  const frameH = H * 0.48;
  const titleTop = frameTop + frameH + m * 0.7;

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
  const titleBase = { text: title, width: cw, fontFamily: theme.fontHeading, fontStyle: "bold", lineHeight: 1.05, fontSize: W * 0.075 };
  const titleMaxH = Math.max(W * 0.07, y - titleTop - m * 0.4);
  const titleSize = fitFontSize(titleBase, titleMaxH, W * 0.04);
  const titleH = title ? measureText({ ...titleBase, fontSize: titleSize }) : 0;
  const titleY = Math.max(titleTop, y - m * 0.4 - titleH);

  return (
    <Group>
      <Rect width={W} height={H} fill={background} />
      <Text x={m} y={m * 0.6 + safeInset(W, H)} width={cw} text={storyName.toUpperCase()} fontFamily={theme.fontBody} fontStyle="bold" fontSize={W * 0.022} letterSpacing={3} fill={accent} />
      <Rect x={m - 4} y={frameTop - 4} width={cw + 8} height={frameH + 8} stroke={accent} strokeWidth={2} />
      <CoverImage src={page.imageUrl} x={m} y={frameTop} width={cw} height={frameH} placeholder={accent} />
      {title && <Text {...titleBase} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={m} y={titleY} fontSize={titleSize} fill={text} />}
      {dek && <Text {...dekCfg} {...editable("body", editingField, onEditField)} x={m} y={dekY} height={dekH} fill={text} opacity={dekF.ghost ? GHOST_OPACITY : 0.75} ellipsis />}
      <Rect x={m} y={hintY + hintSize * 0.4} width={W * 0.08} height={4} fill={accent} />
      <Text x={m} y={hintY} width={cw} text="DESLIZA →" align="right" fontFamily={theme.fontBody} fontSize={hintSize} fontStyle="bold" letterSpacing={3} fill={text} opacity={0.7} />
    </Group>
  );
};
