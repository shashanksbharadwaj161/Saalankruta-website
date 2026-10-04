import assert from "node:assert/strict";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
const origin = process.env.TEST_BACKEND || "http://127.0.0.1:8091";
const secret =
  process.env.TEST_BRIDGE_SECRET ||
  "local-only-integration-secret-not-for-production-2026";
let token = "",
  cart = "";
const checkoutSession = randomBytes(32).toString("hex");
const client = `isolated-integration-${randomUUID()}`;
async function request(action, data = {}, overrides = {}) {
  const payload = JSON.stringify({
    action,
    data,
    user_token: token,
    cart_token: cart,
    checkout_session: checkoutSession,
    client,
    ...overrides,
  });
  const stamp = String(Math.floor(Date.now() / 1000)),
    nonce = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", secret)
    .update(`${stamp}.${nonce}.${payload}`)
    .digest("hex");
  const response = await fetch(`${origin}/wp-json/saalankruta/v1/bridge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Saal-Timestamp": stamp,
      "X-Saal-Nonce": nonce,
      "X-Saal-Signature": signature,
    },
    body: payload,
  });
  const raw = await response.text();
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    throw Error(
      `Invalid JSON for ${action}: ${response.status} ${raw.slice(0, 200)}`,
    );
  }
  if (body?._user_token) token = body._user_token;
  if (body?._cart_token) cart = body._cart_token;
  return { status: response.status, body };
}
const assertOk = (r) => {
  assert.ok(r.status >= 200 && r.status < 300, JSON.stringify(r.body));
  return r.body;
};
const unsigned = await fetch(`${origin}/wp-json/saalankruta/v1/bridge`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
});
assert.equal(unsigned.status, 403);
console.log("PASS unsigned requests rejected");
assert.equal(assertOk(await request("me")).authenticated, false);
console.log("PASS guest session");
const email = `store-test-${Date.now()}@example.invalid`,
  password = "Integration-Only-Password-2026";
const customer = assertOk(
  await request("register", { email, password, name: "Store Test" }),
);
assert.equal(customer.email, email);
assert.equal(assertOk(await request("me")).id, customer.id);
console.log("PASS registration and authenticated session");
assert.equal(
  (await request("login", { email, password: "incorrect" })).status,
  401,
);
console.log("PASS invalid credentials rejected");
const catalogue = assertOk(await request("catalogue"));
assert.equal(catalogue.length, 143);
const product = catalogue[0];
const wish = assertOk(
  await request("wishlist", { ids: [product.id, product.id, 999999] }),
);
assert.deepEqual(wish.wishlist, [product.id]);
console.log("PASS wishlist deduplication and account persistence");
const address = {
  first_name: "Store",
  last_name: "Test",
  company: "",
  address_1: "Local test address",
  address_2: "",
  city: "Bengaluru",
  state: "KA",
  postcode: "560061",
  country: "IN",
  email,
  phone: "9000000000",
};
assert.equal(
  (await request("address", { billing: { ...address, country: "US" } })).status,
  400,
);
assert.equal(
  (await request("address", { billing: { ...address, postcode: "000000" } }))
    .status,
  400,
);
assert.equal(
  assertOk(await request("address", { billing: address })).billing.postcode,
  "560061",
);
console.log("PASS India-only address validation");
const initial = assertOk(await request("cart"));
assert.ok(cart, "Cart token must stay available");
assert.equal(initial.items.length, 0);
let bag = assertOk(await request("add-item", { id: product.id, quantity: 2 }));
assert.equal(bag.items[0].quantity, 2);
assert.equal(
  (await request("add-item", { id: 999999, quantity: 1 })).status >= 400,
  true,
);
bag = assertOk(
  await request("update-item", { key: bag.items[0].key, quantity: 1 }),
);
assert.equal(bag.items[0].quantity, 1);
bag = assertOk(
  await request("update-customer", {
    billing_address: address,
    shipping_address: address,
  }),
);
assert.ok(bag.shipping_rates.some((p) => p.shipping_rates.length));
console.log("PASS cart persistence, quantity, invalid items and shipping");
const pack = bag.shipping_rates[0],
  rate = pack.shipping_rates[0];
bag = assertOk(
  await request("select-shipping-rate", {
    package_id: pack.package_id,
    rate_id: rate.rate_id,
  }),
);
assert.equal(
  (await request("apply-coupon", { code: "INVALID-COUPON" })).status >= 400,
  true,
);
console.log("PASS invalid coupons rejected");
const config = assertOk(await request("payment-config"));
assert.equal(config.enabled, true);
assert.ok(config.methods.some((m) => m.id === "saal_test"));
const idempotency_key = randomUUID();
const checkout = {
  billing_address: address,
  shipping_address: address,
  payment_method: "saal_test",
  expected_total: bag.totals.total_price,
  idempotency_key,
};
const order = assertOk(await request("checkout", checkout));
assert.ok(order.order_id);
assert.equal(order.payment_result.payment_status, "success");
const repeat = assertOk(await request("checkout", checkout));
assert.equal(repeat.order_id, order.order_id);
console.log("PASS test checkout and duplicate-submit protection");
const orders = assertOk(await request("orders"));
assert.ok(orders.some((o) => o.id === order.order_id));
assert.equal(
  assertOk(await request("track", { id: order.order_id, key: order.order_key }))
    .id,
  order.order_id,
);
assertOk(await request("logout"));
token = "";
cart = "";
assert.equal((await request("orders")).status, 401);
assert.equal(
  (await request("track", { id: order.order_id, key: "wrong" })).status,
  404,
);
console.log("PASS customer order ownership and guest order verification");
const login = assertOk(await request("login", { email, password }));
assert.deepEqual(login.wishlist, [product.id]);
console.log("PASS account login restores wishlist");
console.log(
  "All isolated WooCommerce integration checks passed. No production data was changed.",
);
