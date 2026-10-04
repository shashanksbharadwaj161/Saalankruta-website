import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import { StoreProvider } from "../src/StoreProvider";
import type { Product, Category } from "../src/types";
export function render(
  path: string,
  products: Product[],
  categories: Category[],
) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider initial={{ products, categories }}>
        <App />
      </StoreProvider>
    </MemoryRouter>,
  );
}
