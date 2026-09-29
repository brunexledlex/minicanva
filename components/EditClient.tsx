"use client";

import dynamic from "next/dynamic";

// Konva needs `window`, so the edit screen only renders in the browser.
const EditScreen = dynamic(() => import("./EditScreen"), { ssr: false });

export default function EditClient() {
  return <EditScreen />;
}
