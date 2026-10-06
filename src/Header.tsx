import { asset } from "./assets";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { inCategory } from "./catalogue";
import { useStore } from "./store";
import Modal from "./Modal";

type CollectionLink = { name: string; slug: string };
type NavigationGroup = {
  id: string;
  name: string;
  title: string;
  description: string;
  href: string;
  featured: string;
  columns: { title: string; links: CollectionLink[] }[];
};
const path = (slug: string) => `/product-category/${slug}/`;
const groups: NavigationGroup[] = [
  {
    id: "all",
    name: "All Jewellery",
    title: "Find your next piece.",
    description:
      "From a daily favourite to the finishing touch for a celebration.",
    href: "/shop/",
    featured: "necklace",
    columns: [
      {
        title: "Jewellery",
        links: [
          { name: "Necklaces", slug: "necklace" },
          { name: "Haras", slug: "hara" },
          { name: "Bangles", slug: "bangles" },
          { name: "Earrings", slug: "earrings" },
          { name: "Finger rings", slug: "finger-rings" },
          { name: "Combo sets", slug: "combo-set" },
        ],
      },
      {
        title: "The finishing touches",
        links: [
          { name: "Matti", slug: "matti" },
          { name: "Nose pins", slug: "nose-pin" },
          { name: "Hair accessories", slug: "hair-accessories" },
          { name: "Netti chutti", slug: "netti-chutti" },
          { name: "Gift items", slug: "gift-items" },
        ],
      },
    ],
  },
  {
    id: "necklaces",
    name: "Necklaces & Haras",
    title: "A beautiful beginning.",
    description:
      "Explore necklaces, long haras and pendants, all in one place.",
    href: path("necklace"),
    featured: "necklace",
    columns: [
      {
        title: "Explore the collection",
        links: [
          { name: "All necklaces", slug: "necklace" },
          { name: "Haras", slug: "hara" },
          { name: "Hara collection", slug: "hara-hara" },
          { name: "Pendants", slug: "pendent" },
          { name: "Pendant & earring sets", slug: "pendent-earring" },
        ],
      },
    ],
  },
  {
    id: "bangles",
    name: "Bangles",
    title: "Beauty, around you.",
    description: "Choose your bangles by style, from daily pieces to kadas.",
    href: path("bangles"),
    featured: "bangles",
    columns: [
      {
        title: "Explore the collection",
        links: [
          { name: "All bangles", slug: "bangles" },
          { name: "Daily use bangles", slug: "daily-use-bangles" },
          { name: "Antique bangles", slug: "antique-bangle" },
          { name: "CZ & stone", slug: "cz-stone" },
          { name: "Kadas", slug: "kada" },
          { name: "More bangles", slug: "uncategorized" },
        ],
      },
    ],
  },
  {
    id: "earrings",
    name: "Earrings",
    title: "The smallest statement.",
    description: "Discover earrings and studs for the way you dress every day.",
    href: path("earrings"),
    featured: "earrings",
    columns: [
      {
        title: "Explore the collection",
        links: [
          { name: "All earrings", slug: "earrings" },
          { name: "CZ studs", slug: "cz-studs" },
          { name: "Daily use studs", slug: "daily-use-studs" },
          { name: "Matti", slug: "matti" },
        ],
      },
    ],
  },
  {
    id: "bridal",
    name: "Bridal & Sets",
    title: "For your special day.",
    description:
      "Bring your look together with sets and traditional accessories.",
    href: path("combo-set"),
    featured: "bridal-set",
    columns: [
      {
        title: "Sets",
        links: [
          { name: "Combo sets", slug: "combo-set" },
          { name: "Bridal sets", slug: "bridal-set" },
          { name: "Pendant & earring sets", slug: "pendent-earring" },
        ],
      },
      {
        title: "Complete your look",
        links: [
          { name: "Hair accessories", slug: "hair-accessories" },
          { name: "Netti chutti", slug: "netti-chutti" },
          { name: "Matti", slug: "matti" },
          { name: "Nose pins", slug: "nose-pin" },
          { name: "Finger rings", slug: "finger-rings" },
        ],
      },
    ],
  },
  {
    id: "gifts",
    name: "Gifts",
    title: "A thought, beautifully given.",
    description:
      "Discover gift items for the people and occasions you hold close.",
    href: path("gift-items"),
    featured: "gift-items",
    columns: [
      {
        title: "Explore the collection",
        links: [
          { name: "All gift items", slug: "gift-items" },
          { name: "Kumkumbharani", slug: "kumkumbharani" },
          {
            name: "Silver plated gift items",
            slug: "silver-plated-gift-items",
          },
        ],
      },
    ],
  },
];
const knownCategories = new Set(
  groups.flatMap((group) =>
    group.columns.flatMap((column) => column.links.map((link) => link.slug)),
  ),
);
const policies = [
  { name: "Shipping & delivery", slug: "shipping-and-delivery" },
  { name: "Cancellation & refund", slug: "cancellation-and-refund" },
  { name: "Privacy policy", slug: "privacy-policy" },
  { name: "Terms & conditions", slug: "terms-and-conditions" },
];

