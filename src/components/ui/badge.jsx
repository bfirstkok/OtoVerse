import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200",
  secondary: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  outline: "border-slate-200 bg-white/60 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none", variants[variant] || variants.default, className)}
      {...props}
      data-ui="badge"
    />
  );
}
