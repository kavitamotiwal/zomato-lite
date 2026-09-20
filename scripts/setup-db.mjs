import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, "../db/schema.sql"), "utf8");

const sql = neon(process.env.DATABASE_URL);

for (const statement of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
  await sql.query(statement);
}
console.log("Tables ready: restaurants, reviews");

const [{ count }] = await sql.query("SELECT COUNT(*)::int AS count FROM restaurants");
if (count === 0) {
  const [{ id }] = await sql.query(
    `INSERT INTO restaurants (name, cuisine, area)
     VALUES ('Ludhiana Burrito', 'Indian', 'Sector 32')
     RETURNING id`
  );
  const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
  await sql.query(
    `INSERT INTO reviews (restaurant_id, rating, comment, created_at)
     VALUES
       ($1, 5, 'Paneer burrito is unreal', $2),
       ($1, 4, 'Good, but slow service',   $3),
       ($1, 4, 'Solid. Would repeat.',     $4)`,
    [id, daysAgo(8), daysAgo(6), daysAgo(2)]
  );
  console.log("Seeded: Ludhiana Burrito + 3 reviews");
} else {
  console.log("Restaurants already present, skipping seed");
}

const rows = await sql.query(
  `SELECT r.id, r.name, r.cuisine, r.area,
          COUNT(v.id)::int AS reviews,
          COALESCE(AVG(v.rating)::numeric(2,1), 0) AS avg_rating
   FROM restaurants r
   LEFT JOIN reviews v ON v.restaurant_id = r.id
   GROUP BY r.id`
);
console.table(rows);

const reviewRows = await sql.query(
  `SELECT v.id, v.restaurant_id, v.rating, v.comment, v.created_at
   FROM reviews v
   ORDER BY v.created_at DESC`
);
console.table(reviewRows);