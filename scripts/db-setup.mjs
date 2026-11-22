import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL is missing. Create .env.local using .env.example as a guide."); process.exit(1); }
const sql = neon(connectionString);
const schema = await readFile(resolve("db/schema.sql"), "utf8");
const seed = await readFile(resolve("db/seed.sql"), "utf8");
for (const statement of schema.split(";").map((part) => part.trim()).filter(Boolean)) await sql.query(statement);
for (const statement of seed.split(";").map((part) => part.trim()).filter(Boolean)) await sql.query(statement);
const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants ORDER BY id`;
const reviews = await sql`SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at DESC`;
console.log("Restaurants:", restaurants);
console.log("Reviews:", reviews);
