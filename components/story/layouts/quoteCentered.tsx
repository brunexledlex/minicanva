"use client";

import { Group, Rect, Text } from "react-konva";
import { contentBottom, editable, fieldText, fitFontSize, GHOST_OPACITY, inkFill, margin, measureText, paperFill, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** Pull quote: the quote (title) and its author (body), centred. */
export const QuoteCentered: LayoutComponent = (props) => {
  const { page, theme, width: W, height: H, editingField, onEditField, placeholders } = props;
  const ink = inkFill(page);
  const paper = paperFill(page);
  const m = margin(W);
  const qw = (W - m * 2) * 0.92;
  const qx = (W - qw) / 2;
  const bottom = contentBottom(W, H);

  const titleF = fieldText(page.title, placeholders?.title);
  const quote = titleF.text;
  const quoteBase = { text: quote, width: qw, fontFamily: theme.fontHeading, fontStyle: "italic", lineHeight: 1.22, align: "center", fontSize: W * 0.072 };
  const quoteSize = fitFontSize(quoteBase, (bottom - m) * 0.62, W * 0.035);
  const quoteH = quote ? measureText({ ...quoteBase, fontSize: quoteSize }) : 0;
  const authorF = fieldText(page.body, placeholders?.body);
  const author = authorF.text.toUpperCase();
  const authorCfg = { text: author, width: qw, fontFamily: theme.fontBody, fontSize: W * 0.026, fontStyle: "bold", letterSpacing: 3, align: "center", lineHeight: 1.3 };
  const authorH = author ? measureText(authorCfg) : 0;

  const gap = m * 0.45;
  const total = quoteH + (author ? gap + authorH : 0);
  const top = Math.max(m + safeInset(W, H), (bottom - total) / 2 + m * 0.2);
  const quoteY = top;
  const authorY = quoteY + quoteH + gap;

  return (
    <Group>
      <Rect width={W} height={H} fill={paper} />
      {quote && <Text {...quoteBase} {...editable("title", editingField, onEditField)} opacity={titleF.ghost ? GHOST_OPACITY : 1} x={qx} y={quoteY} fontSize={quoteSize} fill={ink} />}
      {author && <Text {...authorCfg} {...editable("body", editingField, onEditField)} x={qx} y={authorY} fill={ink} opacity={authorF.ghost ? GHOST_OPACITY : 1} />}
    </Group>
  );
};
