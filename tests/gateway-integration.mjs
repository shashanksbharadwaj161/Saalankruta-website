import assert from "node:assert/strict";
const origin = process.env.TEST_GATEWAY || "http://127.0.0.1:8092";
let cookie = "",
  csrf = "";
async function call(action, data = {}, headers = {}) {
  const r = await fetch(`${origin}/api/index.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://127.0.0.1:5174",
      Cookie: cookie,
      "X-CSRF-Token": csrf,
      ...headers,
    },
    body: JSON.stringify({ action, data }),
  });
  const changed = r.headers.getSetCookie();
  if (changed.length) cookie = changed.at(-1).split(";")[0];
  const body = await r.json();
  assert.equal("_cart_token" in body, false);
  assert.equal("_user_token" in body, false);
  return { status: r.status, body };
}
const boot = await fetch(`${origin}/api/index.php?action=bootstrap`);
const set = boot.headers.getSetCookie()[0];
assert.match(set, /HttpOnly/i);
assert.match(set, /SameSite=Lax/i);
assert.match(set, /Max-Age=2592000/i);
cookie = set.split(";")[0];
csrf = (await boot.json()).csrf;
assert.equal(csrf.length, 64);
assert.equal(
  (await call("cart", {}, { "X-CSRF-Token": "incorrect" })).status,
  403,
);
assert.equal(
  (await call("cart", {}, { Origin: "https://untrusted.example" })).status,
  403,
);
assert.equal((await call("unknown")).status, 404);
console.log("PASS CSRF, origin checks and operation allowlist");
const bag = await call("cart");
assert.equal(bag.status, 200);
assert.ok(Array.isArray(bag.body.items));
const continued = await call("cart");
assert.equal(continued.status, 200);
console.log("PASS private server-backed cart session");
const customer = await call("register", {
  email: `gateway-test-${Date.now()}@example.invalid`,
  password: "Local-Only-Test-Password-2026",
  name: "Gateway Test",
});
assert.equal(customer.status, 200, JSON.stringify(customer.body));
assert.equal((await call("me")).body.id, customer.body.id);
const old = cookie;
assert.equal((await call("logout")).status, 200);
assert.notEqual(cookie, old);
assert.equal((await call("me")).body.authenticated, false);
console.log("PASS private authentication session, cookie rotation and logout");
console.log("All isolated PHP gateway session checks passed.");
