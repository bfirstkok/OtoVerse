import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AppErrorBoundary from "@/components/system/AppErrorBoundary";
import "./index.css";

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("OtoVerse root element was not found");
}

window.addEventListener("unhandledrejection", (event) => {
  console.error("[OtoVerse unhandled promise]", event?.reason || event);
});

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
