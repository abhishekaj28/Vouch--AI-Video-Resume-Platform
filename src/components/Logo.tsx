import Link from "next/link";

export function Logo({ size = "md", to = "/" }: { size?: "sm" | "md" | "lg"; to?: string }) {
  const box = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <Link href={to} className="flex items-center gap-2.5">
      <div
        className={`${box} grid place-items-center rounded-[10px] bg-brand text-brand-foreground font-black shadow-[0_8px_24px_-8px_rgba(245,197,24,0.6)]`}
        aria-hidden
      >
        <span className="text-[1.15em] leading-none tracking-tighter">V</span>
      </div>
      <span className={`${text} font-heading font-bold tracking-tight text-white`}>Vouch</span>
    </Link>
  );
}
