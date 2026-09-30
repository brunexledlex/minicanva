"use client";

import { Group, Rect, Text } from "react-konva";
import { clampedHeight, editable, fieldText, fitFontSize, GHOST_OPACITY, inkFill, margin, measureText, paperFill, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** Typographic cover: an oversized title stacked at the foot, no image. */
export const CoverTitleOnly: LayoutComponent = ({ page, theme, width: W, height: H, editingField, onEditField, placeholders }) => {
  const ink = inkFill(page);
  const paper = paperFill(page);
  const m = margin(W);
  const cw = W - m * 2;

  let y = H - safeInset(W, H) - m;

  const dekF = fieldText(page.body, placeholders?.body);
  const dek = dekF.text;
  const dekCfg = { text: dek, width: cw * 0.85, fontFamily: theme.fontBody, fontSize: W * 0.033, lineHeight: 1.35 };
  const dekH = dek ? clampedHeight(dekCfg, 3) : 0;
  if (dek) y -= m * 0.55 + dekH;
  const dekY = y;

  const titleF = fieldText(page.title, placeholders?.title);
  const title = titleF.text;
  const titleBase = { text: title, width: cw, fontFamily: theme.fontHeading, fontStyle: "bold", lineHeight: 1, fontSize: W * 0.135 };
  const titleSize = fitFontSize(titleBase, H * 0.5, W * 0.06);
  const titleH = title ? measureText({ ...titleBase, fontSize: titleSize }) : 0;
  y -= (dek ? m * 0.4 : m * 0.6) + titleH;
  const titleY = y;

  return (
    <Group>
      <Rect width={W} height={H} fill={paper} />
      {title && <Text {...titleBase} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={m} y={titleY} fontSize={titleSize} fill={ink} />}
      {dek && <Text {...dekCfg} {...editable("body", editingField, onEditField)} x={m} y={dekY} height={dekH} fill={ink} opacity={dekF.ghost ? GHOST_OPACITY : 1} ellipsis />}
    </Group>
  );
};
