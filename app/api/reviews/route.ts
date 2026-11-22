import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  const { restaurantId, rating, comment } = body as Record<string, unknown>;
  if (!Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 5) return NextResponse.json({ error: "Rating must be a whole number from 1 to 5." }, { status: 400 });
  if (typeof comment !== "string" || comment.trim().length === 0) return NextResponse.json({ error: "Comment must not be empty." }, { status: 400 });
  if (!Number.isInteger(restaurantId) || Number(restaurantId) <= 0) return NextResponse.json({ error: "Restaurant does not exist." }, { status: 400 });
  try {
    const sql = getSql();
    const restaurants = await sql`SELECT id FROM restaurants WHERE id = ${Number(restaurantId)} LIMIT 1`;
    if (restaurants.length === 0) return NextResponse.json({ error: "Restaurant does not exist." }, { status: 400 });
    const inserted = await sql`INSERT INTO reviews (restaurant_id, rating, comment) VALUES (${Number(restaurantId)}, ${Number(rating)}, ${comment.trim()}) RETURNING id`;
    return NextResponse.json({ success: true, reviewId: inserted[0].id }, { status: 201 });
  } catch (error) {
    console.error("Failed to save review", error);
    return NextResponse.json({ error: "Unable to save review right now." }, { status: 500 });
  }
}
