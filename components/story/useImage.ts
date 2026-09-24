"use client";

import { useEffect, useState } from "react";
import { loadImage } from "@/lib/images";

export function useImage(src?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    setImage(null);
    if (!src) return;
    let live = true;
    loadImage(src).then(
      (img) => live && setImage(img),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [src]);

  return image;
}
