"use client";

import { useCallback, useState } from "react";
import { saveImage } from "@/lib/images";

/** Stores an uploaded file in IndexedDB and returns its reference, for the caller to point a page at. */
export function usePageImageUpload() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File | undefined): Promise<string | undefined> => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Esse ficheiro não é uma imagem.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      return await saveImage(file);
    } catch {
      setError("Não consegui carregar essa imagem.");
    } finally {
      setBusy(false);
    }
  }, []);

  return { upload, busy, error };
}
