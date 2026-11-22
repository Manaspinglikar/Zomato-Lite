# Zomato Lite

A single-restaurant review app for Ludhiana Burrito, built with Next.js 15, TypeScript, Tailwind CSS, and Neon Postgres.

## Features

- Restaurant page with average rating, review count, latest review, and older reviews.
- Review form with a 1–5 star rating and comment.
- POST `/api/reviews` with server-side validation.
- GET `/api/restaurants/[id]` with rating metrics computed in SQL.
- No authentication, no review editing/deletion, no restaurant search, and no stored average-rating column.

## Local setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL` using your private Neon connection string.
4. Run `npm run db:setup`.
5. Run `npm run dev` and open `http://localhost:3000`.

Never commit `.env.local` or expose database credentials in source code.
