"use client";

import { Group, Rect, Text } from "react-konva";
import { clampedHeight, contentBottom, CoverImage, editable, fieldText, GHOST_OPACITY, inkFill, margin, paperFill } from "../primitives";
import type { LayoutComponent } from "./types";

/** Edge-to-edge photo with an optional title and caption printed over it. */
export const ImageFullBleed: LayoutComponent = (props) => {
  const { page, theme, width: W, height: H, editingField, onEditField, placeholders } = props;
  const m = margin(W);
  const cw = W - m * 2;
  const ink = inkFill(page);
  const paper = paperFill(page);

  let y = contentBottom(W, H);
  const capF = fieldText(page.body, placeholders?.body);
  const caption = capF.text;
  const capCfg = { text: caption, width: cw, fontFamily: theme.fontBody, fontSize: W * 0.029, lineHeight: 1.4 };
  const capH = caption ? clampedHeight(capCfg, 3) : 0;
  if (caption) y -= capH;
  const capY = y;

  const titleF = fieldText(page.title, placeholders?.title);
  const title = titleF.text;
  const titleCfg = { text: title, width: cw, fontFamily: theme.fontHeading, fontSize: W * 0.064, fontStyle: "bold", lineHeight: 1.05 };
  const titleH = title ? clampedHeight(titleCfg, 4) : 0;
  if (title) y -= (caption ? m * 0.3 : 0) + titleH;
  const titleY = y;

  return (
    <Group>
      <Rect width={W} height={H} fill={paper} />
      <CoverImage src={page.imageUrl} x={0} y={0} width={W} height={H} paper={paper} fit={page.imageFit} />
      {title && <Text {...titleCfg} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={m} y={titleY} height={titleH} fill={ink} ellipsis />}
      {caption && <Text {...capCfg} {...editable("body", editingField, onEditField)} x={m} y={capY} height={capH} fill={ink} opacity={capF.ghost ? GHOST_OPACITY : 1} ellipsis />}
    </Group>
  );
};
