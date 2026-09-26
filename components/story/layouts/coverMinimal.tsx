"use client";

import { Group, Rect, Text } from "react-konva";
import { clampedHeight, editable, fieldText, fitFontSize, GHOST_OPACITY, margin, measureText, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** Fully centred typographic cover: no image, no shapes — just the title and dek stacked in the middle. */
export const CoverMinimal: LayoutComponent = ({ page, theme, width: W, height: H, editingField, onEditField, placeholders }) => {
  const { background, text } = theme.colors;
  const m = margin(W);
  const cw = (W - m * 2) * 0.86;
  const cx = (W - cw) / 2;

  const bottom = H - safeInset(W, H) - m;

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
  const total = titleH + (dek ? gap + dekH : 0);
  const top = Math.max(m + safeInset(W, H), (bottom - total) / 2 + m * 0.2);
  const titleY = top;
  const dekY = titleY + titleH + gap;

  return (
    <Group>
      <Rect width={W} height={H} fill={background} />
      {title && <Text {...titleBase} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={cx} y={titleY} fontSize={titleSize} fill={text} align="center" />}
      {dek && <Text {...dekCfg} {...editable("body", editingField, onEditField)} x={cx} y={dekY} height={dekH} fill={text} opacity={dekF.ghost ? GHOST_OPACITY : 0.75} align="center" ellipsis />}
    </Group>
  );
};
