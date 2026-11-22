import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import type { Review } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string | Date;
};

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 404 },
    );
  }

  try {
    const sql = getSql();

    const restaurants = (await sql`
      SELECT name, cuisine, area
      FROM restaurants
      WHERE id = ${restaurantId}
      LIMIT 1
    `) as unknown as Array<{ name: string; cuisine: string; area: string }>;

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 },
      );
    }

    const [statsRows, reviewRows] = await Promise.all([
      sql`
        SELECT
          ROUND(AVG(rating)::numeric, 1)::float AS average_rating,
          COUNT(*)::int AS total_reviews
        FROM reviews
        WHERE restaurant_id = ${restaurantId}
      `,
      sql`
        SELECT id, rating, comment, created_at
        FROM reviews
        WHERE restaurant_id = ${restaurantId}
        ORDER BY created_at DESC, id DESC
      `,
    ]);

    const stats = (statsRows as unknown as Array<{
      average_rating: number | null;
      total_reviews: number;
    }>)[0];
    const reviews = (reviewRows as unknown as ReviewRow[]).map(toReview);
    const restaurant = restaurants[0];

    return NextResponse.json(
      {
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        area: restaurant.area,
        averageRating: stats.average_rating,
        totalReviews: stats.total_reviews,
        latestReview: reviews[0] ?? null,
        reviews: reviews.slice(1),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load restaurant:", error);
    return NextResponse.json(
      { error: "Could not load the restaurant right now." },
      { status: 500 },
    );
  }
}
