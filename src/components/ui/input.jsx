import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 text-sm text-slate-900 shadow-sm outline-none",
        "placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10",
        "dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
