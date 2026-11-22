"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { RestaurantResponse } from "@/lib/types";
export default function ReviewPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>(); const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null); const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState(""); const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { fetch("/api/restaurants/" + restaurantId).then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Unable to load restaurant."); setRestaurant(payload as RestaurantResponse); }).catch((reason: Error) => setError(reason.message)); }, [restaurantId]);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (rating === null || !comment.trim()) return; setError(""); setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restaurantId: Number(restaurantId), rating, comment }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Unable to save review."); router.push("/restaurant/" + restaurantId);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save review."); } finally { setSubmitting(false); }
  }
  return <main className="mx-auto min-h-screen max-w-[560px] px-6 py-12 sm:py-16">
    <Link href={"/restaurant/" + restaurantId} className="text-sm text-stone-500 hover:text-stone-900">← Back to restaurant</Link>
    <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Your experience</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight">{restaurant?.name || "Write a review"}</h1>
    <p className="mt-2 text-sm text-stone-500">{restaurant ? restaurant.cuisine + " · " + restaurant.area : "Choose a rating and tell us what you think."}</p>
    <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
      <fieldset><legend className="mb-3 text-sm font-medium">Your rating</legend><div className="flex gap-2" role="radiogroup" aria-label="Rating">{[1,2,3,4,5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={value + " star"} onClick={() => setRating(value)} className={"h-12 w-12 rounded-full border text-xl transition " + (rating === value ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white hover:border-stone-700")}>★</button>)}</div></fieldset>
      <label className="block text-sm font-medium" htmlFor="comment">Your review<textarea id="comment" value={comment} onChange={(event) => setComment(event.target.value)} rows={6} maxLength={2000} placeholder="What did you enjoy? What could have been better?" className="mt-3 block w-full resize-y rounded-xl border border-stone-300 bg-white p-4 text-base font-normal leading-7 outline-none focus:border-stone-700" /></label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={rating === null || !comment.trim() || submitting || !restaurant} className="w-full rounded-full bg-stone-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300">{submitting ? "Submitting…" : "Submit review"}</button>
    </form>
  </main>;
}
