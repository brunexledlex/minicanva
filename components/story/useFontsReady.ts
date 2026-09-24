"use client";

import { useEffect, useState } from "react";

/**
 * Konva measures text when a node is created, so pages must wait for their
 * web fonts. Returns null until the fonts are loaded, then a revision number
 * that bumps whenever the browser finishes loading more faces — use it as a
 * React key to re-measure.
 */
export function useFontsReady(families: string[]) {
  const key = families.join("|");
  const [rev, setRev] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    setRev(null);
    const loads = key
      .split("|")
      .flatMap((f) => ["400", "700", "italic 400"].map((w) => document.fonts.load(`${w} 40px "${f}"`)));
    Promise.allSettled(loads).then(() => live && setRev(0));
    const bump = () => live && setRev((r) => (r ?? 0) + 1);
    document.fonts.addEventListener("loadingdone", bump);
    return () => {
      live = false;
      document.fonts.removeEventListener("loadingdone", bump);
    };
  }, [key]);

  return rev;
}
