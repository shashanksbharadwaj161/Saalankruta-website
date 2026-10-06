import { render } from "../.prerender/render.js";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
const read = async (path) =>
  JSON.parse((await readFile(path, "utf8")).replace(/^\uFEFF/, ""));
const products = await read("public/catalogue.json"),
  categories = await read("public/categories.json");
const template = await readFile("dist/index.html", "utf8");
const origin = "https://saalankruta.com";
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const plain = (s) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const currency = (p) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(p.prices.price) / 10 ** p.prices.currency_minor_unit,
  );
const card = (p) =>
  `<article class="product-card"><a href="/product/${escape(p.slug)}/"><img src="${escape(p.images[0]?.thumbnail || p.images[0]?.src || "/product-placeholder.svg")}" alt="${escape(plain(p.name))}" loading="lazy"/><h2>${escape(plain(p.name))}</h2></a><p>${currency(p)}</p></article>`;
const routes = [
  {
    path: "/",
    title: "Saalankruta — Every woman's dream",
    description:
      "Traditional jewellery, bridal sets and thoughtful gifts from our Bengaluru boutique.",
    body: `<section class="wrap page"><h1>Rooted in tradition. Worn your way.</h1><p>Discover Saalankruta jewellery and gifts.</p><div class="product-grid">${products.slice(0, 8).map(card).join("")}</div></section>`,
  },
];
for (const p of products) {
  const description =
    plain(p.description || p.short_description) ||
    `Discover ${plain(p.name)} at Saalankruta.`;
  routes.push({
    path: `/product/${p.slug}/`,
    title: `${plain(p.name)} — Saalankruta`,
    description,
    image: p.images[0]?.src,
    body: `<section class="wrap page"><h1>${escape(plain(p.name))}</h1><div class="product-detail"><img src="${escape(p.images[0]?.src || "/product-placeholder.svg")}" alt="${escape(plain(p.name))}"/><div><p>${currency(p)}</p><p>${escape(description)}</p><p>${p.is_in_stock ? "Available" : "Currently sold out"}</p><a href="/shop/">Explore the collection</a></div></div></section>`,
    schema: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: plain(p.name),
      description,
      image: p.images.map((i) => i.src),
      sku: String(p.id),
      offers: p.is_purchasable ? {
        "@type": "Offer",
        price: Number(p.prices.price) / 10 ** p.prices.currency_minor_unit,
        priceCurrency: "INR",
        availability: `https://schema.org/${p.is_in_stock ? "InStock" : "OutOfStock"}`,
        url: origin + `/product/${p.slug}/`,
      } : undefined,
    },
  });
}
for (const c of categories) {
  const ids = new Set([c.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const child of categories)
      if (ids.has(child.parent) && !ids.has(child.id)) {
        ids.add(child.id);
        changed = true;
      }
  }
  const list = products.filter((p) =>
    p.categories.some((cat) => ids.has(cat.id)),
  );
  routes.push({
    path: `/product-category/${c.slug}/`,
    title: `${plain(c.name)} — Saalankruta`,
    description: `Explore ${plain(c.name)} at Saalankruta.`,
    body: `<section class="wrap page"><h1>${escape(plain(c.name))}</h1><div class="product-grid">${list.map(card).join("")}</div></section>`,
  });
}
routes.push({
  path: "/shop/",
  title: "All jewellery & gifts — Saalankruta",
  description: "Explore the complete Saalankruta collection.",
  body: `<section class="wrap page"><h1>All jewellery & gifts</h1><div class="product-grid">${products.map(card).join("")}</div></section>`,
});
for (const path of [
  "cart",
  "checkout",
  "wishlist",
  "account",
  "my-account",
  "reset-password",
  "track-order",
  "order-confirmation",
  "contact",
  "about",
  "privacy-policy",
  "terms-and-conditions",
  "cancellation-and-refund",
  "shipping-and-delivery",
])
  routes.push({
    path: `/${path}/`,
    title: `${path.replaceAll("-", " ")} — Saalankruta`,
    description: "Saalankruta boutique and customer care.",
    body: `<section class="wrap page"><h1>${escape(path.replaceAll("-", " "))}</h1><p>For assistance, email saalankruta@gmail.com.</p></section>`,
    private: [
      "cart",
      "checkout",
      "account",
      "my-account",
      "reset-password",
      "wishlist",
      "order-confirmation",
      "track-order",
    ].includes(path),
  });
for (const route of routes) {
  const dir = `dist${route.path}`;
  await mkdir(dir, { recursive: true });
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${escape(route.title)}</title>`)
    .replace(
      /<meta name="description"[^>]*\/>/,
      `<meta name="description" content="${escape(route.description.slice(0, 160))}"/>`,
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root">${render(route.path, products, categories)}</div>`,
    );
  const meta = `<link rel="canonical" href="${origin + route.path}"/><meta property="og:title" content="${escape(route.title)}"/><meta property="og:description" content="${escape(route.description.slice(0, 160))}"/><meta property="og:url" content="${origin + route.path}"/><meta property="og:type" content="${route.schema ? "product" : "website"}"/>${route.image ? `<meta property="og:image" content="${escape(route.image)}"/>` : ""}${route.private ? '<meta name="robots" content="noindex,nofollow"/>' : ""}${route.schema ? `<script type="application/ld+json">${JSON.stringify(route.schema).replace(/</g, "\\u003c")}</script>` : ""}`;
  html = html.replace("</head>", meta + "</head>");
  await writeFile(dir + "index.html", html);
}
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes
    .filter((r) => !r.private)
    .map((r) => `<url><loc>${origin + r.path}</loc></url>`)
    .join("")}</urlset>`,
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nDisallow: ${process.env.STOREFRONT_ASSET_BASE || '/'}api/\nSitemap: ${origin}/sitemap.xml\n`,
);
await mkdir("dist/api", { recursive: true });
await writeFile("dist/storefront-routes.json", JSON.stringify(Object.fromEntries(routes.map(route=>[route.path, !!route.private]))));
await copyFile("server/index.php", "dist/api/index.php");
await copyFile("server/private-path.php", "dist/api/private-path.php");
await copyFile("server/.htaccess", "dist/.htaccess");
await writeFile(
  "dist/legacy.php",
  `<?php\n$map=json_decode(file_get_contents(__DIR__.'/catalogue.json'),true);$id=(int)($_GET['p']??0);foreach($map as $product){if($product['id']===$id){header('Location: /product/'.rawurlencode($product['slug']).'/',true,301);exit;}}http_response_code(404);readfile(__DIR__.'/index.html');`,
);
console.log(
  `Pre-rendered ${routes.length} routes, structured data, sitemap and PHP bridge.`,
);
