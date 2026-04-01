import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-slate-900 bg-slate-900 text-white shadow-[0_6px_16px_rgba(12,18,42,0.28)] hover:-translate-y-0.5 hover:bg-slate-800",
  outline: "border-slate-300 bg-white/85 text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/65 dark:text-slate-100 dark:hover:bg-slate-900",
  ghost: "border-transparent bg-transparent text-slate-700 shadow-none hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
};

const sizes = {
  default: "px-4 py-2",
  icon: "h-10 w-10 px-0 py-0"
};

export function Button({ className, variant = "default", size = "default", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    />
  );
}
