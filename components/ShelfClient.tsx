"use client";

import dynamic from "next/dynamic";

// The shelf reads the saved stories from localStorage, so it only renders in the browser.
const Shelf = dynamic(() => import("./shelf/Shelf"), { ssr: false });

export default function ShelfClient() {
  return <Shelf />;
}
