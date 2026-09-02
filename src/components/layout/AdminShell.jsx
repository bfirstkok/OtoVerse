import React from "react";
import { Database, ExternalLink, LayoutDashboard, LogOut, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminShell({ user, title, description, actions, onLogout, children }) {
  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[-8rem] h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-64 shrink-0 border-r border-white/8 bg-slate-950/50 p-5 backdrop-blur-xl lg:flex lg:flex-col">
          <a href="/admin" className="flex items-center gap-3 rounded-2xl px-2 py-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500 text-white shadow-[0_10px_30px_rgba(99,102,241,0.3)]">
              <Music2 className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg font-bold">OtoVerse</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Control Center</span>
            </span>
          </a>

          <nav className="mt-8 space-y-1.5">
            <a href="/admin" className="flex items-center gap-3 rounded-xl bg-indigo-500/12 px-3 py-3 text-sm font-semibold text-indigo-200 ring-1 ring-inset ring-indigo-500/20">
              <LayoutDashboard className="h-4 w-4" /> ภาพรวมระบบ
            </a>
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400">
              <Database className="h-4 w-4" /> Anime Content
            </div>
          </nav>

          <div className="mt-auto space-y-3">
            <a href="/" className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
              เปิดหน้าเกม <ExternalLink className="h-4 w-4" />
            </a>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="truncate text-sm font-semibold text-slate-200">{user?.email || "Admin"}</div>
              <div className="mt-1 text-xs text-slate-500">Administrator</div>
              <Button className="mt-3 w-full justify-start" variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" /> ออกจากระบบ
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/8 bg-[#080b14]/82 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300 lg:hidden">
                  <Music2 className="h-4 w-4" /> OtoVerse Admin
                </div>
                <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">{title}</h1>
                {description ? <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p> : null}
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
          </header>

          <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
