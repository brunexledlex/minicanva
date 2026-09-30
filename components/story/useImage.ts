"use client";

import { useEffect, useState } from "react";
import { loadPageImage, type PageImage } from "@/lib/images";

/** A page's image, once it's loaded and measured (see loadPageImage). */
export function useImage(src?: string) {
  const [image, setImage] = useState<PageImage | null>(null);

  useEffect(() => {
    setImage(null);
    if (!src) return;
    let live = true;
    loadPageImage(src).then(
      (img) => live && setImage(img),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [src]);

  return image;
}
