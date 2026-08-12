import type { APIRoute } from 'astro';
import { variantById } from '../../data/products';

// Server-rendered on Vercel (a serverless function). Never prerender this.
export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const secret =
    import.meta.env.STRIPE_SECRET_KEY ?? (globalThis as any).process?.env?.STRIPE_SECRET_KEY;

  if (!secret) {
    return json(
      { error: 'Online payment is not configured yet. Please try again later or call us to order.' },
      503
    );
  }

  let items: Array<{ variantId: string; qty: number }> = [];
  try {
    const body = await request.json();
    items = Array.isArray(body?.items) ? body.items : [];
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Re-derive every line item from the trusted catalog so prices can't be tampered with client-side.
  const lineItems = [];
  for (const item of items) {
    const found = variantById(item?.variantId);
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item?.qty) || 0)));
    if (!found || qty < 1) continue;
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `${found.product.name} — ${found.variant.label}` },
        unit_amount: Math.round(found.variant.price * 100),
      },
      quantity: qty,
    });
  }

  if (lineItems.length === 0) return json({ error: 'Your cart is empty.' }, 400);

  const origin = new URL(request.url).origin;

  try {
    // Imported lazily so the rest of the site builds even before `stripe` is installed.
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['US'] },
      success_url: `${origin}/shop/thank-you/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return json({ error: 'Could not start checkout. Please try again.' }, 502);
  }
};
