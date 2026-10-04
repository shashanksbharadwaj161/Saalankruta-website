import type { Product, Category } from "./types";
export const menu = [
  {
    name: "Necklace",
    slug: "necklace",
    children: [
      { name: "Pendent", slug: "pendent" },
      { name: "Hara", slug: "hara" },
    ],
  },
  {
    name: "Bangles",
    slug: "bangles",
    children: [
      { name: "Daily Use Bangles", slug: "daily-use-bangles" },
      { name: "antique bangle", slug: "antique-bangle" },
      { name: "Cz & Stone", slug: "cz-stone" },
      { name: "Kada", slug: "kada" },
    ],
  },
  {
    name: "Earrings",
    slug: "earrings",
    children: [
      { name: "Cz Studs", slug: "cz-studs" },
      { name: "Daily Use Studs", slug: "daily-use-studs" },
    ],
  },
  {
    name: "Combo Set",
    slug: "combo-set",
    children: [
      { name: "pendent + earring", slug: "pendent-earring" },
      { name: "Bridal set", slug: "bridal-set" },
    ],
  },
  { name: "finger rings", slug: "finger-rings", children: [] },
  { name: "matti", slug: "matti", children: [] },
  { name: "nose pin", slug: "nose-pin", children: [] },
  {
    name: "hair accessories",
    slug: "hair-accessories",
    children: [{ name: "netti chutti", slug: "netti-chutti" }],
  },
  {
    name: "Gift items",
    slug: "gift-items",
    children: [
      { name: "kumkumbharani", slug: "kumkumbharani" },
      { name: "Silver plated gift items", slug: "silver-plated-gift-items" },
    ],
  },
];
export const homepageOrder = [
  "necklace",
  "hara",
  "combo-set",
  "matti",
  "nose-pin",
  "kumkumbharani",
  "finger-rings",
  "bangles",
  "gift-items",
];
export const price = (value: string | number, minor = 2) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) / 10 ** minor);
export function text(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function inCategory(p: Product, slug: string, categories: Category[]) {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return false;
  const ids = new Set([cat.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of categories)
      if (ids.has(c.parent) && !ids.has(c.id)) {
        ids.add(c.id);
        changed = true;
      }
  }
  return p.categories.some((c) => ids.has(c.id));
}
export function filterProducts(
  products: Product[],
  categories: Category[],
  options: {
    slug?: string;
    query?: string;
    min?: number;
    max?: number;
    stock?: boolean;
    sort?: string;
  },
) {
  let result = products.filter(
    (p) =>
      (!options.slug || inCategory(p, options.slug, categories)) &&
      (!options.query ||
        text(p.name + " " + p.description)
          .toLowerCase()
          .includes(options.query.toLowerCase())) &&
      (options.min === undefined ||
        Number(p.prices.price) / 10 ** p.prices.currency_minor_unit >=
          options.min) &&
      (options.max === undefined ||
        Number(p.prices.price) / 10 ** p.prices.currency_minor_unit <=
          options.max) &&
      (!options.stock || p.is_in_stock),
  );
  if (options.sort === "low")
    result.sort((a, b) => Number(a.prices.price) - Number(b.prices.price));
  if (options.sort === "high")
    result.sort((a, b) => Number(b.prices.price) - Number(a.prices.price));
  return result;
}

export function productPrice(p: Product) {
  return !p.is_purchasable && (!p.prices.price || Number(p.prices.price) === 0)
    ? "Price unavailable"
    : price(p.prices.price, p.prices.currency_minor_unit);
}

export function selectedVariation(
  p: Product | undefined,
  selection: Record<string, string>,
) {
  if (!p || !p.has_options) return undefined;
  const required = p.attributes.filter((a) => a.has_variations);
  if (!required.length || required.some((a) => !selection[a.name]))
    return undefined;
  return p.variations.find((v) =>
    v.attributes.every((a) => !a.value || selection[a.name] === a.value),
  );
}
export function clampQuantity(value: number, limits?: Product["add_to_cart"]) {
  const min = limits?.minimum || 1,
    step = limits?.multiple_of || 1,
    max = limits?.maximum && limits.maximum > 0 ? limits.maximum : 999;
  return Math.min(
    max,
    Math.max(min, min + Math.floor((value - min) / step) * step),
  );
}
