import { describe, expect, it } from "vitest";
import { canAdjustCartQuantity } from "../src/commerce-state";
import {
  fillUntouchedAddress,
  priceRangeError,
  serialQueue,
} from "../src/commerce-state";
import type { Address } from "../src/types";

describe("WooCommerce cart quantity contracts", () => {
  it("prevents edits when the server marks a line read-only", () => {
    const item = {
      quantity: 2,
      quantity_limits: {
        minimum: 1,
        maximum: 9,
        multiple_of: 1,
        editable: false,
      },
    };
    expect(canAdjustCartQuantity(item, -1)).toBe(false);
    expect(canAdjustCartQuantity(item, 1)).toBe(false);
  });
  it("honors increments, both bounds, and zero available stock", () => {
    const item = {
      quantity: 2,
      quantity_limits: {
        minimum: 2,
        maximum: 4,
        multiple_of: 2,
        editable: true,
      },
    };
    expect(canAdjustCartQuantity(item, -1)).toBe(false);
    expect(canAdjustCartQuantity(item, 1)).toBe(true);
    expect(canAdjustCartQuantity({ ...item, quantity: 4 }, 1)).toBe(false);
    expect(
      canAdjustCartQuantity(
        { ...item, quantity_limits: { ...item.quantity_limits, maximum: 0 } },
        1,
      ),
    ).toBe(false);
  });
});

describe("Delayed customer restoration", () => {
  const blank: Address = {
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
    email: "",
    phone: "",
  };
  it("fills saved fields without replacing text a shopper has already entered", () => {
    const current = { ...blank, first_name: "New name", city: "" };
    const restored = fillUntouchedAddress(
      current,
      {
        first_name: "Saved name",
        city: "Saved city",
        state: "KA",
        country: "US",
      },
      new Set(["first_name", "city"]),
    );
    expect(restored).toMatchObject({
      first_name: "New name",
      city: "",
      state: "KA",
      country: "IN",
    });
    expect(current.state).toBe("");
  });
  it("restores the saved address for an untouched form", () => {
    expect(
      fillUntouchedAddress(
        blank,
        { address_1: "Saved street", postcode: "560001" },
        new Set(),
      ),
    ).toMatchObject({
      address_1: "Saved street",
      postcode: "560001",
      country: "IN",
    });
  });
});

describe("Price filters", () => {
  it("permits open bounds, zero, decimals and equal bounds", () => {
    for (const bounds of [
      ["", ""],
      ["0", ""],
      ["", "500"],
      ["10.5", "10.5"],
    ])
      expect(priceRangeError(...(bounds as [string, string]))).toBe("");
  });
  it("rejects reversed, negative and malformed bounds", () => {
    for (const bounds of [
      ["800", "500"],
      ["-1", "50"],
      ["NaN", ""],
      ["", "Infinity"],
    ])
      expect(priceRangeError(...(bounds as [string, string]))).not.toBe("");
  });
});

describe("Wishlist request ordering", () => {
  it("keeps rapid complete-list writes in order instead of losing an earlier saved item", async () => {
    const enqueue = serialQueue();
    const written: number[][] = [];
    let finishFirst!: () => void;
    const waiting = new Promise<void>((resolve) => {
      finishFirst = resolve;
    });
    const first = enqueue(async () => {
      await waiting;
      written.push([1]);
    });
    const second = enqueue(async () => {
      written.push([1, 2]);
    });
    await Promise.resolve();
    expect(written).toEqual([]);
    finishFirst();
    await Promise.all([first, second]);
    expect(written).toEqual([[1], [1, 2]]);
  });
  it("allows the next update to recover after a failed write", async () => {
    const enqueue = serialQueue();
    const failed = enqueue(async () => {
      throw Error("offline");
    });
    const next = enqueue(async () => [2]);
    await expect(failed).rejects.toThrow("offline");
    await expect(next).resolves.toEqual([2]);
  });
});
