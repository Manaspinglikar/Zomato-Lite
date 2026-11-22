"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import { StarIcon } from "@/components/StarIcon";
import type { RestaurantPayload } from "@/lib/types";

type PageStatus = "loading" | "ready" | "not-found" | "error";

const starValues = [1, 2, 3, 4, 5];

export default function ReviewPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [status, setStatus] = useState<PageStatus>("loading");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurant() {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`, {
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
          setRestaurantName(payload.name);
          setStatus("ready");
          document.title = `Write a review | ${payload.name}`;
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    loadRestaurant();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const canSubmit =
    rating !== null && comment.trim().length > 0 && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setApiError(
          payload.error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setApiError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
          <h1 className="font-display text-4xl tracking-[-0.03em]">
            Restaurant not found.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            That restaurant is not in the database, so it cannot be reviewed.
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

      {status === "ready" && (
        <div className="pt-12 sm:pt-16">
          <h1 className="font-display text-[2.8rem] leading-[0.98] tracking-[-0.035em] sm:text-5xl">
            {restaurantName}
          </h1>
          <p className="mt-3 text-sm text-muted">How was your meal?</p>

          <form className="mt-10" onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Your rating
              </legend>
              <div className="mt-3 flex gap-1.5">
                {starValues.map((value) => {
                  const selected = rating !== null && value <= rating;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                      aria-pressed={rating === value}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                        selected
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line bg-white/40 text-ink/20 hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
                      }`}
                    >
                      <StarIcon className="h-6 w-6" />
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted">
                {rating === null
                  ? "Tap a star to rate."
                  : `${rating} of 5 selected.`}
              </p>
            </fieldset>

            <div className="mt-8">
              <label
                htmlFor="comment"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted"
              >
                Your comment
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={5}
                placeholder="What did you order? How was it?"
                className="mt-3 w-full resize-none rounded-2xl border border-line bg-white/50 px-4 py-3.5 text-[0.98rem] leading-7 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
              />
            </div>

            {apiError && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm leading-6 text-accent"
              >
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-7 w-full rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-canvas transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-35"
            >
              {submitting ? "Saving…" : "Submit review"}
            </button>

            <Link
              href={`/restaurant/${restaurantId}`}
              className="mt-4 block text-center text-sm text-muted transition-colors hover:text-ink"
            >
              Back to restaurant
            </Link>
          </form>
        </div>
      )}
    </main>
  );
}
