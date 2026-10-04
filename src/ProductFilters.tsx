import { useState } from "react";
import { X } from "lucide-react";
import Modal from "./Modal";
import type { Category } from "./types";
import { text } from "./catalogue";
export default function ProductFilters({
  categories,
  slug,
  params,
  apply,
  close,
}: {
  categories: Category[];
  slug?: string;
  params: URLSearchParams;
  apply: (values: {
    category: string;
    q: string;
    min: string;
    max: string;
    stock: string;
  }) => void;
  close: () => void;
}) {
  const [draft, setDraft] = useState({
    category: slug || "",
    q: params.get("q") || "",
    min: params.get("min") || "",
    max: params.get("max") || "",
    stock: params.get("stock") || "",
  });
  const update = (key: string, value: string) =>
    setDraft((previous) => ({ ...previous, [key]: value }));
  return (
    <Modal className="filter-drawer" label="Product filters" close={close}>
      <div className="drawer-top">
        <h2>Find your piece</h2>
        <button
          className="icon-button"
          aria-label="Close product filters"
          onClick={close}
        >
          <X />
        </button>
      </div>
      <label>
        Collection
        <select
          value={draft.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All jewellery & gifts</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {text(c.name)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Search
        <input
          value={draft.q}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Name, colour, style"
        />
      </label>
      <div className="form-grid">
        <label>
          Minimum price ₹
          <input
            type="number"
            min="0"
            value={draft.min}
            onChange={(e) => update("min", e.target.value)}
            placeholder="Any price"
          />
        </label>
        <label>
          Maximum price ₹
          <input
            type="number"
            min="0"
            value={draft.max}
            onChange={(e) => update("max", e.target.value)}
            placeholder="Any price"
          />
        </label>
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={draft.stock === "yes"}
          onChange={(e) => update("stock", e.target.checked ? "yes" : "")}
        />{" "}
        In stock only
      </label>
      <div className="filter-actions">
        <button
          className="text-link"
          onClick={() =>
            setDraft({
              category: slug || "",
              q: "",
              min: "",
              max: "",
              stock: "",
            })
          }
        >
          Clear filters
        </button>
        <button className="primary" onClick={() => apply(draft)}>
          Show results
        </button>
      </div>
    </Modal>
  );
}
