# Unfair Partners - Wholesale Portal

A modern B2B wholesale ordering platform for Unfair brand partners. Features gated registration with admin approval, product catalog with variants, shopping cart, and order management.

## Features

- **Gated Registration System**: New partners apply and wait for admin approval
- **Admin Dashboard**: Manage pending approvals, customers, products, and orders
- **Product Catalog**: Browse FX-1 Range with multiple variants (size, color, etc.)
- **Shopping Cart**: Add products and submit wholesale orders
- **Order Management**: Track order history and status
- **Dual Pricing**: Retail and wholesale pricing support
- **Product Variants**: Size, color, and other variations per product

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Icons**: Lucide React

## Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd unfairpartners
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Go to your Supabase project SQL Editor
   - Run the migrations in the `supabase/migrations` folder in order
   - OR run the `SETUP_DATABASE.sql` file

5. Set up Supabase Storage:
   - Create a bucket named `product-images`
   - Set it to public

6. Create an admin user:
   - Sign up through the app
   - Go to Supabase Dashboard → Authentication → Users
   - Find your user and note the UUID
   - Go to Table Editor → profiles
   - Set `is_admin = true` and `status = 'approved'` for your user

### Development

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Deployment

Deployed on Netlify. Remember to set environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Schema

- **profiles**: User company information and approval status
- **products**: Product catalog
- **product_variants**: Size/color variations
- **orders**: Wholesale order submissions
- **order_items**: Line items for each order

## User Roles

### Admin
- Approve/reject partner applications
- Manage products and variants
- View all orders
- Manage customer accounts

### Approved Partners
- Browse product catalog
- Add items to cart
- Submit wholesale orders
- View order history

## License

Private - All Rights Reserved

