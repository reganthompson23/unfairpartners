/*
  # Make Product SKU Optional

  1. Changes
    - Make the SKU column optional on products table
    - Only variants need SKUs, not parent products
  
  2. Notes
    - Parent products serve as containers for variants
    - Each variant will have its own required SKU
*/

-- Make SKU nullable on products table
ALTER TABLE products ALTER COLUMN sku DROP NOT NULL;