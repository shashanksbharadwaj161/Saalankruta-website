import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { asset } from "./assets";

export default function BoutiqueFooter() {
  return (
    <footer className="boutique-footer">
      <div className="wrap boutique-footer__grid">
        <div className="boutique-footer__brand">
          <Link to="/" aria-label="Saalankruta home">
            <img
              src={asset("/brand-emblem-transparent.png")}
              alt="Saalankruta — Every woman's dream"
              width="180"
              height="180"
              loading="lazy"
            />
          </Link>
          <p>
            Jewellery for your every occasion.
            <br />
            From our boutique in Bengaluru.
          </p>
        </div>
        <nav aria-label="Footer collections">
          <h2>The collections</h2>
          <Link to="/product-category/necklace/">Necklaces</Link>
          <Link to="/product-category/bangles/">Bangles</Link>
          <Link to="/product-category/earrings/">Earrings</Link>
          <Link to="/product-category/bridal-set/">Bridal & sets</Link>
          <Link to="/product-category/gift-items/">Gifts</Link>
          <Link to="/shop/">
            Explore everything <ArrowUpRight size={15} />
          </Link>
        </nav>
        <nav aria-label="Customer care">
          <h2>Here for you</h2>
          <Link to="/account/">Your account</Link>
          <Link to="/wishlist/">Your wishlist</Link>
          <Link to="/track-order/">Track your order</Link>
          <Link to="/shipping-and-delivery/">Shipping & delivery</Link>
          <Link to="/cancellation-and-refund/">Returns & cancellations</Link>
          <Link to="/contact/">Contact us</Link>
        </nav>
        <div className="boutique-footer__visit">
          <h2>Come say hello.</h2>
          <p>
            No.3, Pushpahasa, 3rd Cross,
            <br />
            Sumukha Layout, Chikkalsandra,
            <br />
            Bengaluru – 560061
          </p>
          <a href="mailto:saalankruta@gmail.com">saalankruta@gmail.com</a>
          <Link to="/contact/">
            Visit the boutique <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="wrap boutique-footer__bottom">
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
