import EditorClient from "@/components/EditorClient";

// Static export can't pre-render a page per story id, so the story comes in as ?id=.
export default function EditorPage() {
  return <EditorClient />;
}
