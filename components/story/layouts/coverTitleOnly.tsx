"use client";

import { Circle, Group, Rect, Text } from "react-konva";
import { clampedHeight, fitFontSize, margin, Masthead, measureText, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** Typographic cover: masthead, a large accent disc and an oversized title at the foot. */
export const CoverTitleOnly: LayoutComponent = ({ page, theme, width: W, height: H, storyName }) => {
  const { background, text, accent } = theme.colors;
  const m = margin(W);
  const cw = W - m * 2;

  const hintSize = W * 0.022;
  let y = H - safeInset(W, H) - m - hintSize;
  const hintY = y;

  const dek = page.body ?? "";
  const dekCfg = { text: dek, width: cw * 0.85, fontFamily: theme.fontBody, fontSize: W * 0.033, lineHeight: 1.35 };
  const dekH = dek ? clampedHeight(dekCfg, 3) : 0;
  if (dek) y -= m * 0.55 + dekH;
  const dekY = y;

  const title = page.title ?? "";
  const titleBase = { text: title, width: cw, fontFamily: theme.fontHeading, fontStyle: "bold", lineHeight: 1, fontSize: W * 0.135 };
  const titleSize = fitFontSize(titleBase, H * 0.5, W * 0.06);
  const titleH = title ? measureText({ ...titleBase, fontSize: titleSize }) : 0;
  y -= (dek ? m * 0.4 : m * 0.6) + titleH;
  const titleY = y;

  return (
    <Group>
      <Rect width={W} height={H} fill={background} />
      <Circle x={W * 0.82} y={H * 0.3} radius={W * 0.3} fill={accent} />
      <Masthead W={W} H={H} theme={theme} storyName={storyName} color={text} />
      {title && <Text {...titleBase} x={m} y={titleY} fontSize={titleSize} fill={text} />}
      {dek && <Text {...dekCfg} x={m} y={dekY} height={dekH} fill={text} opacity={0.75} ellipsis />}
      <Rect x={m} y={hintY + hintSize * 0.4} width={W * 0.08} height={4} fill={accent} />
      <Text x={m} y={hintY} width={cw} text="DESLIZA →" align="right" fontFamily={theme.fontBody} fontSize={hintSize} fontStyle="bold" letterSpacing={3} fill={text} opacity={0.7} />
    </Group>
  );
};
