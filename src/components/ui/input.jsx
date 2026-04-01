import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-slate-300 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200",
        "dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20",
        className
      )}
      {...props}
    />
  );
});
