"use client";

import { Group, Rect, Text } from "react-konva";
import { clampedHeight, CoverImage, editable, fieldText, fitFontSize, GHOST_OPACITY, margin, measureText, paperFill, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** Photo cover: full-bleed image, big title and dek stacked from the bottom. */
export const CoverTitleImage: LayoutComponent = ({ page, theme, width: W, height: H, editingField, onEditField, placeholders }) => {
  const m = margin(W);
  const cw = W - m * 2;
  const white = "#ffffff";
  const paper = paperFill(page, theme);

  let y = H - safeInset(W, H) - m;

  const dekF = fieldText(page.body, placeholders?.body);
  const dek = dekF.text;
  const dekCfg = { text: dek, width: cw, fontFamily: theme.fontBody, fontSize: W * 0.032, lineHeight: 1.35 };
  const dekH = dek ? clampedHeight(dekCfg, 3) : 0;
  if (dek) y -= m * 0.5 + dekH;
  const dekY = y;

  const titleF = fieldText(page.title, placeholders?.title);
  const title = titleF.text;
  const titleBase = { text: title, width: cw, fontFamily: theme.fontHeading, fontStyle: "bold", lineHeight: 1.02, fontSize: W * 0.105 };
  const titleSize = fitFontSize(titleBase, H * 0.42, W * 0.055);
  const titleH = title ? measureText({ ...titleBase, fontSize: titleSize }) : 0;
  y -= (dek ? m * 0.35 : m * 0.6) + titleH;
  const titleY = y;

  return (
    <Group>
      <Rect width={W} height={H} fill={paper} />
      <CoverImage src={page.imageUrl} x={0} y={0} width={W} height={H} placeholder={theme.colors.accent} background={paper} fit={page.imageFit} />
      {title && <Text {...titleBase} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={m} y={titleY} fontSize={titleSize} fill={white} />}
      {dek && <Text {...dekCfg} {...editable("body", editingField, onEditField)} x={m} y={dekY} height={dekH} fill={white} opacity={dekF.ghost ? GHOST_OPACITY : 0.88} ellipsis />}
    </Group>
  );
};
