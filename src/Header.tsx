import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { menu } from "./catalogue";
import { useStore } from "./store";
import Modal from "./Modal";
import GlassEdge from "./effects/GlassEdge";
const policies = [
  { name: "Privacy Policy", slug: "privacy-policy" },
  { name: "Terms and Conditions", slug: "terms-and-conditions" },
  { name: "Cancellation and Refund", slug: "cancellation-and-refund" },
  { name: "Shipping and Delivery", slug: "shipping-and-delivery" },
];
const path = (slug: string) => `/product-category/${slug}/`;
export default function Header() {
  const { cart, wishlist, customer } = useStore();
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState(false),
    [dropdown, setDropdown] = useState("");
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    setSearch(false);
    setDropdown("");
  }, [location.pathname]);
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  return (
    <>
      <div className="announcement">
        Jewellery for your everyday and extraordinary.
      </div>
      <header
        className="header"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDropdown("");
            setSearch(false);
          }
        }}
      >
        <GlassEdge />
        <div className="header-main">
          <button
            className="icon-button mobile-only"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <Link className="wordmark" to="/" aria-label="Saalankruta home">
            <img
              src="/logo.png"
              width="175"
              height="58"
              alt="Saalankruta. Every woman's dream"
            />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/" end>
              Home
            </NavLink>
            {menu.map((item) => (
              <div
                className="nav-group"
                key={item.slug}
                data-open={dropdown === item.slug}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget))
                    setDropdown("");
                }}
              >
                <NavLink to={path(item.slug)}>{item.name}</NavLink>
                {item.children.length > 0 && (
                  <>
                    <button
                      className="nav-disclosure"
                      aria-label={`Show ${item.name} categories`}
                      aria-expanded={dropdown === item.slug}
                      aria-controls={`menu-${item.slug}`}
                      onClick={() =>
                        setDropdown(dropdown === item.slug ? "" : item.slug)
                      }
                    >
                      <ChevronDown size={12} />
                    </button>
                    <div className="submenu" id={`menu-${item.slug}`}>
                      {item.children.map((child) => (
                        <Link to={path(child.slug)} key={child.slug}>
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div
              className="nav-group"
              data-open={dropdown === "contact"}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setDropdown("");
              }}
            >
              <Link to="/contact/">Contact Us</Link>
              <button
                className="nav-disclosure"
                aria-label="Show customer care pages"
                aria-expanded={dropdown === "contact"}
                aria-controls="menu-contact"
                onClick={() =>
                  setDropdown(dropdown === "contact" ? "" : "contact")
                }
              >
                <ChevronDown size={12} />
              </button>
              <div className="submenu" id="menu-contact">
                {policies.map((p) => (
                  <Link key={p.slug} to={`/${p.slug}/`}>
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Search products"
              aria-expanded={search}
              onClick={() => setSearch(!search)}
            >
              {search ? <X /> : <Search />}
            </button>
            <Link
              className="icon-button desktop-only"
              to="/wishlist/"
              aria-label={`Wishlist, ${wishlist.length} items`}
            >
              <Heart />
              {wishlist.length > 0 && <sup>{wishlist.length}</sup>}
            </Link>
            <Link
              className="icon-button desktop-only"
              to="/account/"
              aria-label={customer ? "Your account" : "Sign in"}
            >
              <UserRound />
            </Link>
            <Link
              className="icon-button"
              to="/cart/"
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag />
              {count > 0 && <sup>{count}</sup>}
            </Link>
          </div>
        </div>
        {search && (
          <form className="search-bar" action="/shop/">
            <input
              name="q"
              autoFocus
              placeholder="Search jewellery & gifts"
              aria-label="Search jewellery"
            />
            <button className="primary">Search</button>
          </form>
        )}
      </header>
      {open && (
        <Modal
          label="Navigation"
          className="drawer"
          close={() => setOpen(false)}
        >
          <div className="drawer-top">
            <img src="/logo.png" alt="Saalankruta" />
            <button
              className="icon-button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X />
            </button>
          </div>
          <nav aria-label="Mobile navigation">
            <Link to="/">Home</Link>
            {menu.map((item) => (
              <div key={item.slug}>
                <Link to={path(item.slug)}>
                  {item.name}
                  <ArrowUpRight size={16} />
                </Link>
                {item.children.map((child) => (
                  <Link className="sub" to={path(child.slug)} key={child.slug}>
                    {child.name}
                  </Link>
                ))}
              </div>
            ))}
            <div>
              <Link to="/contact/">Contact Us</Link>
              {policies.map((p) => (
                <Link className="sub" to={`/${p.slug}/`} key={p.slug}>
                  {p.name}
                </Link>
              ))}
            </div>
            <Link to="/account/">Your account</Link>
            <Link to="/wishlist/">Your wishlist</Link>
          </nav>
        </Modal>
      )}
    </>
  );
}
