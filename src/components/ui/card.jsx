import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/88 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl",
        "dark:border-white/8 dark:bg-slate-950/72 dark:text-slate-100 dark:shadow-[0_22px_60px_rgba(0,0,0,0.26)]",
        className
      )}
      {...props}
      data-ui="card"
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("font-display text-lg font-bold leading-tight tracking-tight text-slate-950 dark:text-white", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />;
}
