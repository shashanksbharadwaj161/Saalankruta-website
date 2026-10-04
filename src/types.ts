export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  image?: { src: string } | null;
}
export interface Product {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string;
  short_description: string;
  is_in_stock: boolean;
  is_purchasable: boolean;
  has_options: boolean;
  on_sale: boolean;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_minor_unit: number;
    currency_code: string;
  };
  images: { id: number; src: string; thumbnail: string; alt: string }[];
  categories: { id: number; name: string; slug: string }[];
  attributes: {
    id: number;
    name: string;
    taxonomy: string;
    has_variations: boolean;
    terms: { id: number; name: string; slug: string }[];
  }[];
  variations: { id: number; attributes: { name: string; value: string }[] }[];
  add_to_cart?: { minimum: number; maximum: number; multiple_of: number };
}
export interface Address {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}
export interface Customer {
  id: number;
  name: string;
  email: string;
  billing: Address;
  shipping: Address;
  wishlist: number[];
}
export interface Cart {
  items: {
    key: string;
    id: number;
    name: string;
    quantity: number;
    images: Product["images"];
    prices: Product["prices"];
    totals: { line_total: string };
    quantity_limits: { minimum: number; maximum: number };
  }[];
  totals: {
    total_items: string;
    total_shipping: string;
    total_discount: string;
    total_tax: string;
    total_price: string;
    currency_minor_unit: number;
  };
  coupons: { code: string }[];
  shipping_rates: {
    package_id: number;
    shipping_rates: {
      rate_id: string;
      name: string;
      price: string;
      selected: boolean;
    }[];
  }[];
  needs_shipping: boolean;
  has_calculated_shipping: boolean;
  payment_methods: string[];
}
export interface Order {
  id: number;
  status: string;
  date: string;
  total: string;
  tracking_url: string;
  items: { name: string; quantity: number }[];
}
