"use client";

import { Group, Rect, Text } from "react-konva";
import { clampedHeight, CoverImage, fitFontSize, margin, Masthead, measureText, safeInset, Shade } from "../primitives";
import type { LayoutComponent } from "./types";

/** Photo cover: full-bleed image, masthead on top, big title and dek stacked from the bottom. */
export const CoverTitleImage: LayoutComponent = ({ page, theme, width: W, height: H, storyName }) => {
  const m = margin(W);
  const cw = W - m * 2;
  const white = "#ffffff";

  const hintSize = W * 0.022;
  let y = H - safeInset(W, H) - m - hintSize; // stack upwards from the swipe hint
  const hintY = y;

  const dek = page.body ?? "";
  const dekCfg = { text: dek, width: cw, fontFamily: theme.fontBody, fontSize: W * 0.032, lineHeight: 1.35 };
  const dekH = dek ? clampedHeight(dekCfg, 3) : 0;
  if (dek) y -= m * 0.5 + dekH;
  const dekY = y;

  const title = page.title ?? "";
  const titleBase = { text: title, width: cw, fontFamily: theme.fontHeading, fontStyle: "bold", lineHeight: 1.02, fontSize: W * 0.105 };
  const titleSize = fitFontSize(titleBase, H * 0.42, W * 0.055);
  const titleH = title ? measureText({ ...titleBase, fontSize: titleSize }) : 0;
  y -= (dek ? m * 0.35 : m * 0.6) + titleH;
  const titleY = y;

  return (
    <Group>
      <Rect width={W} height={H} fill={theme.colors.background} />
      <CoverImage src={page.imageUrl} x={0} y={0} width={W} height={H} placeholder={theme.colors.accent} />
      <Shade W={W} y={0} height={H * 0.22} from={0} to={0.45} flip />
      <Shade W={W} y={H * 0.3} height={H * 0.7} from={0} to={0.8} />
      <Masthead W={W} H={H} theme={theme} storyName={storyName} color={white} />
      <Rect x={m} y={titleY - m * 0.35 - 8} width={W * 0.08} height={8} fill={theme.colors.accent} />
      {title && <Text {...titleBase} x={m} y={titleY} fontSize={titleSize} fill={white} />}
      {dek && <Text {...dekCfg} x={m} y={dekY} height={dekH} fill={white} opacity={0.88} ellipsis />}
      <Text x={m} y={hintY} width={cw} text="DESLIZA →" align="right" fontFamily={theme.fontBody} fontSize={hintSize} fontStyle="bold" letterSpacing={3} fill={white} opacity={0.8} />
    </Group>
  );
};
