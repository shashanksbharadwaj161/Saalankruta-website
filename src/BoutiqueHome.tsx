import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { asset } from "./assets";
import { filterProducts, inCategory, text } from "./catalogue";
import { useStore } from "./store";
import NecklaceStory from "./NecklaceStory";
import ProductCard from "./ProductCard";

const collections = [
  {
    slug: "necklace",
    name: "Necklaces",
    note: "A beautiful beginning.",
    description: "From a quiet shimmer to a statement that is entirely you.",
  },
  {
    slug: "bangles",
    name: "Bangles",
    note: "Made for your everyday.",
    description: "Wear one. Stack a few. Find a rhythm of your own.",
  },
  {
    slug: "earrings",
    name: "Earrings",
    note: "Small details. All the difference.",
    description: "Studs, drops and occasion pieces to finish your look.",
  },
  {
    slug: "bridal-set",
    name: "Bridal & sets",
    note: "For the moments you keep.",
    description:
      "Traditional sets for celebrations, ceremonies and your wedding day.",
  },
  {
    slug: "gift-items",
    name: "Gifts",
    note: "A little thought, beautifully given.",
    description: "Discover decorative pieces and gifts for someone special.",
  },
];

export default function BoutiqueHome({
  motionPaused,
  setMotionPaused,
}: {
  motionPaused: boolean;
  setMotionPaused: (paused: boolean) => void;
}) {
  const { products, categories, loading, catalogueError } = useStore();
  const [mobile, setMobile] = useState(false);
  const [collection, setCollection] = useState("necklace");
  const [edit, setEdit] = useState("necklace");
  const root = useRef<HTMLDivElement>(null);
  const selected = collections.find((c) => c.slug === collection)!;
  const selection = filterProducts(products, categories, { slug: collection });
  const featured =
    selection.find((p) => p.images.length && p.is_in_stock) || selection[0];
  const edited = filterProducts(products, categories, { slug: edit }).slice(
    0,
    4,
  );
  const bridal = products.find(
    (p) => inCategory(p, "bridal-set", categories) && p.images.length,
  );
  useEffect(() => {
    document.title = "Saalankruta — Jewellery for your every occasion";
  }, []);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (
      motionPaused ||
      !root.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          gsap.utils
            .toArray<HTMLElement>(".boutique-reveal")
            .forEach((element) => {
              gsap.fromTo(
                element,
                { y: 28, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.85,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: element,
                    start: "top 94%",
                    once: true,
                  },
                },
              );
            });
          gsap.fromTo(
            ".boutique-occasion__photo img",
            { yPercent: -3 },
            {
              yPercent: 3,
              ease: "none",
              scrollTrigger: {
                trigger: ".boutique-occasion",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
              },
            },
          );
        }, root);
        cleanup = () => context.revert();
      },
    );
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [motionPaused]);

  return (
    <div className="boutique-home" ref={root}>
      <NecklaceStory paused={motionPaused} onPauseChange={setMotionPaused} />
      <div className="boutique-welcome" aria-label="Boutique services">
        <span>
          <MapPin size={17} /> From Bengaluru, across India
        </span>
        <Link to="/wishlist/">
          <Heart size={17} /> Keep the pieces you love
        </Link>
        <Link to="/contact/">
          <MessageCircle size={17} /> A little help choosing
        </Link>
      </div>

      <section
        className="boutique-discovery wrap"
        aria-labelledby="discovery-title"
      >
        <div className="boutique-discovery__intro boutique-reveal">
          <h2 id="discovery-title">
            What catches <br />
            <em>your eye?</em>
          </h2>
          <p>A world of detail. Find your own way in.</p>
        </div>
        <div className="boutique-discovery__stage boutique-reveal">
          <div
            className="boutique-collection-tabs"
            role="tablist"
            aria-label="Discover collections"
            aria-orientation={mobile ? "horizontal" : "vertical"}
          >
            {collections.map((item, index) => (
              <button
                key={item.slug}
                role="tab"
                id={`collection-tab-${item.slug}`}
                aria-controls="collection-panel"
                aria-selected={collection === item.slug}
                tabIndex={collection === item.slug ? 0 : -1}
                onClick={() => setCollection(item.slug)}
                onKeyDown={(event) => {
                  const direction = ["ArrowDown", "ArrowRight"].includes(
                    event.key,
                  )
                    ? 1
                    : ["ArrowUp", "ArrowLeft"].includes(event.key)
                      ? -1
                      : 0;
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? collections.length - 1
                        : direction
                          ? (index + direction + collections.length) %
                            collections.length
                          : -1;
                  if (next < 0) return;
                  event.preventDefault();
                  setCollection(collections[next].slug);
                  document
                    .getElementById(`collection-tab-${collections[next].slug}`)
                    ?.focus();
                }}
              >
                <span>{item.name}</span>
                <ArrowUpRight size={23} />
              </button>
            ))}
          </div>
          <div
            id="collection-panel"
            role="tabpanel"
            aria-labelledby={`collection-tab-${collection}`}
            className="boutique-collection-panel"
            tabIndex={0}
          >
            <Link
              className="boutique-collection-photo"
              to={`/product-category/${collection}/`}
              aria-label={`Shop ${selected.name}`}
            >
              <img
                key={featured?.id || collection}
                src={
                  featured?.images[0]?.src || asset("/product-placeholder.svg")
                }
                alt={featured ? text(featured.name) : selected.name}
                loading="lazy"
                decoding="async"
                width="700"
                height="760"
              />
              <span className="boutique-round-link" aria-hidden="true">
                <ArrowUpRight size={24} />
              </span>
            </Link>
            <div className="boutique-collection-caption">
              <h3>{selected.note}</h3>
              <p>{selected.description}</p>
              <Link
                className="text-link"
                to={`/product-category/${collection}/`}
              >
                Explore {selected.name.toLowerCase()} <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
        <Link className="boutique-all-link" to="/shop/">
          Explore all jewellery & gifts <ArrowRight size={20} />
        </Link>
      </section>

      <section
        className="boutique-edit"
        id="necklace-collection"
        aria-labelledby="edit-title"
      >
        <div className="wrap">
          <div className="boutique-edit__heading boutique-reveal">
            <h2 id="edit-title">
              The boutique <em>edit.</em>
            </h2>
            <p>Pieces to make a look your own.</p>
          </div>
          <div className="boutique-edit__controls">
            <div
              className="boutique-pills"
              aria-label="Choose a jewellery edit"
            >
              {collections.slice(0, 3).map((c) => (
                <button
                  key={c.slug}
                  aria-pressed={edit === c.slug}
                  onClick={() => setEdit(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <Link className="text-link" to={`/product-category/${edit}/`}>
              View collection <ArrowUpRight size={18} />
            </Link>
          </div>
          {loading && !edited.length ? (
            <p role="status">Finding your pieces…</p>
          ) : edited.length ? (
            <div className="product-grid boutique-product-grid" key={edit}>
              {edited.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="boutique-edit-empty" role="status">
              <p>
                {catalogueError
                  ? "The collection could not be loaded. Please try again shortly."
                  : "There are no pieces in this edit at the moment."}
              </p>
              <Link className="text-link" to="/shop/">
                Explore all pieces <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {bridal && (
        <section className="boutique-occasion" aria-labelledby="occasion-title">
          <div className="boutique-occasion__copy boutique-reveal">
            <img
              className="boutique-occasion__crest"
              src={asset("/brand-emblem-transparent.png")}
              alt=""
              width="140"
              height="140"
              loading="lazy"
            />
            <span className="boutique-kicker">The occasion collection</span>
            <h2 id="occasion-title">
              Some days
              <br />
              deserve <br />
              <em>everything.</em>
            </h2>
            <p>
              A wedding. A celebration. A moment that is yours. Discover
              traditional jewellery to meet it.
            </p>
            <Link className="primary" to="/product-category/bridal-set/">
              Explore bridal & sets <ArrowUpRight size={19} />
            </Link>
          </div>
          <Link
            className="boutique-occasion__photo"
            to={`/product/${bridal.slug}/`}
            aria-label={`Discover ${text(bridal.name)}`}
          >
            <img
              src={bridal.images[0].src}
              alt={text(bridal.name)}
              loading="lazy"
              decoding="async"
              width="800"
              height="1000"
            />
            <span>
              Discover the piece <ArrowUpRight size={19} />
            </span>
          </Link>
        </section>
      )}

      <section
        className="boutique-note wrap boutique-reveal"
        aria-labelledby="boutique-note-title"
      >
        <span className="boutique-note__line" aria-hidden="true" />
        <h2 id="boutique-note-title">
          Beautiful things.
          <br />
          <em>A personal touch.</em>
        </h2>
        <p>
          Explore online, or find us in Bengaluru. We’re here to help you choose
          something that feels like you.
        </p>
        <div>
          <Link className="primary" to="/contact/">
            Meet the boutique <ArrowUpRight size={18} />
          </Link>
          <Link className="text-link" to="/about/">
            Our story <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
