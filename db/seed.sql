INSERT INTO restaurants (name, cuisine, area)
SELECT 'Ludhiana Burrito', 'Indian', 'Sector 32'
WHERE NOT EXISTS (SELECT 1 FROM restaurants);

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT r.id, seed.rating, seed.comment, NOW() - seed.days_ago * INTERVAL '1 day'
FROM restaurants r
CROSS JOIN (VALUES
  (5, 'Paneer burrito is unreal', 8),
  (4, 'Good, but slow service', 6),
  (4, 'Solid. Would repeat.', 2)
) AS seed(rating, comment, days_ago)
WHERE r.id = (SELECT MIN(id) FROM restaurants)
  AND NOT EXISTS (SELECT 1 FROM reviews WHERE restaurant_id = r.id);
