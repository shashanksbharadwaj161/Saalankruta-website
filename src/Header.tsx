import { asset } from "./assets";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { filterProducts, inCategory, productPrice, text } from "./catalogue";
import { useStore } from "./store";
import Modal from "./Modal";

type CollectionLink = { name: string; slug: string };
type CollectionGroup = { name: string; slug: string; links: CollectionLink[] };
const path = (slug: string) => `/product-category/${slug}/`;
const groups: CollectionGroup[] = [
  {
    name: "Necklaces & Haras",
    slug: "necklace",
    links: [
      { name: "Necklaces", slug: "necklace" },
      { name: "Haras", slug: "hara" },
      { name: "Hara collection", slug: "hara-hara" },
      { name: "Pendants", slug: "pendent" },
      { name: "Pendant & earring sets", slug: "pendent-earring" },
    ],
  },
  {
    name: "Bangles",
    slug: "bangles",
    links: [
      { name: "All bangles", slug: "bangles" },
      { name: "Daily use bangles", slug: "daily-use-bangles" },
      { name: "Antique bangles", slug: "antique-bangle" },
      { name: "CZ & stone", slug: "cz-stone" },
      { name: "Kadas", slug: "kada" },
      { name: "More bangles", slug: "uncategorized" },
    ],
  },
  {
    name: "Earrings",
    slug: "earrings",
    links: [
      { name: "All earrings", slug: "earrings" },
      { name: "CZ studs", slug: "cz-studs" },
      { name: "Daily use studs", slug: "daily-use-studs" },
    ],
  },
  {
    name: "Bridal & Sets",
    slug: "combo-set",
    links: [
      { name: "Combo sets", slug: "combo-set" },
      { name: "Bridal sets", slug: "bridal-set" },
      { name: "Pendant & earring sets", slug: "pendent-earring" },
    ],
  },
  {
    name: "Finishing touches",
    slug: "hair-accessories",
    links: [
      { name: "Finger rings", slug: "finger-rings" },
      { name: "Matti", slug: "matti" },
      { name: "Nose pins", slug: "nose-pin" },
      { name: "Hair accessories", slug: "hair-accessories" },
      { name: "Netti chutti", slug: "netti-chutti" },
    ],
  },
  {
    name: "Gifts",
    slug: "gift-items",
    links: [
      { name: "All gift items", slug: "gift-items" },
      { name: "Kumkumbharani", slug: "kumkumbharani" },
      { name: "Silver plated gift items", slug: "silver-plated-gift-items" },
    ],
  },
];
const knownCategories = new Set(
  groups.flatMap((group) => group.links.map((link) => link.slug)),
);
const policies = [
  { name: "Shipping & delivery", slug: "shipping-and-delivery" },
  { name: "Cancellation & refund", slug: "cancellation-and-refund" },
  { name: "Privacy policy", slug: "privacy-policy" },
  { name: "Terms & conditions", slug: "terms-and-conditions" },
];

