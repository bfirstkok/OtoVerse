import React, { Suspense, useEffect } from "react";
import PageLoader from "@/components/system/PageLoader";

const OtoVerseExperience = React.lazy(() => import("../../anime_op_quiz_starter"));

export default function PublicApp() {
  useEffect(() => {
    document.documentElement.classList.remove("admin-theme");
    document.body.classList.remove("admin-theme");
    if (!document.title || document.title.includes("Admin Panel")) document.title = "OtoVerse";
  }, []);

  return (
    <Suspense fallback={<PageLoader label="กำลังเตรียมเกมและคลังอนิเมะ…" />}>
      <OtoVerseExperience />
    </Suspense>
  );
}
