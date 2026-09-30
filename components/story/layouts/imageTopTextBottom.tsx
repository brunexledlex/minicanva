"use client";

import { Group, Rect, Text } from "react-konva";
import { contentBottom, CoverImage, editable, fieldText, GHOST_OPACITY, inkFill, margin, measureText, paperFill } from "../primitives";
import type { LayoutComponent } from "./types";

/** Full-bleed image on the top half, title and body below. */
export const ImageTopTextBottom: LayoutComponent = (props) => {
  const { page, theme, width: W, height: H, editingField, onEditField, placeholders } = props;
  const ink = inkFill(page);
  const paper = paperFill(page);
  const m = margin(W);
  const cw = W - m * 2;
  const imgH = Math.round(H * 0.5);

  const titleF = fieldText(page.title, placeholders?.title);
  const title = titleF.text;
  const bodyF = fieldText(page.body, placeholders?.body);
  const body = bodyF.text;
  const titleCfg = { text: title, width: cw, fontFamily: theme.fontHeading, fontSize: W * 0.062, fontStyle: "bold", lineHeight: 1.08 };
  const titleY = imgH + m * 0.9;
  const titleH = title ? measureText(titleCfg) : 0;
  const bodyY = titleY + titleH + m * 0.35;
  const bodyH = Math.max(0, contentBottom(W, H) - bodyY);

  return (
    <Group>
      <Rect width={W} height={H} fill={paper} />
      <CoverImage src={page.imageUrl} x={0} y={0} width={W} height={imgH} paper={paper} fit={page.imageFit} />
      {title && <Text {...titleCfg} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={m} y={titleY} fill={ink} />}
      {body && bodyH > 0 && (
        <Text
          {...editable("body", editingField, onEditField)}
          x={m}
          y={bodyY}
          width={cw}
          height={bodyH}
          text={body}
          fontFamily={theme.fontBody}
          fontSize={W * 0.03}
          lineHeight={1.45}
          fill={ink}
          opacity={bodyF.ghost ? GHOST_OPACITY : 1}
          ellipsis
        />
      )}
    </Group>
  );
};
