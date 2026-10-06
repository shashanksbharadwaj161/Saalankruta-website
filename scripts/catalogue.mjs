import { writeFile, mkdir } from "node:fs/promises";
const origin = (
  process.env.CATALOGUE_ORIGIN || "https://saalankruta.com"
).replace(/\/$/, "");
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
// Some hosting IPv4 connections take longer than Node's short family fallback.
setDefaultAutoSelectFamilyAttemptTimeout(2_000);
async function catalogueResponse(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (response.ok) return response;
      if (![408, 429, 500, 502, 503, 504].includes(response.status))
        throw Object.assign(new Error(`Catalogue request failed: ${response.status}`), { permanent: true });
      await response.body?.cancel();
      throw new Error(`Catalogue request failed: ${response.status}`);
    } catch (error) {
      if (error.permanent || attempt === 3) throw error;
      console.warn(`Catalogue request interrupted; retrying (${attempt + 1}/3).`);
      await delay(1_000 * 2 ** attempt);
    }
  }
}
async function pages(resource) {
  const all = [];
  for (let page = 1; page <= 100; page++) {
    const r = await catalogueResponse(
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
