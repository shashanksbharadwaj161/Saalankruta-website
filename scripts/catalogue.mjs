import { writeFile, mkdir } from "node:fs/promises";
const origin = (
  process.env.CATALOGUE_ORIGIN || "https://saalankruta.com"
).replace(/\/$/, "");
async function pages(resource) {
  const all = [];
  for (let page = 1; page <= 100; page++) {
    const r = await fetch(
      `${origin}/wp-json/wc/store/v1/${resource}?per_page=100&page=${page}`,
    );
    if (!r.ok) throw Error(`${resource} catalogue request failed: ${r.status}`);
    const batch = await r.json();
    if (!Array.isArray(batch)) throw Error("Invalid catalogue response");
    all.push(...batch);
    if (batch.length < 100) return all;
  }
  throw Error("Catalogue exceeds configured page limit");
}
const [products, categories] = await Promise.all([
  pages("products"),
  pages("products/categories"),
]);
if (!products.length)
  throw Error("Refusing to replace catalogue with an empty response");
await mkdir("public", { recursive: true });
await writeFile("public/catalogue.json", JSON.stringify(products));
await writeFile("public/categories.json", JSON.stringify(categories));
console.log(
  `Reconciled ${products.length} products and ${categories.length} categories from ${origin}`,
);
