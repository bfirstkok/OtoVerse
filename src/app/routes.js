export function normalizePathname(pathname = window.location.pathname) {
  const normalized = String(pathname || "/").replace(/\/+$/, "");
  return normalized || "/";
}

export function resolveAppArea(pathname = window.location.pathname) {
  const path = normalizePathname(pathname);
  return path === "/admin" || path.startsWith("/admin/") ? "admin" : "public";
}

export function resolveAdminPage(pathname = window.location.pathname) {
  const path = normalizePathname(pathname);
  if (path === "/admin/login") return "login";
  return "dashboard";
}
