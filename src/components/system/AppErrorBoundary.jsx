import React from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[OtoVerse render error]", error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center p-5">
        <Card className="w-full max-w-xl overflow-hidden">
          <CardContent className="p-7 sm:p-9">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">OtoVerse โหลดหน้านี้ไม่สำเร็จ</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              ระบบเจอข้อผิดพลาดระหว่างแสดงผล ลองรีโหลดหน้าอีกครั้งก่อน หากยังเกิดซ้ำให้ส่งข้อความด้านล่างให้ผู้พัฒนา
            </p>
            <pre className="mt-5 max-h-52 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-200 dark:border-slate-800">
              {String(error?.message || error || "unknown_error")}
            </pre>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button className="sm:flex-1" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" /> รีโหลดหน้า
              </Button>
              <Button className="sm:flex-1" variant="outline" onClick={() => window.location.assign("/")}>
                <Home className="mr-2 h-4 w-4" /> กลับหน้าหลัก
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }
}
