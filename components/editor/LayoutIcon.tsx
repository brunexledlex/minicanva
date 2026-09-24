import type { PageLayout } from "@/types/story";

/** Tiny schematic of a layout for the picker (40×50, drawn in currentColor). */
export function LayoutIcon({ id, className = "h-[50px] w-[40px]" }: { id: PageLayout; className?: string }) {
  const img = <rect width="40" height="50" opacity=".35" />;
  const lines = (x: number, y: number, w: number, n: number, gap = 4) =>
    Array.from({ length: n }, (_, i) => <rect key={i} x={x} y={y + i * gap} width={i === n - 1 ? w * 0.6 : w} height="1.6" opacity=".55" />);
  return (
    <svg viewBox="0 0 40 50" className={`fill-current ${className}`} aria-hidden>
      {id === "cover-title-image" && (
        <>
          {img}
          <rect x="5" y="30" width="26" height="4" />
          <rect x="5" y="36" width="18" height="4" />
          <rect x="5" y="43" width="22" height="1.6" opacity=".7" />
        </>
      )}
      {id === "cover-title-only" && (
        <>
          <circle cx="33" cy="15" r="12" opacity=".45" />
          <rect x="5" y="28" width="28" height="5" />
          <rect x="5" y="35" width="20" height="5" />
          <rect x="5" y="43" width="22" height="1.6" opacity=".55" />
        </>
      )}
      {id === "image-top-text-bottom" && (
        <>
          <rect width="40" height="25" opacity=".35" />
          <rect x="5" y="29" width="24" height="3.5" />
          {lines(5, 36, 30, 3)}
        </>
      )}
      {id === "text-only" && (
        <>
          <rect x="5" y="6" width="5" height="1.6" />
          <rect x="5" y="10" width="26" height="3.5" />
          {lines(5, 18, 30, 6)}
        </>
      )}
      {id === "two-column" && (
        <>
          <rect x="5" y="6" width="26" height="3.5" />
          {lines(5, 15, 13.5, 7)}
          {lines(21.5, 15, 13.5, 7)}
        </>
      )}
      {id === "image-full-bleed" && (
        <>
          {img}
          <rect x="5" y="34" width="22" height="3.5" />
          {lines(5, 40, 26, 2)}
        </>
      )}
      {id === "quote-centered" && (
        <>
          <text x="20" y="20" fontSize="18" textAnchor="middle" opacity=".6">“</text>
          <rect x="7" y="22" width="26" height="3" />
          <rect x="10" y="27" width="20" height="3" />
          <rect x="17" y="34" width="6" height="1.4" opacity=".6" />
          <rect x="13" y="38" width="14" height="1.6" opacity=".55" />
        </>
      )}
    </svg>
  );
}
