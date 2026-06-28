import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseAuth, firebaseAuthPersistenceReady, firebaseReady } from "@/lib/firebase";
import { getAdminRole } from "@/lib/adminContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-slate-100">
      <Card className="w-full max-w-md rounded-3xl !border-slate-700 !bg-slate-900 !text-slate-100">
        <CardHeader className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-300">OtoVerse</div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>เข้าสู่ระบบด้วยบัญชีอีเมลที่ได้รับสิทธิ์แอดมิน</CardDescription>
        </CardHeader>
        <CardContent>
          {!firebaseReady ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              ยังไม่ได้ตั้งค่า Firebase environment variables
            </div>
          ) : checking ? (
            <div className="py-8 text-center text-sm text-slate-500">กำลังตรวจสอบสถานะบัญชี…</div>
          ) : deniedUser ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="font-semibold">ไม่มีสิทธิ์เข้าใช้งาน</div>
                <div className="mt-1">{deniedUser.email}</div>
                <div className="mt-2">{error}</div>
              </div>
              <Button className="w-full" variant="outline" onClick={handleSignOut}>
                ออกจากบัญชีแล้วลองใหม่
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block space-y-1.5 text-sm font-medium">
                <span>อีเมล</span>
                <Input
                  className="!border-slate-600 !bg-slate-950 !text-slate-100"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                <span>รหัสผ่าน</span>
                <Input
                  className="!border-slate-600 !bg-slate-950 !text-slate-100"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error ? <div className="text-sm text-red-600">{error}</div> : null}
              <Button className="w-full" type="submit" disabled={submitting || !firebaseReady}>
                {submitting ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
              </Button>
              <a className="block text-center text-sm text-slate-400 hover:text-white" href="/">
                เปิดหน้าเกม
              </a>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
