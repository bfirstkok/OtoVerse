import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import {
  createAnimeSong,
  deleteAnimeSong,
  getAdminRole,
  importAnimeSongs,
  subscribeAnimeSongs,
  updateAnimeSong
} from "@/lib/adminContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AnimeSongForm from "./AnimeSongForm";
import AnimeSongTable from "./AnimeSongTable";

function normalizeTitleKey(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .replace(/\s*\((?:op|ed)\s*\d*\)\s*$/i, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createSynopsisIndex(database) {
  const index = new Map();
  const entries = database?.items && typeof database.items === "object"
    ? Object.entries(database.items)
    : [];

  entries.forEach(([key, entry]) => {
    [key, entry?.title, ...(Array.isArray(entry?.aliases) ? entry.aliases : [])]
      .map(normalizeTitleKey)
      .filter(Boolean)
      .forEach((titleKey) => {
        if (!index.has(titleKey)) index.set(titleKey, String(entry?.text || ""));
      });
  });
  return index;
}

function isSongEntry(item) {
  return /\((?:OP|ED)\s*\d*\)\s*$/i.test(String(item?.title || ""));
}

export default function AdminDashboard() {
  const [authState, setAuthState] = useState("checking");
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [displayMode, setDisplayMode] = useState("series");
  const [editing, setEditing] = useState(null);
  const [editScope, setEditScope] = useState("song");
  const [editingSeriesItems, setEditingSeriesItems] = useState([]);
  const [createFromId, setCreateFromId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!firebaseAuth) {
      setAuthState("unavailable");
      return undefined;
    }

    return onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        window.location.replace("/admin/login");
        return;
      }

      try {
        const role = await getAdminRole(nextUser.uid);
        setAuthState(role === "admin" ? "authorized" : "denied");
      } catch (err) {
        setError(err?.message || "ตรวจสอบสิทธิ์ไม่สำเร็จ");
        setAuthState("denied");
      }
    });
  }, []);

  useEffect(() => {
    if (authState !== "authorized") return undefined;
    setLoadingItems(true);
    try {
      return subscribeAnimeSongs((nextItems, subscriptionError) => {
        setItems(nextItems);
        setLoadingItems(false);
        if (subscriptionError) setError(subscriptionError.message || "โหลดข้อมูลไม่สำเร็จ");
      });
    } catch (err) {
      setLoadingItems(false);
      setError(err?.message || "โหลดข้อมูลไม่สำเร็จ");
      return undefined;
    }
  }, [authState]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    let sourceItems = items;

    if (displayMode === "songs") {
      sourceItems = items.filter(isSongEntry);
    }

    return sourceItems.filter((item) => {
      if (!keyword) return true;
      const haystack = [
        item.title,
        ...(Array.isArray(item.altTitles) ? item.altTitles : [item.altTitles]),
        item.songTitle,
        item.artist,
        item.note
      ].join(" ").toLocaleLowerCase();
      return haystack.includes(keyword);
    });
  }, [items, search, displayMode]);

  const openCreate = () => {
    setEditing(null);
    setEditScope("song");
    setEditingSeriesItems([]);
    setCreateFromId("");
    setFormOpen(true);
    setError("");
  };

  const openEdit = (item) => {
    setEditing(item);
    setEditScope("song");
    setEditingSeriesItems([]);
    setCreateFromId("");
    setFormOpen(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditAnime = (item, seriesItems) => {
    setEditing(item);
    setEditScope("anime");
    setEditingSeriesItems(seriesItems);
    setCreateFromId("");
    setFormOpen(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAddSongForAnime = (item) => {
    setEditing(null);
    setEditScope("song");
    setEditingSeriesItems([]);
    setCreateFromId(item.id);
    setFormOpen(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (data) => {
    setSaving(true);
    setError("");
    try {
      if (editing && editScope === "anime") {
        const sharedFields = {
          animeTitle: data.animeTitle,
          altTitles: data.altTitles,
          acceptedAnswers: data.acceptedAnswers,
          year: data.year,
          genre: data.genre,
          difficulty: data.difficulty,
          imageUrl: data.imageUrl,
          synopsis: data.synopsis,
          characters: data.characters
        };
        await Promise.all(
          editingSeriesItems.map((seriesItem) =>
            updateAnimeSong(seriesItem.id, { ...seriesItem, ...sharedFields })
          )
        );
      } else if (editing) await updateAnimeSong(editing.id, data);
      else await createAnimeSong(data);
      setEditing(null);
      setEditScope("song");
      setEditingSeriesItems([]);
      setCreateFromId("");
      setFormOpen(false);
    } catch (err) {
      setError(err?.message || "บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`ลบ “${item.title}” ใช่หรือไม่? การทำรายการนี้ย้อนกลับไม่ได้`)) return;
    setDeletingId(item.id);
    setError("");
    try {
      await deleteAnimeSong(item.id);
    } catch (err) {
      setError(err?.message || "ลบข้อมูลไม่สำเร็จ");
    } finally {
      setDeletingId("");
    }
  };

  const handleLogout = async () => {
    if (firebaseAuth) await signOut(firebaseAuth);
    window.location.replace("/admin/login");
  };

  const handleBack = () => {
    if (formOpen) {
      setFormOpen(false);
      setEditing(null);
      setEditScope("song");
      setEditingSeriesItems([]);
      setCreateFromId("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImportExistingData = async () => {
    const confirmed = window.confirm(
      "นำเข้ารายการเดิมจาก animeData.json พร้อมเรื่องย่อและตัวละครเข้า Firestore ใช่หรือไม่?"
    );
    if (!confirmed) return;

    setImporting(true);
    setError("");
    try {
      const [animeResponse, synopsisResponse] = await Promise.all([
        fetch("/animeData.json"),
        fetch("/synopsis_th.json")
      ]);
      if (!animeResponse.ok) throw new Error("โหลด animeData.json ไม่สำเร็จ");

      const animeData = await animeResponse.json();
      const synopsisData = synopsisResponse.ok ? await synopsisResponse.json() : null;
      const synopsisIndex = createSynopsisIndex(synopsisData);
      const existingIds = new Set(items.map((entry) => entry.id));

      const payload = (Array.isArray(animeData) ? animeData : [])
        .filter((anime) => !existingIds.has(`legacy-${anime.id}`))
        .map((anime) => {
          const candidates = [anime.title, ...(Array.isArray(anime.altTitles) ? anime.altTitles : [])];
          const synopsis = candidates
            .map((title) => synopsisIndex.get(normalizeTitleKey(title)))
            .find(Boolean) || "";

          return {
            ...anime,
            documentId: `legacy-${anime.id}`,
            legacyId: anime.id,
            songTitle: anime.songTitle || anime.note || "",
            artist: anime.artist || "",
            imageUrl: anime.imageUrl || "",
            genre: anime.genre || "other",
            synopsis,
            isActive: true
          };
        });

      if (!payload.length) {
        window.alert("ข้อมูลเดิมถูกนำเข้าครบแล้ว ไม่มีรายการใหม่ให้เพิ่ม");
        return;
      }
      const count = await importAnimeSongs(payload);
      window.alert(`นำเข้าสำเร็จ ${count} รายการ`);
    } catch (err) {
      setError(err?.message || "นำเข้าข้อมูลเดิมไม่สำเร็จ");
    } finally {
      setImporting(false);
    }
  };

  if (authState === "checking") return <StatusScreen>กำลังตรวจสอบสิทธิ์แอดมิน…</StatusScreen>;
  if (authState === "unavailable") return <StatusScreen>ยังไม่ได้ตั้งค่า Firebase สำหรับโปรเจกต์นี้</StatusScreen>;
  if (authState === "denied") {
    return (
      <StatusScreen>
        <div className="font-semibold text-red-700">บัญชีนี้ไม่มีสิทธิ์เข้าใช้งาน Admin Panel</div>
        <div className="mt-1 text-sm text-slate-500">{user?.email}</div>
        <Button className="mt-4" variant="outline" onClick={handleLogout}>ออกจากบัญชี</Button>
      </StatusScreen>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-xl shadow-black/30 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-300">OtoVerse</div>
            <h1 className="mt-1 text-3xl font-bold">Admin Panel</h1>
            <div className="mt-1 text-sm text-slate-400">{user?.email}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleBack}>← กลับ</Button>
            <a href="/"><Button variant="outline">เปิดหน้าเกม</Button></a>
            <Button variant="outline" onClick={handleImportExistingData} disabled={importing}>
              {importing ? "กำลังนำเข้า…" : "นำเข้าข้อมูลเดิม"}
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500" onClick={openCreate}>+ เพิ่มอนิเมะ/เพลง</Button>
            <Button variant="outline" onClick={handleLogout}>ออกจากระบบ</Button>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-800 bg-red-950/70 px-4 py-3 text-sm text-red-200">{error}</div>
        ) : null}

        {formOpen ? (
          <Card className="rounded-3xl !border-slate-700 !bg-slate-900 !text-slate-100">
            <CardHeader>
              <CardTitle>
                {editing
                  ? editScope === "anime"
                    ? `แก้ไขข้อมูลเรื่อง: ${editing.animeTitle || editing.title}`
                    : `แก้ไขเพลง: ${editing.songTitle || editing.note || editing.title}`
                  : "เพิ่ม Anime / Song"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimeSongForm
                item={editing}
                existingItems={items}
                preferredExistingId={createFromId}
                editScope={editScope}
                onSave={handleSave}
                onCancel={() => {
                  setFormOpen(false);
                  setEditing(null);
                  setEditScope("song");
                  setEditingSeriesItems([]);
                  setCreateFromId("");
                }}
                saving={saving}
              />
            </CardContent>
          </Card>
        ) : null}

        <Card className="rounded-3xl !border-slate-700 !bg-slate-900 !text-slate-100">
          <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle>รายการอนิเมะและเพลงทั้งหมด</CardTitle>
              <div className="mt-1 text-sm text-slate-500">{filteredItems.length} จาก {items.length} รายการ</div>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-[minmax(220px,1fr)_320px] md:w-auto">
              <Input
                className="!border-slate-600 !bg-slate-950 !text-slate-100 placeholder:!text-slate-500"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาอนิเมะ เพลง หรือศิลปิน"
              />
              <select
                className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={displayMode}
                onChange={(event) => setDisplayMode(event.target.value)}
              >
                <option value="series">รายชื่อเรื่อง</option>
                <option value="songs">เพลง OP/ED</option>
                <option value="all">ทั้งหมด (รวมภาค/ซีซั่น + OP/ED)</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <div className="py-12 text-center text-slate-500">กำลังโหลดข้อมูล…</div>
            ) : (
              <AnimeSongTable
                items={filteredItems}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAddSong={openAddSongForAnime}
                onEditAnime={openEditAnime}
                deletingId={deletingId}
                onImport={handleImportExistingData}
                importing={importing}
                displayMode={displayMode}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function StatusScreen({ children }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-slate-100">
      <Card className="w-full max-w-lg rounded-3xl !border-slate-700 !bg-slate-900 !text-slate-100">
        <CardContent className="p-8 text-center">{children}</CardContent>
      </Card>
    </main>
  );
}
