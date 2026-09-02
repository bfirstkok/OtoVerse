import React, { useLayoutEffect } from "react";
import AdminDashboard from "@/admin/AdminDashboard";
import AdminLogin from "@/admin/AdminLogin";
import { resolveAdminPage } from "./routes";

export default function AdminApp() {
  const page = resolveAdminPage();

  useLayoutEffect(() => {
    document.documentElement.classList.add("dark", "admin-theme");
    document.body.classList.add("dark", "admin-theme");
    document.documentElement.style.colorScheme = "dark";
    document.title = page === "login" ? "Admin Login | OtoVerse" : "Admin Panel | OtoVerse";

    return () => {
      document.documentElement.classList.remove("dark", "admin-theme");
      document.body.classList.remove("dark", "admin-theme");
      document.documentElement.style.colorScheme = "";
    };
  }, [page]);

  return <div className="admin-theme min-h-screen bg-[#080b14] text-slate-100">{page === "login" ? <AdminLogin /> : <AdminDashboard />}</div>;
}
