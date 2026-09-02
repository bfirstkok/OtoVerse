import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ArrowLeft, KeyRound, LockKeyhole, Mail, Music2, ShieldCheck } from "lucide-react";
import { firebaseAuth, firebaseAuthPersistenceReady, firebaseReady } from "@/lib/firebase";
import { getAdminRole } from "@/lib/adminContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deniedUser, setDeniedUser] = useState(null);

  useEffect(() => {
    if (!firebaseAuth) {
      setChecking(false);
      return undefined;
    }

    return onAuthStateChanged(firebaseAuth, async (user) => {
      setChecking(true);
      setDeniedUser(null);
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const role = await getAdminRole(user.uid);
        if (role === "admin") {
          window.location.replace("/admin");
          return;
        }
        setDeniedUser(user);
        setError("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งาน Admin Panel");
      } catch (err) {
        setError(err?.message || "ตรวจสอบสิทธิ์แอดมินไม่สำเร็จ");
      } finally {
        setChecking(false);
      }
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!firebaseAuth) return;
    setSubmitting(true);
    setError("");
    setDeniedUser(null);

    try {
      await firebaseAuthPersistenceReady;
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const role = await getAdminRole(credential.user.uid);
      if (role !== "admin") {
        setDeniedUser(credential.user);
        setError("เข้าสู่ระบบสำเร็จ แต่บัญชีนี้ไม่มีสิทธิ์แอดมิน");
        return;
      }
      window.location.replace("/admin");
    } catch (err) {
      const message = err?.code === "auth/invalid-credential"
        ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
        : err?.message || "เข้าสู่ระบบไม่สำเร็จ";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (firebaseAuth) await signOut(firebaseAuth);
    setDeniedUser(null);
    setError("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b14] p-4 text-slate-100 sm:p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-9rem] h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/50 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] sm:min-h-[calc(100vh-3rem)]">
        <section className="hidden flex-col justify-between border-r border-white/8 bg-gradient-to-br from-indigo-600/16 via-slate-950/20 to-cyan-500/8 p-10 lg:flex">
          <a href="/" className="inline-flex w-fit items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500 text-white shadow-[0_16px_38px_rgba(99,102,241,0.35)]">
              <Music2 className="h-6 w-6" />
            </span>
            <div>
              <div className="font-display text-xl font-bold">OtoVerse</div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Control Center</div>
            </div>
          </a>

          <div className="max-w-md">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-semibold text-indigo-200">
              <ShieldCheck className="h-4 w-4" /> Restricted area
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-white">จัดการคลังเพลงและข้อมูลอนิเมะจากที่เดียว</h1>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              ระบบหลังบ้านถูกแยกออกจากหน้าเกมชัดเจน เพื่อให้เพิ่มเพลง แก้ข้อมูล และดูสถานะคอนเทนต์ได้ง่ายขึ้นโดยไม่รบกวนประสบการณ์ผู้เล่น
            </p>
          </div>

          <div className="text-xs text-slate-600">OtoVerse Administration • Firebase secured</div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-9 lg:p-12">
          <Card className="w-full max-w-md !border-white/8 !bg-white/[0.035] shadow-none">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-8 lg:hidden">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500"><Music2 className="h-5 w-5" /></span>
                  <div>
                    <div className="font-display text-lg font-bold">OtoVerse</div>
                    <div className="text-xs text-slate-500">Admin Control Center</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300"><KeyRound className="h-4 w-4" /> ผู้ดูแลระบบ</div>
                <h2 className="mt-3 text-3xl font-bold text-white">เข้าสู่ระบบ</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">ใช้บัญชีอีเมลที่ได้รับสิทธิ์ Admin เท่านั้น</p>
              </div>

              <div className="mt-7">
                {!firebaseReady ? (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200">
                    ยังไม่ได้ตั้งค่า Firebase environment variables สำหรับระบบหลังบ้าน
                  </div>
                ) : checking ? (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center text-sm text-slate-400">กำลังตรวจสอบสถานะบัญชี…</div>
                ) : deniedUser ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                      <div className="font-bold">ไม่มีสิทธิ์เข้าใช้งาน</div>
                      <div className="mt-1 text-rose-200/80">{deniedUser.email}</div>
                      <div className="mt-2 text-rose-200/80">{error}</div>
                    </div>
                    <Button className="w-full" variant="outline" onClick={handleSignOut}>ออกจากบัญชีแล้วลองใหม่</Button>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <label className="block space-y-2 text-sm font-semibold text-slate-300">
                      <span>อีเมล</span>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input className="!border-white/10 !bg-black/20 pl-10" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" required />
                      </div>
                    </label>
                    <label className="block space-y-2 text-sm font-semibold text-slate-300">
                      <span>รหัสผ่าน</span>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input className="!border-white/10 !bg-black/20 pl-10" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
                      </div>
                    </label>
                    {error ? <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">{error}</div> : null}
                    <Button className="mt-2 w-full" size="lg" type="submit" disabled={submitting || !firebaseReady}>
                      {submitting ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ Admin"}
                    </Button>
                  </form>
                )}
              </div>

              <a className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-200" href="/">
                <ArrowLeft className="h-4 w-4" /> กลับหน้าเกม
              </a>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
