import EditClient from "@/components/EditClient";

// One page of a story, being edited: ?id=<story>&page=<page> (static export can't pre-render per id).
export default function EditPage() {
  return <EditClient />;
}
