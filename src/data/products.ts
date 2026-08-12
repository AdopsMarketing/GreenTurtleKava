// Product catalog for the Green Turtle Kava store.
// Data sourced from the live WooCommerce store (product names, weights/sizes, and prices).
// Prices are in USD. Variant ids are stable and used as the source of truth for pricing at
// checkout (the serverless function re-derives price from here so the client cannot tamper with it).

export interface Variant {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  slug: string;
  name: string;
  category: 'Kava' | 'Apparel';
  image: string;
  optionName: string;
  variants: Variant[];
  /** Apparel colorway (fixed per product on the live store). */
  color?: string;
  description: string;
}

const kavaVariants = (
  slug: string,
  half: number,
  one: number,
  two: number
): Variant[] => [
  { id: `${slug}-half`, label: '.5 LB', price: half },
  { id: `${slug}-1lb`, label: '1 LB', price: one },
  { id: `${slug}-2lb`, label: '2 LB', price: two },
];

const apparelVariants = (slug: string): Variant[] =>
  ['Small', 'Medium', 'Large', 'XL', 'XXL', 'XXXL'].map((size) => ({
    id: `${slug}-${size.toLowerCase()}`,
    label: size,
    price: 25,
  }));

export const products: Product[] = [
  {
    slug: 'green-turtle-kava-leatherback',
    name: 'Green Turtle Kava Leatherback',
    category: 'Kava',
    image: '/images/shop/leatherback.png',
    optionName: 'Weight',
    variants: kavaVariants('leatherback', 31.77, 58.77, 111.77),
    description:
      'Premium Fijian kava, ground fine for a smooth shell. Available by the ½ lb, 1 lb, or 2 lb bag.',
  },
  {
    slug: 'green-turtle-kava-loggerhead',
    name: 'Green Turtle Kava Loggerhead',
    category: 'Kava',
    image: '/images/shop/loggerhead.png',
    optionName: 'Weight',
    variants: kavaVariants('loggerhead', 31.77, 58.77, 111.77),
    description:
      'A well-balanced Fijian kava for everyday relaxation. Available by the ½ lb, 1 lb, or 2 lb bag.',
  },
  {
    slug: 'premium-green-turtle-kava-greenie',
    name: 'Premium Green Turtle Kava Greenie',
    category: 'Kava',
    image: '/images/shop/greenie.png',
    optionName: 'Weight',
    variants: kavaVariants('greenie', 31.77, 58.77, 111.77),
    description:
      'Our premium green-grade kava. Available by the ½ lb, 1 lb, or 2 lb bag.',
  },
  {
    slug: 'premium-green-turtle-kava-hawksbill',
    name: 'Premium Green Turtle Kava Hawksbill',
    category: 'Kava',
    image: '/images/shop/hawksbill.png',
    optionName: 'Weight',
    variants: kavaVariants('hawksbill', 34.79, 59.97, 117.77),
    description:
      'A top-shelf Fijian kava with a heavier, more relaxing profile. Available by the ½ lb, 1 lb, or 2 lb bag.',
  },
  {
    slug: 'green-turtle-kava-hoodie',
    name: 'Green Turtle Kava Hoodie',
    category: 'Apparel',
    image: '/images/shop/apparel.jpg',
    optionName: 'Size',
    color: 'Blue Lagoon',
    variants: apparelVariants('hoodie'),
    description: 'Cozy Green Turtle Kava hoodie in Blue Lagoon. Available in sizes S–XXXL.',
  },
  {
    slug: 'green-turtle-kava-t-shirt',
    name: 'Green Turtle Kava T-Shirt',
    category: 'Apparel',
    image: '/images/shop/apparel.jpg',
    optionName: 'Size',
    color: 'Sand',
    variants: apparelVariants('t-shirt'),
    description: 'Soft Green Turtle Kava tee in Sand. Available in sizes S–XXXL.',
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);

export const variantById = (id: string) => {
  for (const p of products) {
    const v = p.variants.find((v) => v.id === id);
    if (v) return { product: p, variant: v };
  }
  return null;
};

export const priceFrom = (p: Product) => Math.min(...p.variants.map((v) => v.price));

export const formatUsd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/** WooCommerce-style price display: a single price, or a "min – max" range for variable products. */
export const priceRange = (p: Product) => {
  const prices = p.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatUsd(min) : `${formatUsd(min)} – ${formatUsd(max)}`;
};

/** Catalog display order, matching the live store. */
export const shopOrder = [
  'green-turtle-kava-hoodie',
  'green-turtle-kava-leatherback',
  'green-turtle-kava-loggerhead',
  'green-turtle-kava-t-shirt',
  'premium-green-turtle-kava-greenie',
  'premium-green-turtle-kava-hawksbill',
];

export const orderedProducts = shopOrder
  .map((slug) => products.find((p) => p.slug === slug))
  .filter((p): p is Product => Boolean(p));
