import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Send a JSON body with restaurantId, rating and comment." },
      { status: 400 },
    );
  }

  const { restaurantId, rating, comment } = body;

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "Rating must be a whole number from 1 to 5." },
      { status: 400 },
    );
  }

  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 },
    );
  }

  if (
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId) ||
    restaurantId < 1
  ) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 400 },
    );
  }

  try {
    const sql = getSql();

    const restaurants = (await sql`
      SELECT id
      FROM restaurants
      WHERE id = ${restaurantId}
      LIMIT 1
    `) as unknown as Array<{ id: number }>;

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 400 },
      );
    }

    const inserted = (await sql`
      INSERT INTO reviews (restaurant_id, rating, comment)
      VALUES (${restaurantId}, ${rating}, ${comment.trim()})
      RETURNING id
    `) as Array<{ id: number }>;

    return NextResponse.json(
      { success: true, reviewId: inserted[0].id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save review:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving the review." },
      { status: 500 },
    );
  }
}
