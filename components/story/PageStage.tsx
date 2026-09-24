"use client";

import type Konva from "konva";
import { Layer, Stage } from "react-konva";
import { FORMATS } from "@/lib/formats";
import { PageRenderer, type PageRenderProps } from "./PageRenderer";

type Props = PageRenderProps & {
  scale: number;
  /** Bumps when web fonts finish loading, so text is re-measured. */
  fontsRev: number;
  stageRef?: (stage: Konva.Stage | null) => void;
};

/** A page drawn at native size inside a Stage scaled down for display. */
export function PageStage({ scale, fontsRev, stageRef, ...page }: Props) {
  const { width, height } = FORMATS[page.format];
  return (
    <Stage ref={stageRef} width={width * scale} height={height * scale} scaleX={scale} scaleY={scale} listening={false}>
      <Layer listening={false}>
        <PageRenderer key={fontsRev} {...page} />
      </Layer>
    </Stage>
  );
}
