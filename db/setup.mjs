import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL is missing. Add it to .env.local before running npm run db:setup.",
  );
  process.exit(1);
}

const sql = neon(connectionString);

function getStatements(fileContents) {
  return fileContents
    .replace(/^\s*--.*$/gm, "")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function runSqlFile(fileName) {
  const fileContents = await readFile(path.join(root, "db", fileName), "utf8");
  const statements = getStatements(fileContents);

  for (const statement of statements) {
    await sql.query(statement);
  }
}

await runSqlFile("schema.sql");

const countRows = await sql`
  SELECT COUNT(*)::int AS restaurant_count
  FROM restaurants
`;

if (countRows[0].restaurant_count === 0) {
  await runSqlFile("seed.sql");
  console.log("Database seeded.");
} else {
  console.log("Database already has restaurants; seed skipped.");
}

const restaurants = await sql`
  SELECT id, name, cuisine, area
  FROM restaurants
  ORDER BY id
`;

const reviews = await sql`
  SELECT id, restaurant_id, rating, comment, created_at
  FROM reviews
  ORDER BY created_at ASC, id ASC
`;

console.log("\nrestaurants");
console.table(restaurants);

console.log("reviews");
console.table(reviews);