export default function Header() {
  const { cart, wishlist, customer, products, categories } = useStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [dropdown, setDropdown] = useState("");
  const [mobileGroup, setMobileGroup] = useState("");
  const header = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const location = useLocation();
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const group = groups.find((item) => item.id === dropdown);
  const featured = group
    ? products.find(
        (product) =>
          inCategory(product, group.featured, categories) &&
          product.images.length,
      )
    : undefined;
  const extraCategories = categories.filter(
    (category) => !knownCategories.has(category.slug),
  );

  useEffect(() => {
    setOpen(false);
    setSearch(false);
    setDropdown("");
    setMobileGroup("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    const glass = header.current;
    const surface = glass?.querySelector<HTMLElement>(".boutique-brand-row");
    if (!glass || !surface) return;
    const supported =
      CSS.supports("backdrop-filter", "blur(1px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(1px)");
    if (!supported) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const transparency = matchMedia("(prefers-reduced-transparency: reduce)");
    let frame = 0;
    let x = 50;
    let y = 30;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      glass.style.setProperty("--glass-glint", "0");
    };
    const update = (clientX: number, clientY: number) => {
      if (motion.matches || transparency.matches) return;
      const bounds = glass.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      x = Math.max(
        0,
        Math.min(100, ((clientX - bounds.left) / bounds.width) * 100),
      );
      y = Math.max(
        0,
        Math.min(100, ((clientY - bounds.top) / bounds.height) * 100),
      );
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        glass.style.setProperty("--glass-x", `${x}%`);
        glass.style.setProperty("--glass-y", `${y}%`);
        glass.style.setProperty("--glass-glint", "1");
      });
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== "touch") update(event.clientX, event.clientY);
    };
    const touch = (event: TouchEvent) => {
      const point = event.touches[0];
      if (point) update(point.clientX, point.clientY);
    };
    const passive = { passive: true } as const;
    surface.addEventListener("pointerenter", pointer, passive);
    surface.addEventListener("pointermove", pointer, passive);
    surface.addEventListener("pointerdown", pointer, passive);
    surface.addEventListener("pointerleave", reset, passive);
    surface.addEventListener("pointerup", reset, passive);
    surface.addEventListener("pointercancel", reset, passive);
    surface.addEventListener("touchstart", touch, passive);
    surface.addEventListener("touchmove", touch, passive);
    surface.addEventListener("touchend", reset, passive);
    surface.addEventListener("touchcancel", reset, passive);
    motion.addEventListener("change", reset);
    transparency.addEventListener("change", reset);
    return () => {
      reset();
      surface.removeEventListener("pointerenter", pointer);
      surface.removeEventListener("pointermove", pointer);
      surface.removeEventListener("pointerdown", pointer);
      surface.removeEventListener("pointerleave", reset);
      surface.removeEventListener("pointerup", reset);
      surface.removeEventListener("pointercancel", reset);
      surface.removeEventListener("touchstart", touch);
      surface.removeEventListener("touchmove", touch);
      surface.removeEventListener("touchend", reset);
      surface.removeEventListener("touchcancel", reset);
      motion.removeEventListener("change", reset);
      transparency.removeEventListener("change", reset);
    };
  }, []);

  useEffect(() => {
    if (!dropdown) return;
    const closeOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setDropdown("");
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [dropdown]);

  function navigateKeys(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const index = groups.findIndex((item) => item.id === id);
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? groups.length - 1
            : (index + (event.key === "ArrowDown" ? 1 : -1) + groups.length) %
              groups.length;
      const next = groups[nextIndex];
      setDropdown(next.id);
      triggers.current[next.id]?.focus();
    }
  }

  function openSearch() {
    setOpen(false);
    setDropdown("");
    setSearch(true);
  }

  return (
    <>
      <header
        className="header boutique-header"
        ref={header}
        data-menu-open={Boolean(dropdown)}
        onBlur={(event) => {
          if (
            event.relatedTarget &&
            !event.currentTarget.contains(event.relatedTarget)
          )
            setDropdown("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && dropdown) {
            event.preventDefault();
            triggers.current.collections?.focus();
            setDropdown("");
          }
        }}
      >
        <div className="boutique-brand-row">
          <nav className="boutique-brand-start" aria-label="Main navigation">
            <button
              className="boutique-icon boutique-mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
            <button
              className="boutique-collections-trigger"
              ref={(element) => {
                triggers.current.collections = element;
              }}
              aria-expanded={Boolean(dropdown)}
              aria-controls="boutique-collections-menu"
              onClick={() => setDropdown(dropdown ? "" : "all")}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setDropdown(dropdown || "all");
                  requestAnimationFrame(() =>
                    header.current
                      ?.querySelector<HTMLButtonElement>(
                        '.boutique-mega-rail [aria-selected="true"]',
                      )
                      ?.focus(),
                  );
                }
              }}
            >
              <span>Collections</span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <Link className="boutique-story-link" to="/about/">
              Our story
            </Link>
          </nav>
          <Link className="boutique-logo" to="/" aria-label="Saalankruta home">
            <img
              src={asset("/logo.png")}
              width="192"
              height="64"
              alt="Saalankruta. Every woman's dream"
            />
          </Link>
          <div className="boutique-utilities">
            <button
              className="boutique-icon boutique-header-search"
              aria-label="Search products"
              onClick={openSearch}
              aria-haspopup="dialog"
            >
              <Search aria-hidden="true" />
            </button>
            <Link
              className="boutique-utility boutique-account"
              to="/account/"
              aria-label={customer ? "Your account" : "Sign in"}
            >
              <UserRound aria-hidden="true" />
            </Link>
            <Link
              className="boutique-utility boutique-wishlist"
              to="/wishlist/"
              aria-label={`Wishlist, ${wishlist.length} items`}
            >
              <Heart aria-hidden="true" />
              {wishlist.length > 0 && <sup>{wishlist.length}</sup>}
            </Link>
            <Link
              className="boutique-utility boutique-bag"
              to="/cart/"
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag aria-hidden="true" />
              {count > 0 && <sup>{count}</sup>}
            </Link>
          </div>
        </div>
        {group && (
          <div
            className="boutique-mega"
            id="boutique-collections-menu"
            aria-label={`${group.name} collections`}
          >
            <div
              className="boutique-mega-rail"
              role="tablist"
              aria-label="Collection groups"
              aria-orientation="vertical"
            >
              <span className="boutique-small-label">The collections</span>
              {groups.map((item) => (
                <button
                  key={item.id}
                  id={`collection-tab-${item.id}`}
                  role="tab"
                  aria-selected={dropdown === item.id}
                  aria-controls="boutique-category-panel"
                  tabIndex={dropdown === item.id ? 0 : -1}
                  ref={(element) => {
                    triggers.current[item.id] = element;
                  }}
                  onClick={() => setDropdown(item.id)}
                  onKeyDown={(event) => navigateKeys(event, item.id)}
                >
                  {item.name}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div
              className="boutique-mega-body"
              id="boutique-category-panel"
              role="tabpanel"
              aria-labelledby={`collection-tab-${group.id}`}
              tabIndex={0}
            >
              <div className="boutique-mega-intro">
                <h2>{group.title}</h2>
                <p>{group.description}</p>
                <Link to={group.href}>
                  Explore{" "}
                  {group.id === "all"
                    ? "all jewellery"
                    : group.id === "necklaces"
                      ? "necklaces"
                      : group.id === "bridal"
                        ? "sets"
                        : group.name.toLowerCase()}{" "}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <div className="boutique-mega-columns">
                {group.columns.map((column) => (
                  <div className="boutique-mega-column" key={column.title}>
                    <h3>{column.title}</h3>
                    {column.links.map((link) => (
                      <Link to={path(link.slug)} key={link.slug}>
                        {link.name}
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                ))}
                {group.id === "all" && extraCategories.length > 0 && (
                  <div className="boutique-mega-column">
                    <h3>More collections</h3>
                    {extraCategories.map((category) => (
                      <Link to={path(category.slug)} key={category.id}>
                        {category.name.replace(/&amp;/g, "&")}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {featured && (
              <Link
                className="boutique-mega-piece"
                to={`/product/${featured.slug}/`}
              >
                <div>
                  <img
                    src={featured.images[0].src}
                    alt={featured.images[0].alt || featured.name}
                    loading="lazy"
                  />
                </div>
                <span>
                  {featured.name}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              </Link>
            )}
            <button
              className="boutique-icon boutique-mega-close"
              aria-label="Close collection menu"
              onClick={() => {
                triggers.current.collections?.focus();
                setDropdown("");
              }}
            >
              <X aria-hidden="true" />
            </button>
          </div>
        )}
      </header>
      {open && (
        <Modal
          label="Navigation"
          className="boutique-navigation-overlay"
          close={() => setOpen(false)}
        >
          <div className="boutique-overlay-top">
            <Link to="/" aria-label="Saalankruta home">
              <img
                src={asset("/logo.png")}
                width="170"
                height="56"
                alt="Saalankruta"
              />
            </Link>
            <button
              className="boutique-icon"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <div className="boutique-mobile-menu-content">
            <button className="boutique-mobile-find" onClick={openSearch}>
              <Search size={19} aria-hidden="true" />
              <span>Find a piece</span>
              <ArrowRight size={19} aria-hidden="true" />
            </button>
            <span className="boutique-small-label">Discover Saalankruta</span>
            <nav
              className="boutique-mobile-collections"
              aria-label="Mobile navigation"
            >
              <Link className="boutique-mobile-all" to="/shop/">
                All jewellery <ArrowUpRight size={24} aria-hidden="true" />
              </Link>
              {groups
                .filter((item) => item.id !== "all")
                .map((item) => (
                  <div className="boutique-mobile-group" key={item.id}>
                    <button
                      aria-expanded={mobileGroup === item.id}
                      aria-controls={`mobile-collections-${item.id}`}
                      onClick={() =>
                        setMobileGroup(mobileGroup === item.id ? "" : item.id)
                      }
                    >
                      <span>{item.name}</span>
                      {mobileGroup === item.id ? (
                        <Minus size={19} aria-hidden="true" />
                      ) : (
                        <Plus size={19} aria-hidden="true" />
                      )}
                    </button>
                    {mobileGroup === item.id && (
                      <div
                        className="boutique-mobile-children"
                        id={`mobile-collections-${item.id}`}
                      >
                        {item.columns.map((column) => (
                          <div key={column.title}>
                            {item.columns.length > 1 && <h3>{column.title}</h3>}
                            {column.links.map((link) => (
                              <Link key={link.slug} to={path(link.slug)}>
                                {link.name}
                                <ArrowUpRight size={15} aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              {extraCategories.map((category) => (
                <Link
                  className="boutique-mobile-extra"
                  key={category.id}
                  to={path(category.slug)}
                >
                  {category.name.replace(/&amp;/g, "&")}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              ))}
            </nav>
            <nav
              className="boutique-mobile-personal"
              aria-label="Your shopping"
            >
              <Link to="/account/">
                <UserRound size={19} aria-hidden="true" />
                <span>{customer ? "Your account" : "Sign in / Register"}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/wishlist/">
                <Heart size={19} aria-hidden="true" />
                <span>Wishlist</span>
                <small>{wishlist.length} pieces</small>
              </Link>
              <Link to="/cart/">
                <ShoppingBag size={19} aria-hidden="true" />
                <span>Shopping bag</span>
                <small>{count} pieces</small>
              </Link>
            </nav>
            <nav
              className="boutique-mobile-care"
              aria-label="About and customer care"
            >
              <Link to="/about/">Our story</Link>
              <Link to="/contact/">Contact us</Link>
              <Link to="/track-order/">Track your order</Link>
              {policies.map((policy) => (
                <Link key={policy.slug} to={`/${policy.slug}/`}>
                  {policy.name}
                </Link>
              ))}
            </nav>
          </div>
        </Modal>
      )}
      {search && (
        <Modal
          label="Search jewellery"
          className="boutique-search-overlay"
          close={() => setSearch(false)}
        >
          <div className="boutique-overlay-top">
            <span className="boutique-small-label">
              The Saalankruta collection
            </span>
            <button
              className="boutique-icon"
              aria-label="Close search"
              onClick={() => setSearch(false)}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <h2>
            Find your next <em>favourite.</em>
          </h2>
          <form className="boutique-search-form" action="/shop/">
            <Search size={23} aria-hidden="true" />
            <input
              type="search"
              name="q"
              autoFocus
              required
              placeholder="Search necklaces, bangles, earrings…"
              aria-label="Search jewellery"
            />
            <button type="submit" aria-label="Search products">
              <ArrowRight size={23} aria-hidden="true" />
            </button>
          </form>
          <div className="boutique-search-suggestions">
            <span className="boutique-small-label">
              Or explore a collection
            </span>
            <div>
              {groups
                .filter((item) => item.id !== "all")
                .map((item) => (
                  <Link key={item.id} to={item.href}>
                    {item.name}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
