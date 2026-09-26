"use client";

import { useEffect, useState } from "react";

/** Loads the regular, bold and italic faces the page layouts draw with. */
export function loadFonts(families: string[]) {
  return Promise.allSettled(families.flatMap((f) => ["400", "700", "italic 400"].map((w) => document.fonts.load(`${w} 40px "${f}"`))));
}

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
    loadFonts(key.split("|")).then(() => live && setRev(0));
    const bump = () => live && setRev((r) => (r ?? 0) + 1);
    document.fonts.addEventListener("loadingdone", bump);
    return () => {
      live = false;
      document.fonts.removeEventListener("loadingdone", bump);
    };
  }, [key]);

  return rev;
}
