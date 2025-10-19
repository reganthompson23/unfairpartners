/*
  # Update Products Schema

  ## Changes Made
  1. Remove `category` column from products table
  2. Add `image_urls` column (text array) for storing multiple product images
  3. Rename `price` to `rrp_price` (Recommended Retail Price)
  4. Keep `wholesale_price` as is

  ## Important Notes
  - Existing products will have NULL for image_urls array
  - Category data will be preserved but column removed
  - Price column renamed to rrp_price for clarity
*/

-- Add image_urls column for multiple images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE products ADD COLUMN image_urls text[];
  END IF;
END $$;

-- Rename price to rrp_price
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'rrp_price'
  ) THEN
    ALTER TABLE products RENAME COLUMN price TO rrp_price;
  END IF;
END $$;

-- Drop category column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE products DROP COLUMN category;
  END IF;
END $$;
