import { Heart, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { asset } from "./assets";
import { price, productPrice, text } from "./catalogue";
import { useStore } from "./store";
import type { Product } from "./types";

export default function ProductCard({ product: p }: { product: Product }) {
  const { wishlist, toggleWish } = useStore();
  const saved = wishlist.includes(p.id);
  const image = p.images[0];
  return (
    <article className="jewel-card">
      <div className="jewel-card__visual">
        <Link
          to={`/product/${p.slug}/`}
          className="jewel-card__image"
          aria-label={`View ${text(p.name)}`}
        >
          <img
            src={image?.src || asset("/product-placeholder.svg")}
            srcSet={image?.srcset}
            sizes="(max-width: 767px) 46vw, (max-width: 1050px) 30vw, (max-width: 1760px) 23vw, 390px"
            alt={image?.alt || text(p.name)}
            loading="lazy"
            decoding="async"
            width="600"
            height="750"
          />
          {p.images[1] && (
            <img
              className="jewel-card__alternate"
              src={p.images[1].src}
              srcSet={p.images[1].srcset}
              sizes="(max-width: 767px) 46vw, 23vw"
              alt=""
              loading="lazy"
              decoding="async"
              width="600"
              height="750"
            />
          )}
          <span className="jewel-card__view">
            Discover the piece <ArrowUpRight size={17} />
          </span>
        </Link>
        <button
          className={`jewel-card__wish ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Remove" : "Add"} ${text(p.name)} ${saved ? "from" : "to"} wishlist`}
          aria-pressed={saved}
          onClick={() => void toggleWish(p.id)}
        >
          <Heart size={19} />
        </button>
        {!p.is_in_stock && <span className="jewel-card__status">Sold out</span>}
      </div>
      <div className="jewel-card__details">
        <span className="jewel-card__category">
          {text(p.categories[0]?.name || "Jewellery")}
        </span>
        <Link to={`/product/${p.slug}/`}>
          <h3>{text(p.name)}</h3>
        </Link>
        <p className="jewel-card__price">
          {productPrice(p)}
          {p.on_sale && (
            <del>
              {price(p.prices.regular_price, p.prices.currency_minor_unit)}
            </del>
          )}
        </p>
      </div>
    </article>
  );
}
