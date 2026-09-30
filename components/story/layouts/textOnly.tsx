"use client";

import { Group, Rect, Text } from "react-konva";
import { contentBottom, editable, fieldText, GHOST_OPACITY, inkFill, margin, measureText, paperFill, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** A reading page: title and a generous body column. */
export const TextOnly: LayoutComponent = (props) => {
  const { page, theme, width: W, height: H, editingField, onEditField, placeholders } = props;
  const ink = inkFill(page);
  const paper = paperFill(page);
  const m = margin(W);
  const cw = W - m * 2;

  const titleF = fieldText(page.title, placeholders?.title);
  const title = titleF.text;
  const bodyF = fieldText(page.body, placeholders?.body);
  const body = bodyF.text;
  const titleCfg = { text: title, width: cw, fontFamily: theme.fontHeading, fontSize: W * 0.07, fontStyle: "bold", lineHeight: 1.06 };
  const titleY = m * 1.4 + safeInset(W, H);
  const titleH = title ? measureText(titleCfg) : 0;
  const bodyY = titleY + titleH + m * 0.5;
  const bodyH = Math.max(0, contentBottom(W, H) - bodyY);

  return (
    <Group>
      <Rect width={W} height={H} fill={paper} />
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
          fontSize={W * 0.035}
          lineHeight={1.5}
          fill={ink}
          opacity={bodyF.ghost ? GHOST_OPACITY : 1}
          ellipsis
        />
      )}
    </Group>
  );
};
