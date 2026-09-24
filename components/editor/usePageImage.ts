"use client";

import { useCallback, useState } from "react";
import { saveImage } from "@/lib/images";
import { useEditor } from "@/lib/store";

/** Stores an uploaded file in IndexedDB and points the page at it. */
export function usePageImageUpload() {
  const updatePage = useEditor((s) => s.updatePage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (pageId: string, file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Esse ficheiro não é uma imagem.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        updatePage(pageId, { imageUrl: await saveImage(file) });
      } catch {
        setError("Não consegui carregar essa imagem.");
      } finally {
        setBusy(false);
      }
    },
    [updatePage],
  );

  return { upload, busy, error };
}
