"use client";

import { Group, Rect, Text } from "react-konva";
import { clampedHeight, editable, fieldText, fitFontSize, GHOST_OPACITY, margin, measureText, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** Fully centred typographic cover: no image, no shapes — just the story name, title and dek stacked in the middle. */
export const CoverMinimal: LayoutComponent = ({ page, theme, width: W, height: H, storyName, editingField, onEditField, placeholders }) => {
  const { background, text, accent } = theme.colors;
  const m = margin(W);
  const cw = (W - m * 2) * 0.86;
  const cx = (W - cw) / 2;

  const hintSize = W * 0.02;
  const hintY = H - safeInset(W, H) - m * 0.85 - hintSize;
  const bottom = hintY - m * 0.5;

  const kickerSize = W * 0.024;
  const kickerH = kickerSize * 1.6;
  const titleF = fieldText(page.title, placeholders?.title);
  const title = titleF.text;
  const titleBase = { text: title, width: cw, fontFamily: theme.fontHeading, fontStyle: "bold", lineHeight: 1.05, align: "center", fontSize: W * 0.1 };
  const titleSize = fitFontSize(titleBase, H * 0.4, W * 0.05);
  const titleH = title ? measureText({ ...titleBase, fontSize: titleSize }) : 0;

  const dekF = fieldText(page.body, placeholders?.body);
  const dek = dekF.text;
  const dekCfg = { text: dek, width: cw, fontFamily: theme.fontBody, fontSize: W * 0.03, lineHeight: 1.4, align: "center" };
  const dekH = dek ? clampedHeight(dekCfg, 3) : 0;

  const gap = m * 0.5;
  const total = kickerH + gap + titleH + (dek ? gap + dekH : 0);
  const top = Math.max(m + safeInset(W, H), (bottom - total) / 2 + m * 0.2);
  const kickerY = top;
  const titleY = kickerY + kickerH + gap;
  const dekY = titleY + titleH + gap;

  return (
    <Group>
      <Rect width={W} height={H} fill={background} />
      <Text x={0} y={kickerY} width={W} align="center" text={storyName.toUpperCase()} fontFamily={theme.fontBody} fontStyle="bold" fontSize={kickerSize} letterSpacing={4} fill={accent} />
      {title && <Text {...titleBase} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={cx} y={titleY} fontSize={titleSize} fill={text} align="center" />}
      {dek && <Text {...dekCfg} {...editable("body", editingField, onEditField)} x={cx} y={dekY} height={dekH} fill={text} opacity={dekF.ghost ? GHOST_OPACITY : 0.75} align="center" ellipsis />}
      <Text x={m} y={hintY} width={W - m * 2} text="DESLIZA →" align="right" fontFamily={theme.fontBody} fontSize={hintSize} fontStyle="bold" letterSpacing={3} fill={text} opacity={0.6} />
    </Group>
  );
};
