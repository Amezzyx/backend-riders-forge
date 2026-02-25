-- Fix for order_items table migration issue
-- Run this script in your PostgreSQL database to fix the schema

-- Option 1: Drop and recreate the table (loses data, but safe for development)
DROP TABLE IF EXISTS order_items CASCADE;

-- Option 2: If you want to keep data, first make orderId nullable, update existing rows, then make it NOT NULL
-- ALTER TABLE order_items ALTER COLUMN "orderId" DROP NOT NULL;
-- UPDATE order_items SET "orderId" = (SELECT id FROM orders LIMIT 1) WHERE "orderId" IS NULL;
-- ALTER TABLE order_items ALTER COLUMN "orderId" SET NOT NULL;

-- After running this, restart your NestJS application and TypeORM will recreate the table with the correct schema



