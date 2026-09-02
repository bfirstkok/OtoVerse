import React, { Suspense, useEffect } from "react";
import PageLoader from "@/components/system/PageLoader";
import "@/styles/public-system.css";

const OtoVerseExperience = React.lazy(() => import("../../anime_op_quiz_starter"));

export default function PublicApp() {
  useEffect(() => {
    document.documentElement.classList.remove("admin-theme");
    document.body.classList.remove("admin-theme");
    if (!document.title || document.title.includes("Admin Panel")) document.title = "OtoVerse";
  }, []);

  return (
    <div className="otoverse-public">
      <Suspense fallback={<PageLoader label="กำลังเตรียมเกมและคลังอนิเมะ…" />}>
        <OtoVerseExperience />
      </Suspense>
    </div>
  );
}
