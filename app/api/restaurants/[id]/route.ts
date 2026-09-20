import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

type RestaurantRow = { id: number; name: string; cuisine: string; area: string };
type AggRow = { avg: unknown; cnt: number };
type ReviewRow = { id: number; rating: number; comment: string; created_at: Date };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = parseInt(id, 10);
  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const restaurants = (await sql.query(
    "SELECT id, name, cuisine, area FROM restaurants WHERE id = $1",
    [restaurantId]
  )) as RestaurantRow[];
  if (restaurants.length === 0) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }
  const restaurant = restaurants[0];

  const agg = (await sql.query(
    "SELECT AVG(rating) AS avg, COUNT(*)::int AS cnt FROM reviews WHERE restaurant_id = $1",
    [restaurantId]
  )) as AggRow[];
  const averageRating =
    agg[0].avg === null ? null : Math.round(Number(agg[0].avg) * 10) / 10;
  const totalReviews = agg[0].cnt;

  const reviews = (await sql.query(
    "SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC, id DESC",
    [restaurantId]
  )) as ReviewRow[];

  const toReview = (row: ReviewRow) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  });

  const latestReview = reviews.length > 0 ? toReview(reviews[0]) : null;
  const olderReviews = reviews.slice(1).map(toReview);

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews,
    latestReview,
    reviews: olderReviews,
  });
}