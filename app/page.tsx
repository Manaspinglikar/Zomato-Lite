import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content flex-col px-5 sm:px-6">
      <header className="pt-8">
        <Brand />
      </header>

      <div className="flex flex-1 flex-col justify-center pb-24">
        <p className="font-display text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">
          Zomato Lite — Ludhiana Burrito
        </p>
        <Link
          href="/restaurant/1"
          className="mt-6 inline-flex w-fit items-center gap-2 border-b border-accent/40 pb-1 text-sm font-medium text-accent transition-colors hover:border-accent"
        >
          Read the reviews
          <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
