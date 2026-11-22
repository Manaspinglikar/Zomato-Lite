"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import { StarIcon } from "@/components/StarIcon";
import { formatReviewDate } from "@/lib/format";
import type { RestaurantPayload } from "@/lib/types";

type PageStatus = "loading" | "ready" | "not-found" | "error";

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<RestaurantPayload | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurant() {
      setStatus("loading");

      try {
        const response = await fetch(`/api/restaurants/${id}`, {
          cache: "no-store",
        });

        if (cancelled) return;

        if (response.status === 404) {
          setStatus("not-found");
          return;
        }

        if (!response.ok) {
          setStatus("error");
          return;
        }

        const payload = (await response.json()) as RestaurantPayload;

        if (!cancelled) {
          setRestaurant(payload);
          setStatus("ready");
          document.title = `${payload.name} | Zomato Lite`;
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    loadRestaurant();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-content px-5 pb-24 sm:px-6">
      <header className="pt-8">
        <Brand />
      </header>

      {status === "loading" && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-muted" aria-live="polite">
            Loading restaurant…
          </p>
        </div>
      )}

      {status === "not-found" && (
        <div className="flex min-h-[60vh] flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            404
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-[-0.03em]">
            Restaurant not found.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            That restaurant is not in the database.
          </p>
          <Link
            href="/"
            className="mt-6 w-fit border-b border-accent/40 pb-1 text-sm font-medium text-accent"
          >
            Go home
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex min-h-[60vh] flex-col justify-center">
          <h1 className="font-display text-4xl tracking-[-0.03em]">
            We could not load this page.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Please refresh the page and try again.
          </p>
        </div>
      )}

      {status === "ready" && restaurant && (
        <article className="pt-12 sm:pt-16">
          <h1 className="font-display text-[2.8rem] leading-[0.98] tracking-[-0.035em] sm:text-5xl">
            {restaurant.name}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {restaurant.cuisine} · {restaurant.area}
          </p>

          <section
            className="mt-10 border-y border-line py-8"
            aria-label="Rating summary"
          >
            <div className="flex items-end gap-4">
              <p className="font-display text-[4.6rem] leading-none tracking-[-0.05em]">
                {restaurant.averageRating === null
                  ? "—"
                  : restaurant.averageRating}
              </p>
              <div className="pb-1.5">
                <p className="text-sm font-medium">
                  {restaurant.averageRating === null
                    ? "No rating yet"
                    : "out of 5"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {restaurant.totalReviews}{" "}
                  {restaurant.totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-9 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl tracking-[-0.02em]">
              Latest review
            </h2>
            {restaurant.latestReview && (
              <Link
                href={`/review/${id}`}
                className="shrink-0 border-b border-accent/40 pb-0.5 text-sm font-medium text-accent transition-colors hover:border-accent"
              >
                Write a review
              </Link>
            )}
          </div>

          {restaurant.latestReview ? (
            <article className="mt-4 rounded-card border border-[#eadfce] bg-highlight p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Most recent
                </p>
                <p className="inline-flex items-center gap-1.5 text-sm font-medium">
                  <StarIcon className="h-3.5 w-3.5 text-accent" />
                  {restaurant.latestReview.rating} / 5
                </p>
              </div>
              <p className="mt-5 font-display text-[1.45rem] leading-[1.4]">
                {restaurant.latestReview.comment}
              </p>
              <p className="mt-5 text-xs text-muted">
                {formatReviewDate(restaurant.latestReview.createdAt)}
              </p>
            </article>
          ) : (
            <div className="mt-4 rounded-card border border-dashed border-line px-5 py-10 text-center">
              <p className="font-display text-2xl tracking-[-0.02em]">
                No reviews yet.
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted">
                Be the first person to tell everyone what you thought.
              </p>
              <Link
                href={`/review/${id}`}
                className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-accent"
              >
                Write the first review
              </Link>
            </div>
          )}

          {restaurant.reviews.length > 0 && (
            <section className="mt-10" aria-labelledby="earlier-reviews">
              <h2
                id="earlier-reviews"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted"
              >
                Earlier reviews
              </h2>
              <ol className="mt-2 border-t border-line">
                {restaurant.reviews.map((review) => (
                  <li key={review.id} className="border-b border-line py-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <StarIcon className="h-3.5 w-3.5 text-accent" />
                        {review.rating} / 5
                      </p>
                      <p className="text-right text-xs text-muted">
                        {formatReviewDate(review.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2.5 text-[0.98rem] leading-7">
                      {review.comment}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>
      )}
    </main>
  );
}
