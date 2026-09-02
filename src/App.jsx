import React, { Suspense } from "react";
import PageLoader from "@/components/system/PageLoader";
import { resolveAppArea } from "@/app/routes";

const PublicApp = React.lazy(() => import("@/app/PublicApp"));
const AdminApp = React.lazy(() => import("@/app/AdminApp"));

export default function App() {
  const area = resolveAppArea();

  return (
    <Suspense fallback={<PageLoader dark={area === "admin"} label={area === "admin" ? "กำลังเปิดระบบจัดการ…" : "กำลังเปิด OtoVerse…"} />}>
      {area === "admin" ? <AdminApp /> : <PublicApp />}
    </Suspense>
  );
}
