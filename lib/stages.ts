import type Konva from "konva";

/**
 * The filmstrip keeps one small Konva Stage per page. Exports re-render those
 * stages at full size (Konva redraws vectors and images at the requested
 * pixelRatio), so they are the single source for PNG, ZIP and PDF output.
 */
const stages = new Map<string, Konva.Stage>();

export function registerStage(pageId: string, stage: Konva.Stage | null) {
  if (stage) stages.set(pageId, stage);
  else stages.delete(pageId);
}

export const getStage = (pageId: string) => stages.get(pageId);
