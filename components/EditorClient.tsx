"use client";

import dynamic from "next/dynamic";

// Konva needs `window`, so the editor only renders in the browser.
const Editor = dynamic(() => import("./Editor"), { ssr: false });

export default function EditorClient() {
  return <Editor />;
}
