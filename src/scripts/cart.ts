// Client-side cart backed by localStorage. Stores only { variantId, qty }; all display data
// (name, price, image) is resolved from the product catalog so pricing stays in one place.
import { products, variantById, type Product, type Variant } from '../data/products';

export interface CartLine {
  variantId: string;
  qty: number;
}
export interface ResolvedLine extends CartLine {
  product: Product;
  variant: Variant;
  lineTotal: number;
}

const KEY = 'gtk_cart';

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((l) => l && typeof l.variantId === 'string' && Number.isFinite(l.qty))
      : [];
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new CustomEvent('cart:updated'));
}

export function getCart(): CartLine[] {
  return read();
}

export function getResolvedCart(): ResolvedLine[] {
  return read()
    .map((line) => {
      const found = variantById(line.variantId);
      if (!found) return null;
      return {
        ...line,
        product: found.product,
        variant: found.variant,
        lineTotal: +(found.variant.price * line.qty).toFixed(2),
      };
    })
    .filter((l): l is ResolvedLine => l !== null);
}

export function cartCount(): number {
  return read().reduce((n, l) => n + l.qty, 0);
}

export function cartSubtotal(): number {
  return +getResolvedCart()
    .reduce((sum, l) => sum + l.lineTotal, 0)
    .toFixed(2);
}

export function addItem(variantId: string, qty = 1) {
  if (!variantById(variantId)) return;
  const lines = read();
  const existing = lines.find((l) => l.variantId === variantId);
  if (existing) existing.qty = Math.min(existing.qty + qty, 99);
  else lines.push({ variantId, qty: Math.min(qty, 99) });
  write(lines);
}

export function setQty(variantId: string, qty: number) {
  let lines = read();
  if (qty <= 0) lines = lines.filter((l) => l.variantId !== variantId);
  else {
    const line = lines.find((l) => l.variantId === variantId);
    if (line) line.qty = Math.min(qty, 99);
  }
  write(lines);
}

export function removeItem(variantId: string) {
  write(read().filter((l) => l.variantId !== variantId));
}

export function clearCart() {
  write([]);
}

// Re-exported so callers don't need a second import.
export { products };
