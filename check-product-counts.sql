-- Run this in pgAdmin Query Tool to check product counts per category

SELECT 
    category,
    COUNT(*) as product_count
FROM products
GROUP BY category
ORDER BY category;

-- Should show:
-- Accessories: 8
-- Men: 15
-- MX Gear: 14
-- Women: 13






