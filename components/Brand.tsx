import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:text-accent"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      Zomato Lite
    </Link>
  );
}
