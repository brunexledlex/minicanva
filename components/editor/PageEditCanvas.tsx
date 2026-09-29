"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { getLayoutDef } from "@/components/story/layouts";
import type { EditableField } from "@/components/story/layouts/types";
import { PageStage } from "@/components/story/PageStage";
import { FORMATS } from "@/lib/formats";
import { allPages, useEditor } from "@/lib/store";
import type { StoryPage } from "@/types/story";
import { InlineTextOverlay } from "./InlineTextOverlay";
import { usePageImageUpload } from "./usePageImage";

/** The edit screen's page, as large as fits: double-tap its text to edit it in place, or drop an image onto it. Changes go to `onChange` (the draft), not the story. */
export function PageEditCanvas({ page, fontsRev, onChange }: { page: StoryPage; fontsRev: number | null; onChange: (patch: Partial<StoryPage>) => void }) {
  const story = useEditor((s) => s.story);
  const pages = allPages(story);
  const index = Math.max(0, pages.findIndex((p) => p.id === page.id));
  const { width, height } = FORMATS[story.format];

  const stageRef = useRef<Konva.Stage | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = box.w && box.h ? Math.min(box.w / width, box.h / height, 1) : 0;

  const { upload } = usePageImageUpload();
  const [dropping, setDropping] = useState(false);

  return (
    <div
      className="relative min-h-0 flex-1"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setDropping(false);
        const imageUrl = await upload(e.dataTransfer.files[0]);
        if (imageUrl) onChange({ imageUrl });
      }}
    >
      {/* Edge to edge on a phone, as in the design; a little breathing room on bigger screens. */}
      <div ref={boxRef} className="absolute inset-0 flex items-center justify-center md:inset-6">
        {scale > 0 && fontsRev !== null ? (
          <div className="relative shadow-[0_12px_40px_rgba(0,0,0,.12)]" style={{ width: width * scale, height: height * scale }}>
            <PageStage
              stageRef={(s) => {
                if (s) stageRef.current = s;
              }}
              interactive
              page={page}
              theme={story.theme}
              format={story.format}
              storyName={story.name}
              pageNumber={index + 1}
              pageCount={pages.length}
              scale={scale}
              fontsRev={fontsRev}
              editingField={editingField}
              onEditField={setEditingField}
            />
            <InlineTextOverlay
              stage={stageRef.current}
              field={editingField}
              value={(editingField === "title" ? page.title : editingField === "body" ? page.body : "") ?? ""}
              placeholder={editingField ? getLayoutDef(page.layout)?.fields[editingField] : undefined}
              onChange={(v) => onChange(editingField === "title" ? { title: v } : { body: v })}
              onClose={() => setEditingField(null)}
              scale={scale}
              measureDeps={[page.title, page.body, page.layout]}
            />
          </div>
        ) : (
          <p className="text-sm text-neutral-500">A carregar…</p>
        )}
      </div>

      {dropping && (
        <div className="pointer-events-none absolute inset-3 grid place-items-center rounded-2xl border-2 border-dashed border-indigo-500 bg-indigo-500/10 text-sm font-medium text-indigo-600">
          Larga a imagem para a usar nesta página
        </div>
      )}
    </div>
  );
}
