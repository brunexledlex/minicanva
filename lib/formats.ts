import type { StoryFormat } from "@/types/story";

export const FORMATS: Record<StoryFormat, { width: number; height: number; label: string }> = {
  "1:1": { width: 1080, height: 1080, label: "Quadrado" },
  "4:5": { width: 1080, height: 1350, label: "Retrato" },
  "9:16": { width: 1080, height: 1920, label: "Story" },
};
