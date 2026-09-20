import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  let body: { restaurantId?: unknown; rating?: unknown; comment?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Please send JSON with restaurantId, rating, and comment." },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = body;

  if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number from 1 to 5." },
      { status: 400 }
    );
  }

  if (typeof comment !== "string" || comment.trim() === "") {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 }
    );
  }

  const restaurants = (await sql.query(
    "SELECT id FROM restaurants WHERE id = $1",
    [restaurantId as number]
  )) as { id: number }[];
  if (restaurants.length === 0) {
    return NextResponse.json(
      { error: "That restaurant does not exist." },
      { status: 400 }
    );
  }

  const inserted = (await sql.query(
    "INSERT INTO reviews (restaurant_id, rating, comment) VALUES ($1, $2, $3) RETURNING id",
    [restaurantId as number, rating as number, (comment as string).trim()]
  )) as { id: number }[];

  return NextResponse.json({ success: true, reviewId: inserted[0].id }, { status: 201 });
}