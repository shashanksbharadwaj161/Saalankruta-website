import type { Address, Cart } from "./types";

export function canAdjustCartQuantity(
  item: Pick<Cart["items"][number], "quantity" | "quantity_limits">,
  direction: -1 | 1,
) {
  const limits = item.quantity_limits;
  const next = item.quantity + direction * (limits.multiple_of || 1);
  return (
    limits.editable !== false &&
    next >= limits.minimum &&
    next <= limits.maximum
  );
}

/** Keep complete-list updates in order, including after a rejected request. */
export function serialQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return <T>(work: () => Promise<T>): Promise<T> => {
    const result = tail.then(work, work);
    tail = result.catch(() => undefined);
    return result;
  };
}

export function priceRangeError(min: string, max: string) {
  if (
    [min, max].some(
      (value) =>
        value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0),
    )
  )
    return "Enter a valid price of ₹0 or more.";
  return min !== "" && max !== "" && Number(min) > Number(max)
    ? "Maximum price must be equal to or greater than minimum price."
    : "";
}

export function fillUntouchedAddress(
  current: Address,
  saved: Partial<Address>,
  touched: Set<keyof Address>,
): Address {
  const next = { ...current };
  for (const key of Object.keys(saved) as (keyof Address)[]) {
    if (!touched.has(key) && typeof saved[key] === "string")
      next[key] = saved[key]!;
  }
  next.country = "IN";
  return next;
}
