import CollectionMotion from "./CollectionMotion";
import KineticText from "./KineticText";
import NecklaceStory from "./NecklaceStory";
import ProductFilters from "./ProductFilters";
import Modal from "./Modal";
import BrandSignature from "./BrandSignature";
import Header from "./Header";
import RoyalAtmosphere from "./RoyalAtmosphere";
import ResetPassword from "./ResetPassword";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  Minus,
  Plus,
  Check,
  ChevronDown,
  SlidersHorizontal,
  Truck,
  ShieldCheck,
  Package,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "./store";
import { api } from "./api";
import {
  menu,
  price,
  productPrice,
  selectedVariation,
  clampQuantity,
  text,
  filterProducts,
  inCategory,
} from "./catalogue";
import type { Product, Address, Order, Cart, Customer } from "./types";
const categoryPath = (slug: string) => `/product-category/${slug}/`;
function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} - Saalankruta`;
  }, [title]);
}
function ScrollReset() {
  const { pathname, search, hash, key } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search, hash, key]);
  return null;
}
const policyLinks = [
  { name: "Privacy Policy", slug: "privacy-policy" },
  { name: "Terms and Conditions", slug: "terms-and-conditions" },
  { name: "Cancellation and Refund", slug: "cancellation-and-refund" },
  { name: "Shipping and Delivery", slug: "shipping-and-delivery" },
];
function Footer() {
  return (
    <footer className="atelier-footer">
      <div className="footer-masthead" aria-hidden="true">
        Saalankruta<span>Every woman’s dream.</span>
      </div>
      <div className="footer-top">
        <div className="footer-brand">
          <BrandSignature />
          <p>
            Tradition, with a personal touch.
            <br />
            Jewellery for the moments that are yours.
          </p>
          <Link to="/about/">
            Our story <ArrowUpRight size={16} />
          </Link>
        </div>
        <div>
          <h3>Discover</h3>
          {menu.slice(0, 4).map((m) => (
            <Link to={categoryPath(m.slug)} key={m.slug}>
              {m.name}
            </Link>
          ))}
          <Link to="/shop/">All jewellery & gifts</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link to="/contact/">Contact us</Link>
          <Link to="/track-order/">Track your order</Link>
          <Link to="/account/">Your account</Link>
          <Link to="/wishlist/">Your wishlist</Link>
          {policyLinks.slice(2).map((p) => (
            <Link key={p.slug} to={`/${p.slug}/`}>
              {p.name}
            </Link>
          ))}
        </div>
        <div>
          <h3>Visit & connect</h3>
          <p>
            No.3, Pushpahasa, 3rd Cross,
            <br />
            Sumukha Layout, Chikkalsandra,
            <br />
            Bengaluru - 560061
          </p>
          <a href="mailto:saalankruta@gmail.com">saalankruta@gmail.com</a>
          <Link to="/contact/">
            Speak with the boutique <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Saalankruta</span>
        <div>
          <Link to="/privacy-policy/">Privacy</Link>
          <Link to="/terms-and-conditions/">Terms</Link>
          <span>India · INR ₹</span>
        </div>
      </div>
    </footer>
  );
}
function ProductCard({ product: p }: { product: Product }) {
  const { wishlist, toggleWish } = useStore();
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/product/${p.slug}/`}>
          <img
            src={
              p.images[0]?.thumbnail ||
              p.images[0]?.src ||
              "/product-placeholder.svg"
            }
            alt={p.images[0]?.alt || text(p.name)}
            loading="lazy"
          />
        </Link>
        <button
          className={`wish-button ${wishlist.includes(p.id) ? "selected" : ""}`}
          aria-label={`${wishlist.includes(p.id) ? "Remove" : "Add"} ${text(p.name)} ${wishlist.includes(p.id) ? "from" : "to"} wishlist`}
          aria-pressed={wishlist.includes(p.id)}
          onClick={() => void toggleWish(p.id)}
        >
          <Heart size={18} />
        </button>
        {p.on_sale && <span className="photo-label">Special price</span>}
        {!p.is_in_stock && <span className="photo-label">Sold out</span>}
      </div>
      <div className="product-caption">
        <span>{text(p.categories[0]?.name || "Jewellery")}</span>
        <Link to={`/product/${p.slug}/`}>
          <h3>{text(p.name)}</h3>
        </Link>
        <div>
          {productPrice(p)}{" "}
          {p.on_sale && (
            <del>
              {price(p.prices.regular_price, p.prices.currency_minor_unit)}
            </del>
          )}
        </div>
      </div>
    </article>
  );
}
function Home() {
  useTitle("Every woman's dream");
  const [motionPaused, setMotionPaused] = useState(false);
  const { products, categories, loading } = useStore();
  const hero = products.find((p) => p.slug === "cz-necklace-4") || products[0];
  const bridal = products.find((p) => inCategory(p, "bridal-set", categories));
  const collectionTiles = [
    {
      slug: "necklace",
      name: "Necklaces",
      note: "The finishing touch",
      product: hero,
    },
    {
      slug: "bangles",
      name: "Bangles",
      note: "A little everyday ritual",
      product: products.find((p) => p.slug === "cz-green-bangle"),
    },
    {
      slug: "earrings",
      name: "Earrings",
      note: "Details that speak",
      product:
        products.find((p) => p.slug === "plate-changeable-stud") ||
        products.find((p) => inCategory(p, "earrings", categories)),
    },
    {
      slug: "bridal-set",
      name: "Bridal & sets",
      note: "For your big moments",
      product: bridal,
    },
  ];
  const selections = [
    { slug: "necklace", title: "Around you.", note: "THE NECKLACE EDIT" },
    { slug: "bangles", title: "In the details.", note: "THE BANGLE EDIT" },
    {
      slug: "gift-items",
      title: "A thoughtful gesture.",
      note: "JEWELLERY & GIFTS",
    },
  ];
  return (
    <div className="atelier-home">
      <CollectionMotion />
      <NecklaceStory paused={motionPaused} onPauseChange={setMotionPaused} />
      <section className="atelier-manifesto">
        <RoyalAtmosphere paused={motionPaused} />
        <div className="wrap">
          <div className="atelier-section-label">
            <span>FROM OUR BOUTIQUE</span>
            <span>BENGALURU, INDIA</span>
          </div>
          <h2>
            <KineticText text="An expression entirely yours." />
          </h2>
          <div className="manifesto-bottom">
            <p>
              Traditional jewellery, contemporary choices. Explore necklaces,
              bangles and occasion pieces from our Bengaluru boutique.
            </p>
            <Link className="text-link" to="/about/">
              Meet Saalankruta <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
      </section>
      <section
        className="collection-index wrap"
        aria-labelledby="collection-index-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="collection-index-title">
              <KineticText text="The collections." />
            </h2>
          </div>
          <Link className="text-link" to="/shop/">
            Explore every piece <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className="collection-canvas">
          {collectionTiles.map((item, i) => (
            <Link
              className={`collection-tile tile-${i + 1}`}
              to={categoryPath(item.slug)}
              key={item.slug}
            >
              <div className="collection-tile-image">
                {item.product?.images[0] && (
                  <img
                    src={item.product.images[0].src}
                    alt={text(item.product.name)}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="collection-tile-caption">
                <span>
                  <small>{item.note}</small>
                  <strong>{item.name}</strong>
                </span>
                <ArrowUpRight size={24} />
              </div>
            </Link>
          ))}
        </div>
        <div className="collection-index-links">
          <span>Also discover</span>
          {[
            "hara",
            "finger-rings",
            "matti",
            "nose-pin",
            "hair-accessories",
            "gift-items",
          ].map((slug) => (
            <Link key={slug} to={categoryPath(slug)}>
              {text(categories.find((c) => c.slug === slug)?.name || slug)}
            </Link>
          ))}
        </div>
      </section>
      {loading && <p className="wrap">Finding your favourites…</p>}
      {selections.map(({ slug, title, note }, index) => {
        const selected = filterProducts(products, categories, { slug });
        const list =
          index === 0 && hero
            ? [hero, ...selected.filter((p) => p.id !== hero.id)].slice(0, 4)
            : selected.slice(0, 4);
        if (!list.length) return null;
        return (
          <section
            className={`collection-section atelier-edit edit-${index} wrap`}
            key={slug}
            id={slug === "necklace" ? "necklace-collection" : undefined}
          >
            <div className="section-heading">
              <div>
                <h2>
                  <KineticText text={title} />
                </h2>
              </div>
              <Link className="text-link" to={categoryPath(slug)}>
                Shop{" "}
                {text(categories.find((c) => c.slug === slug)?.name || slug)}{" "}
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div
              className={`product-grid ${index === 0 ? "product-edit" : ""}`}
            >
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {index === 1 && (
              <div className="atelier-occasion">
                <div>
                  <h2>
                    <KineticText text="Some days deserve everything." />
                  </h2>
                  <p>
                    Bridal sets and traditional jewellery for the moments you
                    make your own.
                  </p>
                  <Link className="primary" to={categoryPath("bridal-set")}>
                    Explore bridal sets <ArrowRight size={18} />
                  </Link>
                </div>
                {bridal?.images[0] && (
                  <img
                    src={bridal.images[0].src}
                    alt={text(bridal.name)}
                    loading="lazy"
                  />
                )}
              </div>
            )}
          </section>
        );
      })}
      <section className="atelier-visit">
        <RoyalAtmosphere paused={motionPaused} />
        <div className="wrap">
          <h2>
            <KineticText text="Bengaluru." />
          </h2>
          <div className="visit-bottom">
            <p>
              No.3, Pushpahasa, 3rd Cross,
              <br />
              Sumukha Layout, Chikkalsandra,
              <br />
              Bengaluru – 560061
            </p>
            <Link className="text-link" to="/contact/">
              Visit the boutique <ArrowUpRight size={24} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
function Collection() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { products, categories, loading, catalogueError } = useStore();
  const [filters, setFilters] = useState(false);
  const active = categories.find((c) => c.slug === slug);
  const title = active
    ? text(active.name)
    : params.get("q")
      ? `Results for “${params.get("q")}”`
      : "All jewellery & gifts";
  useTitle(title);
  const result = filterProducts(products, categories, {
    slug,
    query: params.get("q") || "",
    min: params.has("min") ? Math.max(0, Number(params.get("min"))) : undefined,
    max: params.has("max") ? Math.max(0, Number(params.get("max"))) : undefined,
    stock: params.get("stock") === "yes",
    sort: params.get("sort") || "",
  });
  const page = Math.min(
    Math.max(1, Number(params.get("page")) || 1),
    Math.max(1, Math.ceil(result.length / 16)),
  );
  const pages = Math.ceil(result.length / 16);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    setParams(next);
  };
  const related = menu.find((m) => m.slug === slug)?.children || [];
  return (
    <div className="wrap page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{title}</span>
      </div>
      <div className="collection-intro">
        <span className="eyebrow">THE SAALANKRUTA COLLECTION</span>
        <h1>
          <KineticText text={title} />
        </h1>
        <p>Explore the collection. Find your expression.</p>
      </div>
      {related.length > 0 && (
        <div className="category-tabs">
          <Link to={categoryPath(slug!)}>All {title}</Link>
          {related.map((c) => (
            <Link to={categoryPath(c.slug)} key={c.slug}>
              {c.name}
            </Link>
          ))}
        </div>
      )}
      <div className="collection-toolbar">
        <button
          className="text-link"
          onClick={() => setFilters(!filters)}
          aria-expanded={filters}
        >
          <SlidersHorizontal size={17} /> Filters
        </button>
        <span>{result.length} pieces</span>
        <label>
          Sort{" "}
          <select
            value={params.get("sort") || "latest"}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="latest">Latest first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      {filters && (
        <ProductFilters
          categories={categories}
          slug={slug}
          params={params}
          close={() => setFilters(false)}
          apply={(values) => {
            const next = new URLSearchParams(params);
            for (const key of ["q", "min", "max", "stock"] as const)
              values[key] ? next.set(key, values[key]) : next.delete(key);
            next.delete("page");
            setFilters(false);
            navigate(
              `${values.category ? categoryPath(values.category) : "/shop/"}${next.size ? `?${next}` : ""}`,
            );
          }}
        />
      )}
      {catalogueError && <p className="service-note">{catalogueError}</p>}
      {loading ? (
        <p>Loading the collection…</p>
      ) : result.length === 0 ? (
        <Empty
          title="No pieces found"
          message="Try another search or remove a filter."
          to="/shop/"
          action="Explore all pieces"
        />
      ) : (
        <div className="product-grid collection-grid">
          {result.slice((page - 1) * 16, page * 16).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className="pagination" aria-label="Collection pages">
          {Array.from({ length: pages }, (_, i) => (
            <button
              aria-current={page === i + 1 ? "page" : undefined}
              className={page === i + 1 ? "active" : ""}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(i + 1));
                setParams(next);
                window.scrollTo(0, 0);
              }}
              key={i}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
function ProductPage() {
  const { slug } = useParams();
  const {
    products,
    categories,
    loading,
    wishlist,
    toggleWish,
    cartAction,
    busy,
  } = useStore();
  const snapshot = products.find((p) => p.slug === slug);
  const [detail, setDetail] = useState<Product | null>(null),
    [variationDetail, setVariationDetail] = useState<Product | null>(null);
  const p =
    detail && detail.slug === slug
      ? {
          ...detail,
          images: detail.images.length ? detail.images : snapshot?.images || [],
        }
      : snapshot;
  useEffect(() => {
    let alive = true;
    setDetail(null);
    if (snapshot?.id)
      api<Product>("product", { id: snapshot.id })
        .then((v) => {
          if (alive) setDetail(v);
        })
        .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slug, snapshot?.id]);
  const [image, setImage] = useState(0),
    [quantity, setQuantity] = useState(1),
    [zoom, setZoom] = useState(false),
    [selection, setSelection] = useState<Record<string, string>>({});
  useEffect(() => {
    setImage(0);
    setQuantity(1);
    setSelection({});
  }, [slug]);
  const variant = selectedVariation(p, selection);
  useEffect(() => {
    let alive = true;
    setVariationDetail(null);
    if (variant?.id)
      api<Product>("product", { id: variant.id })
        .then((v) => {
          if (alive) setVariationDetail(v);
        })
        .catch(() => {});
    return () => {
      alive = false;
    };
  }, [variant?.id]);
  const chosen =
    variant && variationDetail?.id === variant.id ? variationDetail : null;
  const purchase = chosen || p;
  const limits = purchase?.add_to_cart;
  useEffect(() => {
    setQuantity((q) => clampQuantity(q, limits));
  }, [limits?.minimum, limits?.maximum, limits?.multiple_of]);
  useTitle(p ? text(p.name) : "Jewellery");
  if (loading) return <p className="wrap page">Loading your piece…</p>;
  if (!p || !purchase) return <NotFound />;
  const canBuy =
    purchase.is_in_stock &&
    purchase.is_purchasable &&
    (!p.has_options || !!chosen);
  const purchaseLabel = busy
    ? "Adding…"
    : p.has_options && !variant
      ? "Select your options"
      : p.has_options && !chosen
        ? "Checking option…"
        : !purchase.is_in_stock
          ? "Sold out"
          : !purchase.is_purchasable
            ? "Unavailable"
            : "Add to bag";
  const related = products
    .filter(
      (other) =>
        other.id !== p.id &&
        other.categories.some((c) => p.categories.some((pc) => pc.id === c.id)),
    )
    .slice(0, 4);
  return (
    <div className="wrap page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={categoryPath(p.categories[0]?.slug || "necklace")}>
          {text(p.categories[0]?.name || "Jewellery")}
        </Link>
        <span>/</span>
        <span>{text(p.name)}</span>
      </div>
      <div className="product-detail">
        <div className="gallery">
          <button
            className="main-image"
            onClick={() => setZoom(true)}
            aria-label="Enlarge product image"
          >
            <img
              src={p.images[image]?.src || "/product-placeholder.svg"}
              alt={p.images[image]?.alt || text(p.name)}
            />
            <span>
              View closer <Plus size={15} />
            </span>
          </button>
          {p.images.length > 1 && (
            <div className="thumbnails">
              {p.images.map((i, n) => (
                <button
                  key={i.id}
                  onClick={() => setImage(n)}
                  aria-label={`View image ${n + 1}`}
                  aria-pressed={image === n}
                >
                  <img src={i.thumbnail || i.src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-info">
          <span className="eyebrow">
            THE {text(p.categories[0]?.name || "JEWELLERY")} EDIT
          </span>
          <h1>{text(p.name)}</h1>
          <p className="detail-price">
            {productPrice(purchase)}{" "}
            {purchase.on_sale && (
              <del>
                {price(
                  purchase.prices.regular_price,
                  purchase.prices.currency_minor_unit,
                )}
              </del>
            )}
          </p>
          <p className="product-description">
            {text(p.short_description || p.description) ||
              "Explore the piece in the gallery. Contact the boutique for fit, materials and care details."}
          </p>
          <span className="stock">
            <span className={p.is_in_stock ? "stock-dot" : "stock-dot sold"} />
            {purchase.is_in_stock
              ? purchase.is_purchasable
                ? "Available"
                : "Currently unavailable"
              : "Currently sold out"}
          </span>
          {p.attributes
            ?.filter((a) => a.has_variations)
            .map((a) => (
              <label className="variant" key={a.name}>
                {a.name}
                <select
                  value={selection[a.name] || ""}
                  onChange={(e) =>
                    setSelection({ ...selection, [a.name]: e.target.value })
                  }
                >
                  <option value="">Choose {a.name.toLowerCase()}</option>
                  {a.terms.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {text(t.name)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          <div className="purchase-row">
            <div className="quantity">
              <button
                aria-label="Decrease quantity"
                onClick={() =>
                  setQuantity(
                    clampQuantity(
                      quantity - (limits?.multiple_of || 1),
                      limits,
                    ),
                  )
                }
              >
                <Minus size={14} />
              </button>
              <input
                aria-label="Quantity"
                type="number"
                min={limits?.minimum || 1}
                max={
                  limits?.maximum && limits.maximum > 0
                    ? limits.maximum
                    : undefined
                }
                step={limits?.multiple_of || 1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    clampQuantity(Number(e.target.value) || 1, limits),
                  )
                }
              />
              <button
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity(
                    clampQuantity(
                      quantity + (limits?.multiple_of || 1),
                      limits,
                    ),
                  )
                }
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              className="primary"
              disabled={!canBuy || busy}
              onClick={() =>
                void cartAction("add-item", {
                  id: variant?.id || p.id,
                  quantity,
                  variation: p.attributes
                    .filter((a) => a.has_variations)
                    .map((a) => ({
                      attribute: a.name,
                      value: selection[a.name],
                    })),
                })
              }
            >
              <ShoppingBag size={18} />
              {purchaseLabel}
            </button>
            <button
              className={`icon-button ${wishlist.includes(p.id) ? "selected" : ""}`}
              aria-label="Save to wishlist"
              aria-pressed={wishlist.includes(p.id)}
              onClick={() => void toggleWish(p.id)}
            >
              <Heart />
            </button>
          </div>
          <div className="detail-services">
            <p>
              <Truck size={17} /> Delivery within India · calculated at checkout
            </p>
            <p>
              <Package size={17} /> Product availability verified in your bag
            </p>
            <Link to="/contact/">
              <Mail size={17} /> A question about this piece? Ask us
            </Link>
          </div>
          <details open>
            <summary>The details</summary>
            <p>
              {text(p.description) ||
                "Please contact the boutique for product specifications."}
            </p>
            {p.attributes
              ?.filter((a) => !a.has_variations)
              .map((a) => (
                <p key={a.name}>
                  <strong>{a.name}:</strong>{" "}
                  {a.terms.map((t) => text(t.name)).join(", ")}
                </p>
              ))}
          </details>
          <details>
            <summary>Delivery & returns</summary>
            <p>
              India-only delivery. Available delivery methods and charges appear
              after your address is entered.
            </p>
            <Link to="/shipping-and-delivery/">Delivery information</Link>
            <br />
            <Link to="/cancellation-and-refund/">Returns information</Link>
          </details>
        </div>
      </div>
      {zoom && (
        <Modal
          className="zoom"
          label="Product image enlarged"
          close={() => setZoom(false)}
        >
          <button
            className="icon-button"
            onClick={() => setZoom(false)}
            aria-label="Close enlarged image"
          >
            <X />
          </button>
          <img
            src={p.images[image]?.src || "/product-placeholder.svg"}
            alt={text(p.name)}
          />
        </Modal>
      )}
      <section className="collection-section">
        <div className="section-heading">
          <h2>A lovely pairing</h2>
          <Link
            className="text-link"
            to={categoryPath(p.categories[0]?.slug || "necklace")}
          >
            Explore more <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {related.map((r) => (
            <ProductCard key={r.id} product={r} />
          ))}
        </div>
      </section>
      <div className="mobile-purchase">
        <span>{productPrice(purchase)}</span>
        <button
          className="primary"
          disabled={!canBuy || busy}
          onClick={() =>
            void cartAction("add-item", {
              id: variant?.id || p.id,
              quantity,
              variation: p.attributes
                .filter((a) => a.has_variations)
                .map((a) => ({ attribute: a.name, value: selection[a.name] })),
            })
          }
        >
          {purchaseLabel}
        </button>
      </div>
    </div>
  );
}
function Empty({
  title,
  message,
  to,
  action,
}: {
  title: string;
  message: string;
  to: string;
  action: string;
}) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{message}</p>
      <Link className="primary" to={to}>
        {action}
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
function Wishlist() {
  const { wishlist, products } = useStore();
  useTitle("Your wishlist");
  return (
    <div className="wrap page">
      <div className="collection-intro commerce-intro">
        <h1>Your wishlist</h1>
      </div>
      {wishlist.length ? (
        <div className="product-grid">
          {products
            .filter((p) => wishlist.includes(p.id))
            .map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
        </div>
      ) : (
        <Empty
          title="Your favourites belong here"
          message="Save the pieces you love with the heart beside each product."
          to="/shop/"
          action="Find your favourites"
        />
      )}
    </div>
  );
}
function CartTotals({ cart }: { cart: Cart }) {
  const unit = cart.totals.currency_minor_unit;
  return (
    <div className="totals">
      <p>
        <span>Subtotal</span>
        <span>{price(cart.totals.total_items, unit)}</span>
      </p>
      <p>
        <span>Delivery</span>
        <span>
          {cart.has_calculated_shipping
            ? price(cart.totals.total_shipping, unit)
            : "At checkout"}
        </span>
      </p>
      {Number(cart.totals.total_discount) > 0 && (
        <p>
          <span>Discount</span>
          <span>−{price(cart.totals.total_discount, unit)}</span>
        </p>
      )}
      {Number(cart.totals.total_tax) > 0 && (
        <p>
          <span>Tax</span>
          <span>{price(cart.totals.total_tax, unit)}</span>
        </p>
      )}
      <p className="total">
        <span>Total</span>
        <span>{price(cart.totals.total_price, unit)}</span>
      </p>
    </div>
  );
}
function CartPage() {
  const { products, cart, refreshCart, cartAction, busy } = useStore();
  const [error, setError] = useState(""),
    [coupon, setCoupon] = useState("");
  useTitle("Your bag");
  useEffect(() => {
    refreshCart().catch((e) => setError(e.message));
  }, []);
  return (
    <div className="wrap page">
      <div className="collection-intro commerce-intro">
        <h1>Your bag</h1>
      </div>
      {error && (
        <ErrorBox
          message={error}
          retry={() => {
            setError("");
            refreshCart().catch((e) => setError(e.message));
          }}
        />
      )}
      {!error && !cart && <p>Opening your bag…</p>}
      {cart && !cart.items.length && (
        <Empty
          title="Your bag is empty"
          message="The pieces you add will appear here."
          to="/shop/"
          action="Explore the collection"
        />
      )}
      {cart && cart.items.length > 0 && (
        <div className="shopping-layout">
          <div>
            {cart.items.map((item) => (
              <article className="cart-item" key={item.key}>
                <img
                  src={
                    item.images[0]?.thumbnail ||
                    item.images[0]?.src ||
                    products.find((p) => p.id === item.id)?.images[0]?.src ||
                    "/product-placeholder.svg"
                  }
                  alt={text(item.name)}
                />
                <div>
                  <h3>{text(item.name)}</h3>
                  <p>
                    {price(item.prices.price, item.prices.currency_minor_unit)}
                  </p>
                  <div className="quantity">
                    <button
                      disabled={
                        busy || item.quantity <= item.quantity_limits.minimum
                      }
                      aria-label={`Decrease ${text(item.name)} quantity`}
                      onClick={() =>
                        void cartAction("update-item", {
                          key: item.key,
                          quantity: item.quantity - 1,
                        })
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      disabled={
                        busy || item.quantity >= item.quantity_limits.maximum
                      }
                      aria-label={`Increase ${text(item.name)} quantity`}
                      onClick={() =>
                        void cartAction("update-item", {
                          key: item.key,
                          quantity: item.quantity + 1,
                        })
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    className="text-link remove"
                    disabled={busy}
                    onClick={() =>
                      void cartAction("remove-item", { key: item.key })
                    }
                  >
                    Remove
                  </button>
                </div>
                <strong>
                  {price(
                    item.totals.line_total,
                    item.prices.currency_minor_unit,
                  )}
                </strong>
              </article>
            ))}
            <Link className="text-link" to="/shop/">
              <ArrowLeft size={16} /> Continue exploring
            </Link>
          </div>
          <aside className="order-summary">
            <h2>Order summary</h2>
            <CartTotals cart={cart} />
            <form
              className="coupon"
              onSubmit={(e) => {
                e.preventDefault();
                void cartAction("apply-coupon", { code: coupon });
              }}
            >
              <label htmlFor="coupon">Have a promo code?</label>
              <div>
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter code"
                  required
                />
                <button disabled={busy}>Apply</button>
              </div>
            </form>
            {cart.coupons.map((c) => (
              <button
                className="text-link"
                onClick={() =>
                  void cartAction("remove-coupon", { code: c.code })
                }
                key={c.code}
              >
                {c.code} <X size={14} />
              </button>
            ))}
            <Link className="primary block" to="/checkout/">
              Continue to checkout <ArrowRight size={17} />
            </Link>
            <p className="small">
              <ShieldCheck size={14} /> Prices and availability verified by the
              store
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
const blankAddress: Address = {
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
const states: Record<string, string> = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CT: "Chhattisgarh",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JK: "Jammu and Kashmir",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OR: "Odisha",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TS: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UK: "Uttarakhand",
  WB: "West Bengal",
  AN: "Andaman and Nicobar Islands",
  CH: "Chandigarh",
  DN: "Dadra and Nagar Haveli and Daman and Diu",
  DL: "Delhi",
  LD: "Lakshadweep",
  PY: "Puducherry",
};
function AddressFields({
  address,
  setAddress,
  email = true,
}: {
  address: Address;
  setAddress: (a: Address) => void;
  email?: boolean;
}) {
  return (
    <div className="form-grid">
      {(
        [
          "first_name",
          "last_name",
          ...(email ? ["email", "phone"] : []),
          "address_1",
          "address_2",
          "city",
          "postcode",
        ] as (keyof Address)[]
      ).map((key) => (
        <label key={key} className={key.startsWith("address") ? "full" : ""}>
          {
            {
              first_name: "First name",
              last_name: "Last name",
              email: "Email",
              phone: "Phone number",
              address_1: "Street address",
              address_2: "Apartment, floor, landmark (optional)",
              city: "Town / city",
              postcode: "PIN code",
            }[key as string]
          }
          <input
            required={key !== "address_2"}
            type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
            inputMode={key === "postcode" ? "numeric" : undefined}
            pattern={key === "postcode" ? "[1-9][0-9]{5}" : undefined}
            autoComplete={
              key === "postcode"
                ? "postal-code"
                : key === "email"
                  ? "email"
                  : undefined
            }
            value={address[key] || ""}
            onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
          />
        </label>
      ))}
      <label>
        State / Union territory
        <select
          value={address.state}
          onChange={(e) => setAddress({ ...address, state: e.target.value })}
          required
        >
          <option value="">Select your state</option>
          {Object.entries(states).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Country
        <input value="India" readOnly />
      </label>
    </div>
  );
}
function Checkout() {
  const { products, cart, refreshCart, customer, cartAction, busy } =
    useStore();
  const [address, setAddress] = useState<Address>(
      customer?.billing
        ? { ...blankAddress, ...customer.billing, country: "IN" }
        : { ...blankAddress },
    ),
    [shipping, setShipping] = useState<Address>({ ...blankAddress }),
    [separate, setSeparate] = useState(false),
    [step, setStep] = useState(1),
    [error, setError] = useState(""),
    [submitting, setSubmitting] = useState(false),
    [methods, setMethods] = useState<{
      enabled: boolean;
      methods: { id: string; title: string }[];
    }>({ enabled: false, methods: [] }),
    [method, setMethod] = useState(""),
    [createAccount, setCreateAccount] = useState(false),
    [note, setNote] = useState("");
  const key = useRef(crypto.randomUUID());
  const navigate = useNavigate();
  useTitle("Checkout");
  useEffect(() => {
    refreshCart().catch((e) => setError(e.message));
    api<typeof methods>("payment-config")
      .then(setMethods)
      .catch(() => {});
  }, []);
  const delivery = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await cartAction("update-customer", {
      billing_address: address,
      shipping_address: separate ? shipping : address,
    });
    if (success) setStep(2);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!methods.enabled || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await api<{
        order_id: number;
        order_key: string;
        payment_result: { payment_status: string; redirect_url: string };
      }>("checkout", {
        billing_address: address,
        shipping_address: separate ? shipping : address,
        payment_method: method,
        customer_note: note,
        create_account: createAccount,
        expected_total: cart?.totals.total_price,
        idempotency_key: key.current,
      });
      const redirect = response.payment_result.redirect_url;
      if (redirect) {
        const url = new URL(redirect, location.origin);
        if (
          url.protocol !== "https:" &&
          !(url.origin === location.origin && url.hostname === "127.0.0.1")
        )
          throw Error("The payment provider returned an invalid redirect.");
        window.location.assign(url.href);
      } else
        navigate(
          `/order-confirmation/?order=${response.order_id}&key=${encodeURIComponent(response.order_key)}`,
        );
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };
  return (
    <div className="wrap page">
      <div className="breadcrumbs">
        <Link to="/cart/">Your bag</Link>
        <span>/</span>
        <span>Checkout</span>
      </div>
      <div className="collection-intro commerce-intro">
        <h1>Checkout</h1>
      </div>
      {error && <ErrorBox message={error} />}
      <div className="checkout-steps">
        <span className={step === 1 ? "active" : ""}>Your details</span>
        <span className={step === 2 ? "active" : ""}>Delivery & payment</span>
      </div>
      {cart && cart.items.length === 0 ? (
        <Empty
          title="Your bag is empty"
          message="Choose a piece before continuing."
          to="/shop/"
          action="Explore the collection"
        />
      ) : (
        <div className="shopping-layout">
          <section>
            {step === 1 ? (
              <form onSubmit={delivery}>
                <h2>Delivery details</h2>
                {!customer && (
                  <p>
                    Checkout as a guest, or <Link to="/account/">sign in</Link>.
                  </p>
                )}
                <AddressFields address={address} setAddress={setAddress} />
                <label className="check">
                  <input
                    type="checkbox"
                    checked={separate}
                    onChange={(e) => setSeparate(e.target.checked)}
                  />{" "}
                  Deliver to a different address
                </label>
                {separate && (
                  <AddressFields
                    address={shipping}
                    setAddress={setShipping}
                    email={false}
                  />
                )}
                <label>
                  Order note (optional)
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </label>
                {!customer && (
                  <>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                      />{" "}
                      Create an account to keep your favourites and orders
                      together
                    </label>
                    {createAccount && (
                      <p className="service-note">
                        We will email you a secure link to set your account
                        password.
                      </p>
                    )}
                  </>
                )}
                <button className="primary" disabled={busy || !cart}>
                  {busy ? "Checking delivery…" : "Continue to delivery"}
                  <ArrowRight size={17} />
                </button>
              </form>
            ) : (
              <form onSubmit={submit}>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} /> Edit details
                </button>
                <h2>Delivery</h2>
                {cart?.shipping_rates.flatMap((pack) =>
                  pack.shipping_rates.map((rate) => (
                    <label className="radio-row" key={rate.rate_id}>
                      <input
                        type="radio"
                        name={`shipping-${pack.package_id}`}
                        checked={rate.selected}
                        onChange={() =>
                          void cartAction("select-shipping-rate", {
                            package_id: pack.package_id,
                            rate_id: rate.rate_id,
                          })
                        }
                      />
                      <span>{rate.name}</span>
                      <strong>
                        {price(rate.price, cart.totals.currency_minor_unit)}
                      </strong>
                    </label>
                  )),
                )}
                {cart?.needs_shipping &&
                  !cart.shipping_rates.some(
                    (p) => p.shipping_rates.length > 0,
                  ) && (
                    <p role="alert" className="service-note">
                      Delivery is not available for this address yet. Contact
                      the boutique before placing an order.
                    </p>
                  )}
                <h2>Payment</h2>
                {methods.enabled ? (
                  methods.methods.map((m) => (
                    <label className="radio-row" key={m.id}>
                      <input
                        required
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={method === m.id}
                        onChange={() => setMethod(m.id)}
                      />
                      {m.title}
                    </label>
                  ))
                ) : (
                  <p className="service-note">
                    Online payments are being prepared. Order placement will
                    open when payments and delivery are ready.
                  </p>
                )}
                <label className="check">
                  <input required type="checkbox" /> I agree to the{" "}
                  <Link to="/terms-and-conditions/">terms</Link> and have read
                  the <Link to="/cancellation-and-refund/">returns policy</Link>
                  .
                </label>
                <button
                  className="primary block"
                  disabled={
                    !methods.enabled ||
                    !method ||
                    busy ||
                    submitting ||
                    !!(
                      cart?.needs_shipping &&
                      !cart.shipping_rates.some((p) =>
                        p.shipping_rates.some((r) => r.selected),
                      )
                    )
                  }
                >
                  {submitting ? "Processing…" : "Place order"}
                  <ArrowRight size={17} />
                </button>
              </form>
            )}
          </section>
          <aside className="order-summary">
            <h2>Your selection</h2>
            {cart?.items.map((i) => (
              <div className="mini-item" key={i.key}>
                <img
                  src={
                    i.images[0]?.thumbnail ||
                    i.images[0]?.src ||
                    products.find((p) => p.id === i.id)?.images[0]?.src ||
                    "/product-placeholder.svg"
                  }
                  alt=""
                />
                <span>
                  {text(i.name)}
                  <small>Quantity {i.quantity}</small>
                </span>
                <span>
                  {price(i.totals.line_total, i.prices.currency_minor_unit)}
                </span>
              </div>
            ))}
            {cart && <CartTotals cart={cart} />}
            <p className="small">
              <ShieldCheck size={15} /> Your order is handled by Saalankruta.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
function ErrorBox({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="error-box" role="alert">
      {message}
      {retry && (
        <button className="text-link" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
function Account() {
  const { customer, authenticate, logout } = useStore();
  const [mode, setMode] = useState("login"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [message, setMessage] = useState(""),
    [working, setWorking] = useState(false),
    [orders, setOrders] = useState<Order[]>([]),
    [address, setAddress] = useState<Address>({ ...blankAddress });
  useTitle("Your account");
  useEffect(() => {
    if (customer) {
      setAddress({ ...blankAddress, ...customer.billing });
      api<Order[]>("orders")
        .then(setOrders)
        .catch((e) => setMessage(e.message));
    }
  }, [customer]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setWorking(true);
    setMessage("");
    try {
      if (mode === "reset") {
        await api("password-reset", { email });
        setMessage(
          "If an account matches that email, a reset link will arrive shortly.",
        );
      } else await authenticate(mode, { email, password, name });
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setWorking(false);
    }
  }
  return (
    <div className="wrap page account-page">
      <div className="collection-intro commerce-intro">
        <h1>
          {customer ? `Hello, ${customer.name.split(" ")[0]}.` : "Your account"}
        </h1>
        {!customer && <p>Sign in to view your orders and saved pieces.</p>}
      </div>
      {message && (
        <p className="service-note" role="status">
          {message}
        </p>
      )}
      {!customer ? (
        <div className="account-layout">
          <form onSubmit={submit}>
            <div className="account-tabs">
              <button
                type="button"
                aria-pressed={mode === "login"}
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
              <button
                type="button"
                aria-pressed={mode === "register"}
                onClick={() => setMode("register")}
              >
                Create account
              </button>
            </div>
            {mode === "register" && (
              <label>
                Your name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            {mode !== "reset" && (
              <label>
                Password
                <input
                  type="password"
                  minLength={mode === "register" ? 12 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                />
              </label>
            )}
            <button className="primary block" disabled={working}>
              {working
                ? "One moment…"
                : mode === "login"
                  ? "Sign in"
                  : mode === "register"
                    ? "Create account"
                    : "Send reset link"}
              <ArrowRight size={17} />
            </button>
            <button
              className="text-link"
              type="button"
              onClick={() => setMode(mode === "reset" ? "login" : "reset")}
            >
              {mode === "reset" ? "Back to sign in" : "Forgot your password?"}
            </button>
          </form>
        </div>
      ) : (
        <div className="account-dashboard">
          <nav>
            <Link to="/wishlist/">
              <Heart size={17} /> Your wishlist
            </Link>
            <Link to="/track-order/">
              <Truck size={17} /> Track an order
            </Link>
            <button
              className="text-link"
              onClick={() => logout().catch((e) => setMessage(e.message))}
            >
              Sign out
            </button>
          </nav>
          <section>
            <h2>Your orders</h2>
            {orders.length ? (
              orders.map((o) => <OrderView key={o.id} order={o} />)
            ) : (
              <p>No orders to show yet.</p>
            )}
            <h2>Your billing address</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setWorking(true);
                try {
                  await api<Customer>("address", { billing: address });
                  setMessage("Address saved.");
                } catch (e) {
                  setMessage((e as Error).message);
                } finally {
                  setWorking(false);
                }
              }}
            >
              <AddressFields address={address} setAddress={setAddress} />
              <button className="primary" disabled={working}>
                Save address
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
function OrderView({ order: o }: { order: Order }) {
  return (
    <article className="order-card">
      <div>
        <h3>Order #{o.id}</h3>
        <span>
          {o.status.replaceAll("-", " ")} · {o.date?.slice(0, 10)}
        </span>
      </div>
      <p>{o.items.map((i) => `${i.name} × ${i.quantity}`).join(" · ")}</p>
      <strong>₹{Number(o.total).toLocaleString("en-IN")}</strong>
      {o.tracking_url && (
        <a
          className="text-link"
          href={o.tracking_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Track shipment <ArrowUpRight size={16} />
        </a>
      )}
    </article>
  );
}
function Tracking() {
  const [id, setId] = useState(""),
    [key, setKey] = useState(""),
    [order, setOrder] = useState<Order | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useTitle("Track your order");
  return (
    <div className="wrap page narrow">
      <div className="collection-intro commerce-intro">
        <h1>Track your order</h1>
        <p>
          Use your order number and the order key from your confirmation link,
          or find your orders in your account.
        </p>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setOrder(null);
          try {
            setOrder(await api<Order>("track", { id: Number(id), key }));
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Order number
          <input
            required
            type="number"
            min="1"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </label>
        <label>
          Order key
          <input
            required
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
          />
        </label>
        <button className="primary" disabled={busy}>
          {busy ? "Checking…" : "Find my order"}
          <ArrowRight size={17} />
        </button>
      </form>
      {error && <ErrorBox message={error} />}
      <Link className="text-link" to="/account/">
        Find orders in your account
      </Link>
      {order && <OrderView order={order} />}
    </div>
  );
}
function Confirmation() {
  const [params] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null),
    [error, setError] = useState("");
  useTitle("Order confirmation");
  useEffect(() => {
    api<Order>("track", {
      id: Number(params.get("order")),
      key: params.get("key"),
    })
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div className="wrap page narrow">
      <div className="collection-intro">
        <Check className="confirmation-check" />
        <h1>
          {order?.status === "processing" || order?.status === "completed"
            ? "Thank you. It’s yours."
            : "Your order details"}
        </h1>
        <p>
          {order
            ? "Check the order status below for payment and fulfilment progress."
            : "Verifying your order…"}
        </p>
      </div>
      {error && <ErrorBox message={error} />}{" "}
      {order && <OrderView order={order} />}
      <Link className="primary" to="/shop/">
        Continue exploring <ArrowRight size={17} />
      </Link>
    </div>
  );
}
function Contact() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useTitle("Contact the boutique");
  return (
    <div className="wrap page">
      <div className="collection-intro commerce-intro">
        <h1>Contact the boutique</h1>
      </div>
      <div className="contact-grid">
        <div>
          <h2>Come say hello.</h2>
          <p>
            No.3, Pushpahasa, 3rd Cross,
            <br />
            Sumukha Layout, near Abbaiahnaidu Studio,
            <br />
            Chikkalsandra, Bengaluru - 560061.
          </p>
          <a href="mailto:saalankruta@gmail.com">saalankruta@gmail.com</a>
          <p>
            For fit, styling, delivery or an order question, our boutique is
            here to help.
          </p>
          <WhatsApp />
          <a
            className="text-link"
            href="https://www.google.com/maps/search/?api=1&query=Pushpahasa+Sumukha+Layout+Chikkalsandra+Bengaluru"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find the boutique <ArrowUpRight size={16} />
          </a>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = Object.fromEntries(new FormData(form));
            setBusy(true);
            try {
              await api("contact", data);
              setMessage(
                "Your message has been sent. Thank you for getting in touch.",
              );
              form.reset();
            } catch (e) {
              setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Your name
            <input name="name" required maxLength={100} />
          </label>
          <label>
            Email
            <input type="email" name="email" required />
          </label>
          <label>
            How can we help?
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={5000}
              rows={5}
            />
          </label>
          <input
            className="honeypot"
            name="website"
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
          />
          <button className="primary" disabled={busy}>
            {busy ? "Sending…" : "Send a note"}
            <ArrowRight size={17} />
          </button>
          {message && <p role="status">{message}</p>}
        </form>
      </div>
    </div>
  );
}
function WhatsApp() {
  const [number, setNumber] = useState("");
  useEffect(() => {
    fetch("/store-config.json")
      .then((r) => r.json())
      .then((c) => {
        if (/^91\d{10}$/.test(c.whatsapp || "")) setNumber(c.whatsapp);
      })
      .catch(() => {});
  }, []);
  return number ? (
    <a
      className="text-link"
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Chat on WhatsApp <ArrowUpRight size={16} />
    </a>
  ) : (
    <a className="text-link" href="mailto:saalankruta@gmail.com">
      Ask the boutique <Mail size={16} />
    </a>
  );
}
function About() {
  useTitle("Our story");
  return (
    <div className="wrap page">
      <div className="collection-intro">
        <span className="eyebrow">SAALANKRUTA · BENGALURU</span>
        <h1>
          Every woman’s dream.
          <br />
          <em>Every piece, personal.</em>
        </h1>
      </div>
      <div className="about-grid">
        <img
          src="/brand-emblem.png"
          alt="Saalankruta crest — Every Woman's Dream"
          width="2000"
          height="2000"
          loading="lazy"
        />
        <div>
          <h2>
            A place for tradition
            <br />
            and your own expression.
          </h2>
          <p>
            Saalankruta is a Bengaluru boutique for traditional jewellery,
            bridal sets and gifts. Our collection brings together necklaces,
            haras, bangles, earrings and the little finishing touches that make
            an outfit your own.
          </p>
          <p>
            Whether you’re dressing for a celebration or choosing something for
            every day, explore at your own pace. For questions about a piece,
            speak directly with the boutique.
          </p>
          <Link className="primary" to="/shop/">
            Discover the collection <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
}
function Policy({ slug }: { slug: string }) {
  const title = policyLinks.find((p) => p.slug === slug)?.name || "Information";
  const [content, setContent] = useState<{
    published: boolean;
    sections: { title: string; body: string }[];
  } | null>(null);
  useTitle(title);
  useEffect(() => {
    fetch("/policies.json")
      .then((r) => r.json())
      .then((p) => setContent(p[slug!]))
      .catch(() => setContent(null));
  }, [slug]);
  return (
    <div className="wrap page narrow">
      <div className="collection-intro">
        <span className="eyebrow">CUSTOMER CARE</span>
        <h1>{title}</h1>
      </div>
      {content?.published ? (
        content.sections.map((s, i) => (
          <section className="policy-section" key={i}>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </section>
        ))
      ) : (
        <>
          <p className="service-note">
            The boutique is finalising this information before online ordering
            opens.
          </p>
          <p>
            Please contact Saalankruta for the current details applicable to
            your purchase.
          </p>
          <Link className="primary" to="/contact/">
            Contact the boutique <ArrowRight size={17} />
          </Link>
        </>
      )}
    </div>
  );
}
function NotFound() {
  useTitle("Page not found");
  return (
    <div className="wrap page">
      <Empty
        title="A different path to something lovely."
        message="We couldn’t find that page. Explore the collection or search for your piece."
        to="/shop/"
        action="Explore the collection"
      />
    </div>
  );
}
function LegacyRedirect() {
  const { products } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("p");
    if (id && products.length) {
      const p = products.find((p) => p.id === Number(id));
      navigate(p ? `/product/${p.slug}/` : "/not-found/", { replace: true });
    }
  }, [products, location.search]);
  return null;
}
export default function App() {
  const { notice, setNotice } = useStore();
  const location = useLocation();
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document
          .querySelectorAll<HTMLDialogElement>("dialog[open]")
          .forEach((d) =>
            d
              .querySelector<HTMLButtonElement>('button[aria-label^="Close"]')
              ?.click(),
          );
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollReset />
      <LegacyRedirect />
      <Header />
      <main id="main" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop/" element={<Collection />} />
          <Route path="/product-category/:slug/*" element={<Collection />} />
          <Route path="/product/:slug/" element={<ProductPage />} />
          <Route path="/wishlist/" element={<Wishlist />} />
          <Route path="/cart/" element={<CartPage />} />
          <Route path="/checkout/" element={<Checkout />} />
          <Route path="/account/" element={<Account />} />
          <Route path="/reset-password/" element={<ResetPassword />} />
          <Route path="/my-account/*" element={<Account />} />
          <Route path="/track-order/" element={<Tracking />} />
          <Route path="/order-confirmation/" element={<Confirmation />} />
          <Route path="/contact/" element={<Contact />} />
          <Route path="/about/" element={<About />} />
          {policyLinks.map((p) => (
            <Route
              key={p.slug}
              path={`/${p.slug}/`}
              element={<Policy slug={p.slug} />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
