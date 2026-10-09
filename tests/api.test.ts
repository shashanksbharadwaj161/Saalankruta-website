import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, resetSession } from "../src/api";

const token = "a".repeat(64),
  renewedToken = "b".repeat(64);
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
beforeEach(() => resetSession());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Store connection recovery", () => {
  it("shares session bootstrap for concurrent catalogue and cart requests", async () => {
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === "POST" ? json([]) : json({ csrf: token }),
    );
    vi.stubGlobal("fetch", fetcher);
    await Promise.all([api("catalogue"), api("cart")]);
    expect(fetcher.mock.calls.filter(([, init]) => !init?.method)).toHaveLength(
      1,
    );
    expect(
      fetcher.mock.calls.filter(([, init]) => init?.method === "POST"),
    ).toHaveLength(2);
  });
  it("renews an expired session once after the gateway rejects it before executing the mutation", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(json({ csrf: token }))
      .mockResolvedValueOnce(
        json(
          {
            message:
              "Your session has expired. Refresh the page and try again.",
          },
          403,
        ),
      )
      .mockResolvedValueOnce(json({ csrf: renewedToken }))
      .mockResolvedValueOnce(json({ items: [{ id: 1 }] }));
    vi.stubGlobal("fetch", fetcher);
    await expect(api("add-item", { id: 1 })).resolves.toEqual({
      items: [{ id: 1 }],
    });
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher.mock.calls[3][1].headers["X-CSRF-Token"]).toBe(renewedToken);
  });
  it("does not retry access denial, failed checkout, or ambiguous connection errors", async () => {
    for (const failure of [
      json({ message: "Invalid request origin." }, 403),
      json({ message: "Online ordering is not open yet." }, 409),
    ]) {
      resetSession();
      const fetcher = vi
        .fn()
        .mockResolvedValueOnce(json({ csrf: token }))
        .mockResolvedValueOnce(failure);
      vi.stubGlobal("fetch", fetcher);
      await expect(
        api("checkout", { idempotency_key: "keep-this-key" }),
      ).rejects.toBeInstanceOf(Error);
      expect(fetcher).toHaveBeenCalledTimes(2);
    }
    resetSession();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(json({ csrf: token }))
      .mockRejectedValueOnce(new TypeError("network failed"));
    vi.stubGlobal("fetch", fetcher);
    await expect(api("checkout")).rejects.toThrow("Check your connection");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("ends a stalled request with a recoverable message", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) =>
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            ),
          ),
      ),
    );
    const result = expect(api("cart")).rejects.toThrow("took too long");
    await vi.advanceTimersByTimeAsync(45000);
    await result;
  });
});