function JewellerySearch({ close }: { close: () => void }) {
  const { products, categories, loading, catalogueError } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // React's autoFocus runs while the parent dialog is still closed. Wait for
    // its native showModal() effect before moving focus to the search field.
    const frame = requestAnimationFrame(() =>
      input.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  const term = query.trim();
  // Match common collection plurals to the singular names used in WooCommerce.
  // Use the same term on the full results page so its count stays consistent.
  const searchTerm = term.replace(
    /\b(necklaces|bangles|earrings|rings)\b/gi,
    (word) => word.slice(0, -1),
  );
  const matches = useMemo(
    () =>
      term.length < 2
        ? []
        : filterProducts(products, categories, { query: searchTerm }),
    [products, categories, term.length, searchTerm],
  );
  const results = matches.slice(0, 6);
  const unavailable = !products.length && Boolean(catalogueError) && !loading;
  const resultLabel =
    loading && !products.length
      ? "Loading the collection…"
      : unavailable
        ? "The collection is temporarily unavailable."
        : term.length < 2
          ? "Search by a piece, colour or detail."
          : `${matches.length} ${matches.length === 1 ? "piece" : "pieces"} found`;
  return (
    <Modal
      label="Search jewellery"
      className="boutique-search-overlay"
      close={close}
    >
      <div className="boutique-search-content">
        <div className="boutique-overlay-top">
          <span className="boutique-small-label">Discover Saalankruta</span>
          <button
            className="boutique-icon"
            aria-label="Close search"
            onClick={close}
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="boutique-search-heading">
          <h2>
            A piece of <em>you.</em>
          </h2>
          <p>Find the details you love.</p>
        </div>
        <form
          className="boutique-search-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!term) return;
            navigate(`/shop/?q=${encodeURIComponent(searchTerm)}`);
            close();
          }}
        >
          <Search size={22} aria-hidden="true" />
          <input
            ref={input}
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            autoComplete="off"
            placeholder="Try necklaces, bangles, earrings…"
            aria-label="Search jewellery"
            aria-describedby="boutique-search-status"
          />
          {query && (
            <button
              className="boutique-search-clear"
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                input.current?.focus();
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
          <button
            className="boutique-search-submit"
            type="submit"
            aria-label="See all search results"
            disabled={!term}
          >
            <ArrowRight size={23} aria-hidden="true" />
          </button>
        </form>
        <div className="boutique-search-results">
          <p
            id="boutique-search-status"
            className="boutique-search-status"
            role="status"
            aria-live="polite"
          >
            {resultLabel}
          </p>
          {loading && !products.length ? (
            <div className="boutique-search-skeleton" aria-hidden="true">
              {[0, 1, 2, 3].map((item) => (
                <div key={item}>
                  <span />
                  <i />
                </div>
              ))}
            </div>
          ) : unavailable ? (
            <p className="boutique-search-empty">
              Please try again shortly, or{" "}
              <Link to="/contact/">contact the boutique</Link>.
            </p>
          ) : term.length >= 2 ? (
            <>
              {results.length > 0 ? (
                <ul className="boutique-search-grid">
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link to={`/product/${product.slug}/`}>
                        <div className="boutique-search-image">
                          {product.images[0] ? (
                            <img
                              src={
                                product.images[0].thumbnail ||
                                product.images[0].src
                              }
                              srcSet={product.images[0].srcset}
                              sizes="(max-width: 600px) 78px, 74px"
                              alt=""
                              width="90"
                              height="108"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <ShoppingBag aria-hidden="true" />
                          )}
                        </div>
                        <div className="boutique-search-product">
                          <span>{text(product.name)}</span>
                          <strong>{productPrice(product)}</strong>
                          {!product.is_in_stock && (
                            <small>Currently unavailable</small>
                          )}
                        </div>
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="boutique-search-empty">
                  <h3>No pieces found for “{term}”.</h3>
                  <p>Try a shorter search, such as “necklace” or “studs”.</p>
                  <Link to="/shop/">
                    Explore all jewellery{" "}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              )}
              {matches.length > 0 && (
                <Link
                  className="boutique-search-all"
                  to={`/shop/?q=${encodeURIComponent(searchTerm)}`}
                >
                  View all {matches.length}{" "}
                  {matches.length === 1 ? "piece" : "pieces"}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              )}
            </>
          ) : (
            <div className="boutique-search-suggestions">
              <span className="boutique-small-label">
                Begin with a collection
              </span>
              <div>
                {groups
                  .filter((group) => group.slug !== "hair-accessories")
                  .map((group) => (
                    <Link key={group.slug} to={path(group.slug)}>
                      {group.name}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function Header() {
  const { cart, wishlist, customer, products, categories } = useStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [mobileGroup, setMobileGroup] = useState("");
  const header = useRef<HTMLElement>(null);
  const collectionTrigger = useRef<HTMLButtonElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const featured =
    products.find(
      (product) =>
        inCategory(product, "necklace", categories) &&
        product.is_in_stock &&
        product.images.length,
    ) || products.find((product) => product.images.length);
  const extras = categories.filter(
    (category) => !knownCategories.has(category.slug),
  );
  useEffect(() => {
    setOpen(false);
    setSearch(false);
    setDropdown(false);
    setMobileGroup("");
  }, [location.pathname, location.search]);
  useEffect(() => {
    const desktop = matchMedia("(min-width: 1100px)");
    const reset = () => {
      setOpen(false);
      setDropdown(false);
    };
    desktop.addEventListener("change", reset);
    return () => desktop.removeEventListener("change", reset);
  }, []);
  useEffect(() => {
    const glass = header.current;
    if (!glass) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const transparency = matchMedia("(prefers-reduced-transparency: reduce)");
    let frame = 0;
    let x = 50;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      glass.style.setProperty("--glass-glint", "0");
    };
    const move = (event: PointerEvent) => {
      if (
        motion.matches ||
        transparency.matches ||
        event.pointerType === "touch"
      )
        return;
      const bounds = glass.getBoundingClientRect();
      x = ((event.clientX - bounds.left) / bounds.width) * 100;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        glass.style.setProperty("--glass-x", `${x}%`);
        glass.style.setProperty("--glass-glint", "1");
      });
    };
    glass.addEventListener("pointermove", move, { passive: true });
    glass.addEventListener("pointerleave", reset);
    motion.addEventListener("change", reset);
    transparency.addEventListener("change", reset);
    return () => {
      reset();
      glass.removeEventListener("pointermove", move);
      glass.removeEventListener("pointerleave", reset);
      motion.removeEventListener("change", reset);
      transparency.removeEventListener("change", reset);
    };
  }, []);
  useEffect(() => {
    if (!dropdown) return;
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setDropdown(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [dropdown]);
  const closeCollections = () => {
    setDropdown(false);
    collectionTrigger.current?.focus();
  };
  const openSearch = () => {
    setOpen(false);
    setDropdown(false);
    setSearch(true);
  };
  const closeSearch = () => {
    setSearch(false);
    requestAnimationFrame(() => searchTrigger.current?.focus());
  };

  return (
    <>
      <header
        className="header boutique-header"
        ref={header}
        data-menu-open={dropdown}
        onBlur={(event) => {
          if (
            event.relatedTarget &&
            !event.currentTarget.contains(event.relatedTarget)
          )
            setDropdown(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && dropdown) {
            event.preventDefault();
            closeCollections();
          }
        }}
      >
        <div className="boutique-brand-row">
          <nav className="boutique-brand-start" aria-label="Main navigation">
            <button
              className="boutique-icon boutique-mobile-toggle"
              aria-label="Open navigation"
              aria-haspopup="dialog"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
            <button
              className="boutique-collections-trigger"
              ref={collectionTrigger}
              aria-expanded={dropdown}
              aria-controls="boutique-collections-menu"
              onClick={() => setDropdown(!dropdown)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setDropdown(true);
                  requestAnimationFrame(() =>
                    header.current
                      ?.querySelector<HTMLAnchorElement>(".boutique-mega a")
                      ?.focus(),
                  );
                }
              }}
            >
              <span>Collections</span>
              <ChevronDown size={13} aria-hidden="true" />
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
              ref={searchTrigger}
              aria-label="Search products"
              onClick={openSearch}
              aria-haspopup="dialog"
            >
              <Search aria-hidden="true" />
              <span>Search</span>
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
        {dropdown && (
          <div className="boutique-mega" id="boutique-collections-menu">
            <div className="boutique-mega-top">
              <span className="boutique-small-label">The collections</span>
              <Link to="/shop/">
                Discover all jewellery{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <button
                className="boutique-icon"
                aria-label="Close collection menu"
                onClick={closeCollections}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="boutique-mega-layout">
              <nav
                className="boutique-mega-primary"
                aria-label="Jewellery collections"
              >
                {groups
                  .filter((group) => group.slug !== "hair-accessories")
                  .map((group, index) => (
                    <Link key={group.slug} to={path(group.slug)}>
                      <small>0{index + 1}</small>
                      <span>{group.name}</span>
                      <ArrowUpRight size={19} aria-hidden="true" />
                    </Link>
                  ))}
                <Link className="boutique-mega-all" to="/shop/">
                  View every piece <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </nav>
              <div className="boutique-mega-details">
                <nav aria-label="Jewellery styles">
                  <h2>Explore the details</h2>
                  {[
                    { name: "Haras", slug: "hara" },
                    { name: "Hara collection", slug: "hara-hara" },
                    { name: "Pendants", slug: "pendent" },
                    { name: "Pendant & earring sets", slug: "pendent-earring" },
                    { name: "Bridal sets", slug: "bridal-set" },
                    ...groups[4].links,
                  ].map((link) => (
                    <Link key={link.slug} to={path(link.slug)}>
                      {link.name}
                    </Link>
                  ))}
                </nav>
                <nav aria-label="Bangle, earring and gift styles">
                  <h2>Find your style</h2>
                  {[
                    ...groups[1].links.slice(1),
                    ...groups[2].links.slice(1),
                    ...groups[5].links.slice(1),
                  ].map((link) => (
                    <Link key={link.slug} to={path(link.slug)}>
                      {link.name}
                    </Link>
                  ))}
                  {extras.map((category) => (
                    <Link key={category.slug} to={path(category.slug)}>
                      {text(category.name)}
                    </Link>
                  ))}
                </nav>
              </div>
              {featured && (
                <Link
                  className="boutique-mega-piece"
                  to={`/product/${featured.slug}/`}
                >
                  <div className="boutique-mega-image">
                    <img
                      src={featured.images[0].src}
                      srcSet={featured.images[0].srcset}
                      sizes="(max-width: 1279px) 23vw, 25vw"
                      alt={featured.images[0].alt || text(featured.name)}
                      width="400"
                      height="460"
                      loading="lazy"
                    />
                    <span>
                      In the collection{" "}
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="boutique-mega-caption">
                    <span>{text(featured.name)}</span>
                    <strong>{productPrice(featured)}</strong>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      {dropdown && (
        <button
          type="button"
          tabIndex={-1}
          className="boutique-menu-scrim"
          aria-label="Close collection menu backdrop"
          onClick={closeCollections}
        />
      )}
      {open && (
        <Modal
          label="Navigation"
          className="boutique-navigation-overlay"
          close={() => setOpen(false)}
        >
          <div className="boutique-mobile-content">
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
                <span>Find a piece you love</span>
                <ArrowRight size={19} aria-hidden="true" />
              </button>
              <div className="boutique-mobile-intro">
                <span className="boutique-small-label">The collections</span>
                <Link to="/shop/">
                  View all <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
              <nav
                className="boutique-mobile-collections"
                aria-label="Mobile collections"
              >
                {groups.map((group, index) => (
                  <div className="boutique-mobile-group" key={group.slug}>
                    <div className="boutique-mobile-group-top">
                      <Link to={path(group.slug)}>
                        <small>0{index + 1}</small>
                        {group.name}
                      </Link>
                      <button
                        aria-label={`${mobileGroup === group.slug ? "Hide" : "Show"} ${group.name} styles`}
                        aria-expanded={mobileGroup === group.slug}
                        aria-controls={`mobile-collections-${group.slug}`}
                        onClick={() =>
                          setMobileGroup(
                            mobileGroup === group.slug ? "" : group.slug,
                          )
                        }
                      >
                        {mobileGroup === group.slug ? (
                          <Minus size={18} aria-hidden="true" />
                        ) : (
                          <Plus size={18} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {mobileGroup === group.slug && (
                      <div
                        className="boutique-mobile-children"
                        id={`mobile-collections-${group.slug}`}
                      >
                        {group.links.map((link) => (
                          <Link key={link.slug} to={path(link.slug)}>
                            {link.name}
                            <ArrowUpRight size={15} aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {extras.map((category) => (
                  <Link
                    className="boutique-mobile-extra"
                    key={category.slug}
                    to={path(category.slug)}
                  >
                    {text(category.name)}
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
                  <span>
                    {customer ? "Your account" : "Sign in / Register"}
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/wishlist/">
                  <Heart size={19} aria-hidden="true" />
                  <span>Wishlist</span>
                  <small>{wishlist.length}</small>
                </Link>
                <Link to="/cart/">
                  <ShoppingBag size={19} aria-hidden="true" />
                  <span>Shopping bag</span>
                  <small>{count}</small>
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
              <p className="boutique-mobile-signoff">
                A little Saalankruta. Entirely you.
              </p>
            </div>
          </div>
        </Modal>
      )}
      {search && <JewellerySearch close={closeSearch} />}
    </>
  );
}
