import React from "react";
import AnimeOPQuizStarter from "../anime_op_quiz_starter";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLogin from "./admin/AdminLogin";

function AdminTheme({ children }) {
  React.useLayoutEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
    document.title = "Admin Panel | OtoVerse";

    const adminUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.pushState({ otoverseAdminGuard: true }, "", adminUrl);
    const keepAdminOpen = () => {
      window.history.pushState({ otoverseAdminGuard: true }, "", adminUrl);
    };
    window.addEventListener("popstate", keepAdminOpen);

    return () => window.removeEventListener("popstate", keepAdminOpen);
  }, []);

  return <div className="admin-theme dark min-h-screen bg-slate-950 text-slate-100">{children}</div>;
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/admin/login") return <AdminTheme><AdminLogin /></AdminTheme>;
  if (path === "/admin" || path === "/admin/dashboard") {
    return <AdminTheme><AdminDashboard /></AdminTheme>;
  }
  return <AnimeOPQuizStarter />;
}
