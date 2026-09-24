"use client";

import { Group, Rect, Text } from "react-konva";
import { fitFontSize, Folio, folioTop, margin, measureText, safeInset } from "../primitives";
import type { LayoutComponent } from "./types";

/** Pull quote: oversized quotation mark, the quote (title) and its author (body), centred. */
export const QuoteCentered: LayoutComponent = (props) => {
  const { page, theme, width: W, height: H } = props;
  const { background, text, accent } = theme.colors;
  const m = margin(W);
  const qw = (W - m * 2) * 0.92;
  const qx = (W - qw) / 2;
  const bottom = folioTop(W, H) - m * 0.4;

  const markSize = W * 0.3;
  const markH = markSize * 0.5; // the glyph sits in the top half of its line box
  const quote = page.title ?? "";
  const quoteBase = { text: quote, width: qw, fontFamily: theme.fontHeading, fontStyle: "italic", lineHeight: 1.22, align: "center", fontSize: W * 0.072 };
  const quoteSize = fitFontSize(quoteBase, (bottom - m) * 0.62, W * 0.035);
  const quoteH = quote ? measureText({ ...quoteBase, fontSize: quoteSize }) : 0;
  const author = (page.body ?? "").toUpperCase();
  const authorCfg = { text: author, width: qw, fontFamily: theme.fontBody, fontSize: W * 0.026, fontStyle: "bold", letterSpacing: 3, align: "center", lineHeight: 1.3 };
  const authorH = author ? measureText(authorCfg) : 0;

  const gap = m * 0.45;
  const total = markH + gap + quoteH + (author ? gap + 4 + gap + authorH : 0);
  const top = Math.max(m + safeInset(W, H), (bottom - total) / 2 + m * 0.2);
  const quoteY = top + markH + gap;
  const ruleY = quoteY + quoteH + gap;

  return (
    <Group>
      <Rect width={W} height={H} fill={background} />
      <Text x={0} y={top - markSize * 0.08} width={W} align="center" text="“" fontFamily={theme.fontHeading} fontStyle="bold" fontSize={markSize} lineHeight={1} fill={accent} />
      {quote && <Text {...quoteBase} x={qx} y={quoteY} fontSize={quoteSize} fill={text} />}
      {author && (
        <>
          <Rect x={W / 2 - W * 0.03} y={ruleY} width={W * 0.06} height={4} fill={accent} />
          <Text {...authorCfg} x={qx} y={ruleY + 4 + gap} fill={text} opacity={0.7} />
        </>
      )}
      <Folio W={W} H={H} theme={theme} pageNumber={props.pageNumber} pageCount={props.pageCount} storyName={props.storyName} />
    </Group>
  );
};
