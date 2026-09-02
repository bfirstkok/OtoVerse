import React from "react";
import { LoaderCircle, Music2 } from "lucide-react";

export default function PageLoader({ label = "กำลังโหลด OtoVerse…", dark = false }) {
  return (
    <div className={dark ? "min-h-screen bg-[#080b14] text-slate-100" : "min-h-screen text-slate-900 dark:text-slate-100"}>
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 shadow-[0_18px_50px_rgba(79,70,229,0.18)]">
            <Music2 className="h-7 w-7 text-indigo-400" />
            <LoaderCircle className="absolute -inset-2 h-20 w-20 animate-spin text-indigo-400/35" />
          </div>
          <div>
            <div className="font-display text-lg font-bold">OtoVerse</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
