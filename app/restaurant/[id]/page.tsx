"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { RestaurantResponse, Review } from "@/lib/types";
function formatDate(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
function Stars({ rating }: { rating: number }) { return <span aria-label={rating + " out of 5 stars"}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>; }
export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RestaurantResponse | null>(null);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch("/api/restaurants/" + id).then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Unable to load restaurant."); return payload as RestaurantResponse; })
      .then((payload) => { if (active) setData(payload); }).catch((reason: Error) => { if (active) setError(reason.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <main className="mx-auto max-w-[560px] px-6 py-16">Loading restaurant…</main>;
  if (error || !data) return <main className="mx-auto max-w-[560px] px-6 py-16"><p role="alert">{error || "Restaurant unavailable."}</p></main>;
  const renderReview = (review: Review) => <article key={review.id} className="border-b border-stone-200 py-5"><div className="flex items-center justify-between gap-4 text-sm text-stone-600"><Stars rating={review.rating} /><time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time></div><p className="mt-3 leading-7">{review.comment}</p></article>;
  return <main className="mx-auto min-h-screen max-w-[560px] px-6 py-12 sm:py-16">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Restaurant review</p>
    <header className="mt-4"><h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1><p className="mt-2 text-sm text-stone-500">{data.cuisine} · {data.area}</p></header>
    <section className="mt-10 border-y border-stone-300 py-7" aria-label="Restaurant rating"><div className="flex items-end gap-3"><span className="text-6xl font-semibold tracking-tight">{data.averageRating === null ? "—" : data.averageRating.toFixed(1)}</span><span className="pb-2 text-sm text-stone-500">{data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}</span></div></section>
    {data.latestReview ? <section className="mt-9 rounded-xl border border-stone-300 bg-white/70 p-5" aria-label="Latest review"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Latest review</p>{renderReview(data.latestReview)}</section> : <section className="mt-9 border border-dashed border-stone-300 p-6 text-center"><p className="font-medium">Be the first to review</p><p className="mt-2 text-sm text-stone-500">Share how your visit went.</p></section>}
    <section className="mt-9"><h2 className="text-lg font-semibold">More reviews</h2>{data.reviews.length ? data.reviews.map(renderReview) : <p className="mt-3 text-sm text-stone-500">No older reviews yet.</p>}</section>
    <div className="mt-10"><Link className="inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700" href={"/review/" + id}>Write a review</Link></div>
  </main>;
}
