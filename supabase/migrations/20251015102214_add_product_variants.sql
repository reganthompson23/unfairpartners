/*
  # Add Product Variants System

  1. New Tables
    - `product_variants`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `name` (text) - e.g., "5\" x 19.5\" - Graphite"
      - `sku` (text, unique) - unique SKU for this variant
      - `wholesale_price` (numeric) - variant-specific price
      - `rrp_price` (numeric) - variant-specific RRP
      - `is_available` (boolean) - whether this variant is available
      - `sort_order` (integer) - for custom ordering of variants
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Products table becomes a parent container for variants
    - Move pricing from products to variants
    - Keep product-level fields: name, description, images
    - Remove SKU visibility from customer UI (keep in database for admin)

  3. Security
    - Enable RLS on `product_variants` table
    - Add policies for authenticated users to read available variants
    - Add policies for admin users to manage variants
*/

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  wholesale_price numeric NOT NULL CHECK (wholesale_price >= 0),
  rrp_price numeric NOT NULL CHECK (rrp_price >= 0),
  is_available boolean DEFAULT true NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view available variants
CREATE POLICY "Anyone can view available variants"
  ON product_variants
  FOR SELECT
  USING (is_available = true);

-- Policy: Authenticated users can view all variants
CREATE POLICY "Authenticated users can view all variants"
  ON product_variants
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admin users can insert variants
CREATE POLICY "Admin users can insert variants"
  ON product_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admin users can update variants
CREATE POLICY "Admin users can update variants"
  ON product_variants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admin users can delete variants
CREATE POLICY "Admin users can delete variants"
  ON product_variants
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );