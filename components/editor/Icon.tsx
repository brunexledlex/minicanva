export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={`material-symbols-sharp select-none text-[20px] leading-none ${className}`}>
      {name}
    </span>
  );
}
