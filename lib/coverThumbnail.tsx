"use client";

import type Konva from "konva";
import { createRoot } from "react-dom/client";
import { PageStage } from "@/components/story/PageStage";
import { loadFonts } from "@/components/story/useFontsReady";
import { FORMATS } from "@/lib/formats";
import { loadPageImage } from "@/lib/images";
import type { Story } from "@/types/story";

// Yields one task so React can commit, like React's own scheduler does. Unlike
// requestAnimationFrame this isn't paused in background tabs; nothing here needs a paint,
// since Konva's toDataURL redraws the scene itself.
const tick = () =>
  new Promise<void>((resolve) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = () => resolve();
    port2.postMessage(null);
  });

/**
 * Renders a story's cover off-screen through the same PageStage the editor and the exports
 * draw with, and returns it as a small data URL for the shelf. It doesn't need the editor to
 * be open (the exports read the filmstrip's stages, which only exist there), so the shelf can
 * also make thumbnails on demand for stories saved before thumbnails existed.
 */
export async function generateCoverThumbnail(story: Story, targetWidth = 300, mimeType = "image/jpeg"): Promise<string> {
  const { cover, theme, format } = story;
  await loadFonts([theme.fontHeading, theme.fontBody]);
  const hasImage = cover.imageUrl ? await loadPageImage(cover.imageUrl).then(() => true, () => false) : false;

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-100000px;top:0;pointer-events:none";
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    const stage = await new Promise<Konva.Stage>((resolve) =>
      root.render(
        <PageStage
          page={cover}
          theme={theme}
          format={format}
          storyName={story.name}
          pageNumber={1}
          pageCount={story.pages.length + 1}
          scale={targetWidth / FORMATS[format].width}
          fontsRev={0}
          stageRef={(s) => s && resolve(s)}
        />,
      ),
    );
    // The cover image is drawn a render later: useImage only sets it once its promise resolves.
    for (let i = 0; hasImage && i < 100 && !stage.findOne("Image"); i++) await tick();
    return stage.toDataURL({ mimeType, quality: 0.82, pixelRatio: 1 });
  } finally {
    root.unmount();
    host.remove();
  }
}
