"use client";

import { FORMATS } from "@/lib/formats";
import { loadImage } from "@/lib/images";
import { getStage } from "@/lib/stages";
import { allPages } from "@/lib/store";
import type { Story, StoryPage } from "@/types/story";

export const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "story";

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

const frame = () => new Promise((r) => requestAnimationFrame(r));

/** Waits until every page's image and font is loaded and drawn into its stage. */
async function ready(pages: StoryPage[]) {
  await Promise.allSettled(pages.map((p) => (p.imageUrl ? loadImage(p.imageUrl) : null)));
  await document.fonts.ready;
  await frame();
  await frame();
}

/** Renders a page at its exact format size (times `scale`) from its filmstrip stage. */
function renderPage(story: Story, pageId: string, scale: number, mimeType = "image/png", quality?: number) {
  const stage = getStage(pageId);
  if (!stage) throw new Error("A página ainda não está pronta para exportar.");
  const { width } = FORMATS[story.format];
  return stage.toDataURL({ mimeType, quality, pixelRatio: (width / stage.width()) * scale });
}

const fileBase = (story: Story, index: number) => `${slug(story.name)}-${String(index + 1).padStart(2, "0")}`;

export async function exportPagePng(story: Story, pageId: string, scale: number) {
  const pages = allPages(story);
  const i = Math.max(0, pages.findIndex((p) => p.id === pageId));
  await ready([pages[i]]);
  download(renderPage(story, pages[i].id, scale), `${fileBase(story, i)}.png`);
}

export async function exportZip(story: Story, scale: number) {
  const { default: JSZip } = await import("jszip");
  const pages = allPages(story);
  await ready(pages);
  const zip = new JSZip();
  pages.forEach((p, i) => zip.file(`${fileBase(story, i)}.png`, renderPage(story, p.id, scale).split(",")[1], { base64: true }));
  const url = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
  download(url, `${slug(story.name)}.zip`);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** One PDF page per story page, either at the format's own size or centred on A4. */
export async function exportPdf(story: Story, paper: "format" | "a4", scale: number) {
  const { jsPDF } = await import("jspdf");
  const pages = allPages(story);
  await ready(pages);
  const { width: W, height: H } = FORMATS[story.format];
  const pdf =
    paper === "format"
      ? new jsPDF({ unit: "px", format: [W, H], orientation: "portrait", hotfixes: ["px_scaling"] })
      : new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  pages.forEach((p, i) => {
    if (i > 0) {
      if (paper === "format") pdf.addPage([W, H], "portrait");
      else pdf.addPage("a4", "portrait");
    }
    const img = renderPage(story, p.id, scale, "image/jpeg", 0.92);
    if (paper === "format") {
      pdf.addImage(img, "JPEG", 0, 0, W, H);
    } else {
      const pw = 210, ph = 297, pad = 12;
      const s = Math.min((pw - pad * 2) / W, (ph - pad * 2) / H);
      pdf.addImage(img, "JPEG", (pw - W * s) / 2, (ph - H * s) / 2, W * s, H * s);
    }
  });
  pdf.save(`${slug(story.name)}.pdf`);
}
