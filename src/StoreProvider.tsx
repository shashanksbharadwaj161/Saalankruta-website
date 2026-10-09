import { asset } from "./assets";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product, Category, Cart, Customer } from "./types";
import { api, ApiError } from "./api";
import { serialQueue } from "./commerce-state";
type Store = {
  products: Product[];
  categories: Category[];
  loading: boolean;
  catalogueError: string;
  cart: Cart | null;
  customer: Customer | null;
  customerLoading: boolean;
  wishlist: number[];
  notice: string;
  setNotice: (v: string) => void;
  busy: boolean;
  refreshCart: () => Promise<void>;
  cartAction: (
    action: string,
    data?: Record<string, unknown>,
  ) => Promise<boolean>;
  toggleWish: (id: number) => Promise<void>;
  authenticate: (
    action: string,
    data: Record<string, unknown>,
  ) => Promise<void>;
  saveAddress: (billing: Customer["billing"]) => Promise<void>;
  logout: () => Promise<void>;
};
const Context = createContext<Store | null>(null);
const stored = (): number[] => {
  try {
    const value = JSON.parse(
      localStorage.getItem("saalankruta-wishlist") || "[]",
    );
    return Array.isArray(value)
      ? [...new Set(value.filter((v) => Number.isInteger(v) && v > 0))]
      : [];
  } catch {
    return [];
  }
};
export function StoreProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: { products: Product[]; categories: Category[] };
}) {
  const [products, setProducts] = useState<Product[]>(initial?.products || []);
  const [categories, setCategories] = useState<Category[]>(
    initial?.categories || [],
  );
  const [loading, setLoading] = useState(!initial),
    [catalogueError, setCatalogueError] = useState("");
  const [cart, setCart] = useState<Cart | null>(null),
    [customer, setCustomer] = useState<Customer | null>(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>(stored),
    [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const customerRef = useRef<Customer | null>(null),
    wishlistRef = useRef(wishlist);
  const confirmedWishlist = useRef<number[]>([]),
    wishVersion = useRef(0);
  const wishQueue = useRef(serialQueue()),
    cartVersion = useRef(0),
    mutationPending = useRef(false);
  const authVersion = useRef(0);
  function updateCustomer(value: Customer | null) {
    customerRef.current = value;
    setCustomer(value);
  }
  function updateWishlist(value: number[]) {
    wishlistRef.current = value;
    setWishlist(value);
  }
  async function syncWishlist(ids: number[], owner: number) {
    const version = ++wishVersion.current;
    updateWishlist(ids);
    return wishQueue.current(async () => {
      if (customerRef.current?.id !== owner) return false;
      try {
        const result = await api<{ wishlist: number[] }>("wishlist", { ids });
        if (customerRef.current?.id !== owner) return false;
        confirmedWishlist.current = result.wishlist;
        if (version === wishVersion.current) updateWishlist(result.wishlist);
        return true;
      } catch (e) {
        if (customerRef.current?.id !== owner) return false;
        if (version === wishVersion.current)
          updateWishlist(confirmedWishlist.current);
        setNotice(
          e instanceof Error
            ? e.message
            : "Your saved pieces could not be updated. Please try again.",
        );
        return false;
      }
    });
  }
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const snapshotTimer = setTimeout(() => controller.abort(), 15000);
    (async () => {
      let snapshot = initial?.products || [];
      if (!initial) {
        try {
          const [p, c] = await Promise.all(
            ["catalogue", "categories"].map(async (name) => {
              const response = await fetch(asset(`/${name}.json`), {
                signal: controller.signal,
              });
              if (!response.ok) throw Error("Snapshot unavailable");
              const value = await response.json();
              if (!Array.isArray(value)) throw Error("Invalid snapshot");
              return value;
            }),
          );
          snapshot = p;
          if (alive) {
            setProducts(p);
            setCategories(c);
            setLoading(false);
          }
        } catch {
          /* The live catalogue below can recover a failed snapshot. */
        }
      }
      clearTimeout(snapshotTimer);
      try {
        const [live, liveCategories] = await Promise.all([
          api<Product[]>("catalogue"),
          api<Category[]>("categories"),
        ]);
        if (!Array.isArray(live) || !Array.isArray(liveCategories))
          throw Error("Invalid catalogue");
        if (alive) {
          const media = new Map(snapshot.map((p) => [p.id, p.images]));
          setProducts(
            live.map((p) => ({
              ...p,
              images: p.images.length ? p.images : media.get(p.id) || [],
            })),
          );
          setCategories(liveCategories);
          setCatalogueError("");
        }
      } catch {
        if (alive)
          setCatalogueError(
            snapshot.length
              ? "Live refresh is unavailable. Prices and stock are checked when adding to your bag."
              : "The catalogue could not be loaded. Please refresh or contact the boutique.",
          );
      }
      if (alive) setLoading(false);
    })();
    const restoringVersion = authVersion.current;
    api<Customer | { authenticated: false }>("me")
      .then(async (c) => {
        if (!alive || restoringVersion !== authVersion.current) return;
        if ("id" in c) {
          updateCustomer(c);
          confirmedWishlist.current = c.wishlist;
          const merged = Array.from(
            new Set([...c.wishlist, ...wishlistRef.current]),
          );
          const synced =
            merged.length !== c.wishlist.length
              ? await syncWishlist(merged, c.id)
              : true;
          if (merged.length === c.wishlist.length) updateWishlist(c.wishlist);
          if (synced)
            try {
              localStorage.removeItem("saalankruta-wishlist");
            } catch {
              /* Storage can be unavailable. */
            }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setCustomerLoading(false);
      });
    const initialCartVersion = ++cartVersion.current;
    api<Cart>("cart")
      .then((c) => {
        if (alive && initialCartVersion === cartVersion.current) setCart(c);
      })
      .catch(() => {});
    return () => {
      alive = false;
      clearTimeout(snapshotTimer);
      controller.abort();
    };
  }, []);
  useEffect(() => {
    if (customerLoading || customer) return;
    try {
      localStorage.setItem("saalankruta-wishlist", JSON.stringify(wishlist));
    } catch {
      /* Keep the list for this visit. */
    }
  }, [wishlist, customer, customerLoading]);
  const refreshCart = async () => {
    const version = ++cartVersion.current;
    const c = await api<Cart>("cart");
    if (version === cartVersion.current) setCart(c);
  };
  const cartAction = async (
    action: string,
    data: Record<string, unknown> = {},
  ) => {
    if (mutationPending.current) return false;
    mutationPending.current = true;
    setBusy(true);
    const version = ++cartVersion.current;
    try {
      const c = await api<Cart>(action, data);
      if (version === cartVersion.current) setCart(c);
      if (action === "add-item") setNotice("Added to your bag.");
      if (action === "apply-coupon") setNotice("Promo code applied.");
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Please try again.");
      return false;
    } finally {
      mutationPending.current = false;
      setBusy(false);
    }
  };
  const toggleWish = async (id: number) => {
    const next = wishlistRef.current.includes(id)
      ? wishlistRef.current.filter((v) => v !== id)
      : [...wishlistRef.current, id];
    const owner = customerRef.current?.id;
    if (owner) await syncWishlist(next, owner);
    else updateWishlist(next);
  };
  const authenticate = async (
    action: string,
    data: Record<string, unknown>,
  ) => {
    ++authVersion.current;
    const c = await api<Customer>(action, data);
    updateCustomer(c);
    setCustomerLoading(false);
    confirmedWishlist.current = c.wishlist;
    const merged = Array.from(new Set([...wishlistRef.current, ...c.wishlist]));
    const synced = await syncWishlist(merged, c.id);
    if (synced)
      try {
        localStorage.removeItem("saalankruta-wishlist");
      } catch {
        /* Storage can be unavailable. */
      }
    try {
      await refreshCart();
    } catch {
      setNotice("You are signed in. Open your bag to refresh its contents.");
    }
  };
  const saveAddress = async (billing: Customer["billing"]) => {
    const owner = customerRef.current?.id;
    const result = await api<Customer>("address", { billing });
    if (customerRef.current?.id === owner) updateCustomer(result);
  };
  const logout = async () => {
    await wishQueue.current(async () => undefined);
    await api("logout");
    ++authVersion.current;
    ++wishVersion.current;
    ++cartVersion.current;
    updateCustomer(null);
    updateWishlist([]);
    confirmedWishlist.current = [];
    setCart(null);
    try {
      await refreshCart();
    } catch {
      setNotice("You are signed out. Open your bag to refresh its contents.");
    }
  };
  return (
    <Context.Provider
      value={{
        products,
        categories,
        loading,
        catalogueError,
        cart,
        customer,
        customerLoading,
        wishlist,
        notice,
        setNotice,
        busy,
        refreshCart,
        cartAction,
        toggleWish,
        authenticate,
        saveAddress,
        logout,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new ApiError("Store context missing");
  return value;
}
