import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-transparent bg-indigo-600 text-white shadow-[0_8px_22px_rgba(79,70,229,0.24)] hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-[0_12px_28px_rgba(79,70,229,0.3)]",
  secondary: "border-slate-200 bg-slate-100 text-slate-800 hover:-translate-y-0.5 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  outline: "border-slate-200 bg-white/80 text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200",
  ghost: "border-transparent bg-transparent text-slate-600 shadow-none hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white",
  destructive: "border-transparent bg-rose-600 text-white shadow-[0_8px_22px_rgba(225,29,72,0.2)] hover:-translate-y-0.5 hover:bg-rose-500",
  success: "border-transparent bg-emerald-600 text-white shadow-[0_8px_22px_rgba(5,150,105,0.2)] hover:-translate-y-0.5 hover:bg-emerald-500"
};

const sizes = {
  sm: "h-9 rounded-lg px-3 text-xs",
  default: "h-11 px-4",
  lg: "h-12 rounded-xl px-5 text-base",
  icon: "h-10 w-10 px-0"
};

export function Button({ className, variant = "default", size = "default", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
        "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50",
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
      data-ui="button"
    />
  );
}
