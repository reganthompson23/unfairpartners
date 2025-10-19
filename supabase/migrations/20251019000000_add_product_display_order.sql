-- Add display_order column to products table for custom ordering
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order integer;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);

-- Set initial display_order values based on current alphabetical order
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 AS order_num
  FROM products
)
UPDATE products
SET display_order = numbered.order_num
FROM numbered
WHERE products.id = numbered.id;

