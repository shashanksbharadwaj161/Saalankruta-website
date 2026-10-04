import { describe, it, expect } from "vitest";
import productsRaw from "../public/catalogue.json";
import categoriesRaw from "../public/categories.json";
import {
  filterProducts,
  homepageOrder,
  inCategory,
  menu,
  price,
  productPrice,
  selectedVariation,
  clampQuantity,
} from "../src/catalogue";
import type { Product, Category } from "../src/types";
const products = productsRaw as unknown as Product[],
  categories = categoriesRaw as Category[];
describe("Real catalogue reconciliation", () => {
  it("retains a nonempty catalogue with unique source identities and INR pricing", () => {
    expect(products.length).toBeGreaterThan(0);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(
      products.every((p) => p.slug && p.prices.currency_code === "INR"),
    ).toBe(true);
  });
  it("preserves the original menu and submenu order", () => {
    expect(menu.map((m) => m.slug)).toEqual([
      "necklace",
      "bangles",
      "earrings",
      "combo-set",
      "finger-rings",
      "matti",
      "nose-pin",
      "hair-accessories",
      "gift-items",
    ]);
    expect(menu[1].children.map((c) => c.slug)).toEqual([
      "daily-use-bangles",
      "antique-bangle",
      "cz-stone",
      "kada",
    ]);
    for (const item of menu.flatMap((m) => [m, ...m.children]))
      expect(categories.some((c) => c.slug === item.slug)).toBe(true);
  });
  it("preserves homepage category order and resolves every section", () => {
    expect(homepageOrder).toEqual([
      "necklace",
      "hara",
      "combo-set",
      "matti",
      "nose-pin",
      "kumkumbharani",
      "finger-rings",
      "bangles",
      "gift-items",
    ]);
    for (const slug of homepageOrder)
      expect(
        filterProducts(products, categories, { slug }).length,
      ).toBeGreaterThan(0);
  });
  it("includes nested categories without inventing relationships", () => {
    const c = categories.find((c) => c.slug === "bridal-set")!;
    expect(c.parent).toBe(categories.find((c) => c.slug === "combo-set")!.id);
    expect(
      products
        .filter((p) => inCategory(p, "combo-set", categories))
        .some((p) => p.categories.some((c) => c.slug === "bridal-set")),
    ).toBe(true);
  });
  it("combines search, max price, stock and price sorting", () => {
    const result = filterProducts(products, categories, {
      query: "bangle",
      max: 1000,
      stock: true,
      sort: "low",
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((p) => p.is_in_stock && Number(p.prices.price) <= 100000),
    ).toBe(true);
    expect(
      result.every(
        (p, i) =>
          i === 0 ||
          Number(result[i - 1].prices.price) <= Number(p.prices.price),
      ),
    ).toBe(true);
  });
  it("handles empty search results and INR minor units", () => {
    expect(
      filterProducts(products, categories, {
        query: "not-a-real-product-999999",
      }),
    ).toHaveLength(0);
    expect(price("95000", 2)).toBe("₹950.00");
  });
});

describe("Product purchasing boundaries", () => {
  it("requires every option before matching an any-value variation", () => {
    const p = {
      ...products[0],
      has_options: true,
      attributes: [
        { id: 0, name: "Size", taxonomy: "", has_variations: true, terms: [] },
      ],
      variations: [{ id: 10, attributes: [{ name: "Size", value: "" }] }],
    } as Product;
    expect(selectedVariation(p, {})).toBeUndefined();
    expect(selectedVariation(p, { Size: "small" })?.id).toBe(10);
  });
  it("keeps quantities within stock limits and required increments", () => {
    const limits = { minimum: 2, maximum: 8, multiple_of: 2 };
    expect(clampQuantity(7, limits)).toBe(6);
    expect(clampQuantity(99, limits)).toBe(8);
    expect(clampQuantity(-1, limits)).toBe(2);
  });
  it("does not advertise an unpriced, unpurchasable product as free", () => {
    expect(
      productPrice({
        ...products[0],
        is_purchasable: false,
        prices: { ...products[0].prices, price: "0" },
      }),
    ).toBe("Price unavailable");
  });
  it("combines both price bounds", () => {
    const result = filterProducts(products, categories, {
      min: 500,
      max: 1000,
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (p) =>
          Number(p.prices.price) >= 50000 && Number(p.prices.price) <= 100000,
      ),
    ).toBe(true);
  });
});
