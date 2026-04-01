import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/60 bg-white/80 text-slate-900 shadow-[0_14px_35px_rgba(20,32,73,0.12)] backdrop-blur-sm",
        "dark:border-slate-700/40 dark:bg-slate-950/55 dark:text-slate-100 dark:shadow-[0_14px_35px_rgba(0,0,0,0.35)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-zinc-500 dark:text-slate-300/80", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
