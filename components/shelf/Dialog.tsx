"use client";

import { type ReactNode, useEffect, useRef } from "react";

/** A modal on the native <dialog>, which brings focus trapping, Escape and the backdrop. Content mounts fresh on each open. */
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="max-h-[min(90vh,720px)] w-[min(calc(100vw-32px),400px)] overflow-y-auto rounded-2xl bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/40 dark:bg-neutral-900 dark:text-neutral-100"
    >
      {open && (
        <div className="p-5">
          <h2 className="mb-3 font-['Playfair_Display',serif] text-xl font-bold">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

export const btnPrimary = "h-10 rounded-lg bg-[#1b1a17] px-4 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-[#ece6db] dark:text-[#1b1a17] dark:hover:bg-white";
export const btnSecondary = "h-10 rounded-lg border border-neutral-200 px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800";
