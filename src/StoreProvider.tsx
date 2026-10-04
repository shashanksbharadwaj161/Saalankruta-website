import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product, Category, Cart, Customer } from "./types";
import { api, ApiError } from "./api";
type Store = {
  products: Product[];
  categories: Category[];
  loading: boolean;
  catalogueError: string;
  cart: Cart | null;
  customer: Customer | null;
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
  logout: () => Promise<void>;
};
const Context = createContext<Store | null>(null);
const stored = () => {
  try {
    const value = JSON.parse(
      localStorage.getItem("saalankruta-wishlist") || "[]",
    );
    return Array.isArray(value) ? value.filter((v) => Number.isInteger(v)) : [];
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
  const [products, setProducts] = useState<Product[]>(initial?.products || []),
    [categories, setCategories] = useState<Category[]>(
      initial?.categories || [],
    ),
    [loading, setLoading] = useState(!initial),
    [catalogueError, setCatalogueError] = useState(""),
    [cart, setCart] = useState<Cart | null>(null),
    [customer, setCustomer] = useState<Customer | null>(null),
    [wishlist, setWishlist] = useState<number[]>(stored),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      let snapshot: Product[] = [];
      try {
        const [p, c] = await Promise.all([
          fetch("/catalogue.json").then((r) => r.json()),
          fetch("/categories.json").then((r) => r.json()),
        ]);
        snapshot = p;
        if (alive) {
          setProducts(p);
          setCategories(c);
          setLoading(false);
        }
      } catch {
        if (alive)
          setCatalogueError(
            "The catalogue could not be loaded. Please refresh or contact the boutique.",
          );
      }
      try {
        const [live, liveCategories] = await Promise.all([
          api<Product[]>("catalogue"),
          api<Category[]>("categories"),
        ]);
        if (alive && live.length) {
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
            "Live refresh is unavailable. Prices and stock are checked when adding to your bag.",
          );
      }
      if (alive) setLoading(false);
    })();
    api<Customer | { authenticated: false }>("me")
      .then((c) => {
        if (alive && "id" in c) {
          setCustomer(c);
          setWishlist(c.wishlist);
        }
      })
      .catch(() => {});
    api<Cart>("cart")
      .then((c) => {
        if (alive) setCart(c);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("saalankruta-wishlist", JSON.stringify(wishlist));
    } catch {
      /* Wishlist remains available for this visit when storage is blocked. */
    }
  }, [wishlist]);
  const refreshCart = async () => {
    const c = await api<Cart>("cart");
    setCart(c);
  };
  const cartAction = async (
    action: string,
    data: Record<string, unknown> = {},
  ) => {
    setBusy(true);
    try {
      const c = await api<Cart>(action, data);
      setCart(c);
      if (action === "add-item") setNotice("Added to your bag.");
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const toggleWish = async (id: number) => {
    const next = wishlist.includes(id)
      ? wishlist.filter((v) => v !== id)
      : [...wishlist, id];
    if (customer) {
      try {
        const result = await api<{ wishlist: number[] }>("wishlist", {
          ids: next,
        });
        setWishlist(result.wishlist);
      } catch (e) {
        setNotice((e as Error).message);
      }
    } else setWishlist(next);
  };
  const authenticate = async (
    action: string,
    data: Record<string, unknown>,
  ) => {
    const c = await api<Customer>(action, data);
    setCustomer(c);
    const merged = Array.from(new Set([...wishlist, ...c.wishlist]));
    const result = await api<{ wishlist: number[] }>("wishlist", {
      ids: merged,
    });
    setWishlist(result.wishlist);
    await refreshCart();
  };
  const logout = async () => {
    await api("logout");
    setCustomer(null);
    setWishlist([]);
    setCart(null);
    await refreshCart();
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
        wishlist,
        notice,
        setNotice,
        busy,
        refreshCart,
        cartAction,
        toggleWish,
        authenticate,
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
