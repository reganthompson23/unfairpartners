-- Remove UNIQUE constraint from products.sku since variants have the actual SKUs
-- Parent products don't need unique SKUs

-- Drop the unique constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Optional: Set existing SKUs to NULL if desired, or leave them as-is
-- UPDATE products SET sku = NULL WHERE sku IS NOT NULL;

