# Zomato Lite

A small restaurant review app for **Ludhiana Burrito**, Sector 32. It has two screens, two APIs, and two database tables.

**Live app:** _added after deployment_

## The one rule

Store facts, compute answers.

The database stores reviews. It does **not** store an average rating, a review count, or a latest-review pointer. Those are calculated by the backend every time the page loads:

```sql
AVG(rating)          -- average rating
COUNT(*)             -- number of reviews
ORDER BY created_at DESC LIMIT 1 -- latest review
```

If an average were stored as a column, every new review would need to remember to update it. One missed update and the app would show a number that is not true.

## Stack

- Next.js 15, App Router, TypeScript
- Tailwind CSS
- Neon Postgres
- `@neondatabase/serverless` with raw SQL
- Vercel

No auth, no ORM, no component library, no client-side state library.

## Screens

| Route | What it does |
| --- | --- |
| `/restaurant/1` | Restaurant name, cuisine and area, large average rating, review count, highlighted latest review, earlier reviews, and a link to write one. |
| `/review/1` | Star picker, comment box, and a submit button disabled until both are filled. API errors are shown exactly as the backend returns them. |

The restaurant page only renders the values from `GET /api/restaurants/1`. It does not add, divide, or sort reviews in the browser.

## APIs

### `POST /api/reviews`

Request:

```json
{
  "restaurantId": 1,
  "rating": 4,
  "comment": "Good, but slow service"
}
```

The backend validates in this order:

1. `rating` is a whole number from 1 to 5.
2. `comment` is a non-empty string after trimming whitespace.
3. `restaurantId` exists in the database.

A failure returns HTTP `400`:

```json
{ "error": "Rating must be a whole number from 1 to 5." }
```

Success returns HTTP `201`:

```json
{ "success": true, "reviewId": 104 }
```

### `GET /api/restaurants/[id]`

Returns HTTP `404` when the restaurant does not exist. Otherwise:

```json
{
  "name": "Ludhiana Burrito",
  "cuisine": "Indian",
  "area": "Sector 32",
  "averageRating": 4.3,
  "totalReviews": 3,
  "latestReview": {
    "id": 103,
    "rating": 4,
    "comment": "Solid. Would repeat.",
    "createdAt": "2026-08-20T21:30:00.000Z"
  },
  "reviews": [
    {
      "id": 102,
      "rating": 4,
      "comment": "Good, but slow service",
      "createdAt": "2026-08-14T13:02:00.000Z"
    }
  ]
}
```

`latestReview` is separated from `reviews` so the page does not print it twice.

When there are no reviews, the response is:

```json
{
  "averageRating": null,
  "totalReviews": 0,
  "latestReview": null,
  "reviews": []
}
```

## Database

```text
restaurants
  id, name, cuisine, area

reviews
  id, restaurant_id, rating, comment, created_at
```

The seed creates Ludhiana Burrito and three reviews dated 8, 6, and 2 days ago.

`npm run db:setup` applies `db/schema.sql`, seeds only when the database has no restaurants, and prints the resulting rows.

## Run locally

Requirements: Node 20 or newer, npm, and a Neon Postgres database.

```bash
npm install
```

Create `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

Then:

```bash
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `localhost` only exists on the machine running the dev server; deployment is what gives it a public URL.

## Test the API without a UI

```bash
curl http://localhost:3000/api/restaurants/1
curl http://localhost:3000/api/restaurants/999
```

On Windows PowerShell, send JSON from a file so PowerShell does not strip the quotes:

```bash
curl.exe -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  --data-binary "@review.json"
```

A rating of `500` or a blank comment is rejected with HTTP `400`.

## File map

| File | Layer | What it does |
| --- | --- | --- |
| `app/page.tsx` | Frontend | Minimal entry page with a link to the restaurant. |
| `app/restaurant/[id]/page.tsx` | Frontend | Loads `GET /api/restaurants/[id]` and renders the rating, latest review, and earlier reviews. |
| `app/review/[restaurantId]/page.tsx` | Frontend | Star picker and comment form; posts to `POST /api/reviews`. |
| `app/api/restaurants/[id]/route.ts` | Backend | Loads the restaurant and computes the average, count, latest review, and review list with raw SQL. |
| `app/api/reviews/route.ts` | Backend | Validates and inserts a new review. |
| `lib/db.ts` | Backend | Creates the Neon serverless SQL client. |
| `db/schema.sql` | Database | Defines the two tables. |
| `db/seed.sql` | Database | Adds Ludhiana Burrito and the three seed reviews. |
| `db/setup.mjs` | Database | Applies the schema and seed with `npm run db:setup`. |
| `lib/types.ts` | Frontend/backend | Shared API response types. |
| `.env.local` | Config | Holds the secret database URL. Never committed. |
| `tailwind.config.ts` | Config | Tailwind theme: warm accent, off-white canvas, 560px content width. |
| `next.config.ts` | Config | Next.js configuration. |
| `.env.example` | Config | Documents the environment variable without exposing a secret. |
| `.gitignore` | Config | Keeps `.env.local`, build output, and dependencies out of Git. |

## Deployment

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Add `DATABASE_URL` to the Vercel project's environment variables, using the same value as `.env.local`.
4. Deploy.

If step 3 is skipped, the build can succeed while every API request fails at runtime with a missing `DATABASE_URL`.

## The four things worth remembering

1. Store facts, compute answers. Ratings are facts; averages are answers.
2. The kitchen cooks, the dining room serves. Logic lives in the backend.
3. Validate twice. Frontend validation is kindness; backend validation is security.
4. Shape the API like the screen. If the frontend has to do maths, the API design is wrong.
