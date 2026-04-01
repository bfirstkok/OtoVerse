import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-slate-900 bg-slate-900 text-white",
  outline: "border-slate-300 bg-white/85 text-slate-700 dark:border-slate-700 dark:bg-slate-900/65 dark:text-slate-100"
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}
