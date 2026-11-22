import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
export const runtime = "nodejs";
type ReviewRow = { id: number; rating: number; comment: string; created_at: string | Date };
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const restaurantId = Number(rawId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  try {
    const sql = getSql();
    const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants WHERE id = ${restaurantId} LIMIT 1`;
    if (restaurants.length === 0) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    const [metrics] = await sql`SELECT ROUND(AVG(rating)::numeric, 1) AS average_rating, COUNT(*)::int AS total_reviews FROM reviews WHERE restaurant_id = ${restaurantId}`;
    const reviewRows = await sql`SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = ${restaurantId} ORDER BY created_at DESC, id DESC` as ReviewRow[];
    const toReview = (review: ReviewRow) => ({ id: review.id, rating: review.rating, comment: review.comment, createdAt: new Date(review.created_at).toISOString() });
    return NextResponse.json({
      name: restaurants[0].name, cuisine: restaurants[0].cuisine, area: restaurants[0].area,
      averageRating: metrics.average_rating === null ? null : Number(metrics.average_rating), totalReviews: Number(metrics.total_reviews),
      latestReview: reviewRows.length ? toReview(reviewRows[0]) : null, reviews: reviewRows.slice(1).map(toReview),
    });
  } catch (error) {
    console.error("Failed to load restaurant", error);
    return NextResponse.json({ error: "Unable to load restaurant right now." }, { status: 500 });
  }
}
