import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");

function showFatalError(err, source) {
  try {
    // eslint-disable-next-line no-console
    console.error("[fatal]", source, err);
  } catch {
    // ignore
  }

  if (!rootEl) return;

  const wrap = document.createElement("div");
  wrap.className = "min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-50";

  const card = document.createElement("div");
  card.className = "w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900/60 p-6";

  const title = document.createElement("div");
  title.className = "text-xl font-extrabold";
  title.textContent = "เกิดข้อผิดพลาดตอนโหลดหน้าเว็บ";

  const hint = document.createElement("div");
  hint.className = "mt-2 text-sm text-slate-200/80";
  hint.textContent = "กรุณาแคปหน้าจอนี้ส่งให้ผู้พัฒนา (หรือเปิด DevTools > Console)";

  const pre = document.createElement("pre");
  pre.className = "mt-4 whitespace-pre-wrap break-words text-xs rounded-2xl bg-black/40 border border-slate-700 p-4 overflow-auto max-h-[50vh]";
  const msg = err && typeof err === "object"
    ? String(err.message || err.toString?.() || err)
    : String(err || "unknown_error");
  const stack = err && typeof err === "object" ? String(err.stack || "") : "";
  pre.textContent = `[${String(source || "unknown")}]: ${msg}${stack ? `\n\n${stack}` : ""}`;

  card.appendChild(title);
  card.appendChild(hint);
  card.appendChild(pre);
  wrap.appendChild(card);

  try {
    rootEl.replaceChildren(wrap);
  } catch {
    rootEl.innerHTML = "";
    rootEl.appendChild(wrap);
  }
}

window.addEventListener("error", (e) => {
  showFatalError(e?.error || e?.message || e, "window.onerror");
});

window.addEventListener("unhandledrejection", (e) => {
  showFatalError(e?.reason || e, "unhandledrejection");
});

try {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  showFatalError(e, "render");
}
