# Online Store — Setup

The Astro site now includes a full custom store:

| Page | Route | Notes |
| --- | --- | --- |
| Catalog | `/shop/` | Products grouped by category (Kava, Apparel) |
| Product | `/product/<slug>/` | Variant + quantity selectors, Add to Cart |
| Cart | `/cart/` | Client-side (localStorage); edit qty / remove |
| Checkout | `/checkout/` | Order summary → Stripe hosted payment |
| Confirmation | `/shop/thank-you/` | Shown after successful payment; clears the cart |

Products live in **`src/data/products.ts`** (names, weights/sizes, prices, images). Edit that file to
add/change products or prices — it is the single source of truth, and the checkout function re-derives
prices from it so the client can never tamper with them.

## Connecting payments (Stripe)

Card details are entered only on **Stripe's hosted checkout page** — the site never sees or stores
them. To turn payments on:

1. Create a Stripe account and grab your **secret key** (`sk_test_…` for testing, `sk_live_…` for real
   charges) from the Stripe Dashboard → Developers → API keys.
2. **Local dev:** copy `.env.example` to `.env` and set `STRIPE_SECRET_KEY`.
3. **Production (Vercel):** Project → Settings → Environment Variables → add `STRIPE_SECRET_KEY`, then
   redeploy.

Until a key is set, the checkout button shows a friendly "payment is not configured yet" message
instead of erroring.

## How checkout works

`/checkout/` POSTs the cart to `src/pages/api/checkout.ts` (a Vercel serverless function).
That function looks up each item's price in `products.ts`, creates a Stripe Checkout Session
(shipping address collected on Stripe), and returns the hosted URL the browser redirects to.
On success Stripe returns the customer to `/shop/thank-you/`.

## Deploying

The site now uses the Vercel adapter (`@astrojs/vercel`). All pages are still statically prerendered;
only `/api/checkout` runs as a serverless function. `npm run build` produces the Vercel output.
