import { asset } from "./assets";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StoreProvider } from "./store";
import App from "./App";
import "./style.css";
import "./fonts.css";
import "./royal.css";
import "./studio.css";
import "./motion.css";
import "./navigation.css";
async function mountStorefront() {
  const initial = await Promise.all([
    fetch(asset("/catalogue.json")).then((r) => r.json()),
    fetch(asset("/categories.json")).then((r) => r.json()),
  ])
    .then(([products, categories]) => ({ products, categories }))
    .catch(() => undefined);
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <StoreProvider initial={initial}>
          <App />
        </StoreProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}
void mountStorefront();
