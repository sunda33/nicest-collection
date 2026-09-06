# Nicest Collection

A responsive, Supabase-powered fashion storefront for women's shoes, bags, and dresses.

## Features

- Database-backed product catalogue
- Customer email signup, sign-in and sign-out
- Secure checkout with per-customer order history protection
- Category filters, live search, favorites and a shopping bag

## Run locally

```powershell
pnpm install
copy .env.example .env
pnpm dev
```

Add the Supabase project URL and publishable key to `.env`. Run `supabase/schema.sql` in the Supabase SQL editor when connecting a new project. Never put a Supabase secret key in this browser application.
