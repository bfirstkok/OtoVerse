import React, { Suspense, useEffect, useState } from "react";
import PageLoader from "@/components/system/PageLoader";
import WebMascot from "@/components/system/WebMascot";
import "@/styles/public-system.css";

const AnimeNews = React.lazy(() => import("@/components/system/AnimeNews"));

const OtoVerseExperience = React.lazy(() => import("../../anime_op_quiz_starter"));

export default function PublicApp() {
  const [newsEntry] = useState(() => window.location.pathname.replace(/\/+$/, "") === "/news");
  useEffect(() => {
    document.documentElement.classList.remove("admin-theme");
    document.body.classList.remove("admin-theme");
    if (!document.title || document.title.includes("Admin Panel")) document.title = "OtoVerse";
  }, []);

  return (
    <div className="otoverse-public">
      <Suspense fallback={<PageLoader label="กำลังเตรียมเกมและคลังอนิเมะ…" />}>
        {newsEntry ? <AnimeNews standalone /> : <OtoVerseExperience />}
        <WebMascot />
      </Suspense>
    </div>
  );
}
