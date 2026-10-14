import { matchesAnimeSearch } from "@/lib/animeSearch";
import ReportsPanel from "./ReportsPanel";
import UsersPanel from "./UsersPanel";
import LogsPanel from "./LogsPanel";
import ContentInbox from "./ContentInbox";
import AnimeCoverEditor from "./AnimeCoverEditor";
import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  CircleOff,
  Database,
  ExternalLink,
  FilePenLine,
  LibraryBig,
  ListFilter,
  Music2,
  Plus,
  Search,
  Upload
} from "lucide-react";
import { firebaseAuth } from "@/lib/firebase";
import {
  createAnimeSong,
  deleteAnimeSong,
  getAdminRole,
  importAnimeSongs,
  subscribeAnimeSongs,
  updateAnimeSong,
  updateAnimeCovers
} from "@/lib/adminContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminShell from "@/components/layout/AdminShell";
import PageLoader from "@/components/system/PageLoader";
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
  const [section,setSection] = useState(() => {const value=new URLSearchParams(window.location.search).get('section');return ['reports','users','logs'].includes(value)?value:'content';});
  const [focusUid,setFocusUid] = useState('');
  useEffect(()=>{const pop=()=>{const value=new URLSearchParams(window.location.search).get('section');setSection(['reports','users','logs'].includes(value)?value:'content');};window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);},[]);
  const changeSection = value => {setSection(value);setFocusUid('');setFormOpen(false);window.history.pushState({},'',value==='content'?'/admin':`/admin?section=${value}`);};
  const openUser = uid => {changeSection('users');setFocusUid(uid);};
  const [authState, setAuthState] = useState("checking");
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const showStatus = (value) => { setStatusFilter(value); setDisplayMode("series"); setSearch(""); document.getElementById("admin-content-library")?.scrollIntoView({behavior:"smooth", block:"start"}); };
  const [displayMode, setDisplayMode] = useState("series");
  const [songDraft, setSongDraft] = useState(null);
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

    let generation = 0;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      const current = ++generation;
      setAuthState("checking");
      setItems([]);
      setUser(nextUser);
      if (!nextUser) {
        window.location.replace("/admin/login");
        return;
      }

      try {
        const role = await getAdminRole(nextUser.uid);
        if(current === generation) setAuthState(role === "admin" ? "authorized" : "denied");
      } catch (err) {
        if(current !== generation) return;
        setError(err?.message || "ตรวจสอบสิทธิ์ไม่สำเร็จ");
        setAuthState("denied");
      }
    });
    return () => {generation++;unsubscribe();};
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
    let sourceItems = items;
    if (displayMode === "songs") sourceItems = items.filter(isSongEntry);
    if (displayMode === "pending") sourceItems = items.filter(item => item.entryType !== 'metadata' && item.importSource === "MyAnimeList bulk" && !item.youtubeVideoId);
    return sourceItems.filter(item => (statusFilter === "all" || (statusFilter === "inactive" ? item.isActive === false : item.isActive !== false)) && matchesAnimeSearch({
      ...item,
      altTitles: Array.isArray(item.altTitles) ? item.altTitles : [item.altTitles].filter(Boolean)
    }, search));
  }, [items, search, displayMode, statusFilter]);

  const summary = useMemo(() => {
    const series = new Set(items.map((item) => normalizeTitleKey(item?.title)).filter(Boolean)).size;
    const songs = items.filter(isSongEntry).length;
    const active = items.filter((item) => item?.isActive !== false).length;
    return { series, songs, active, inactive: Math.max(0, items.length - active) };
  }, [items]);

  const resetEditor = () => {
    setSongDraft(null);
    setEditing(null);
    setEditScope("song");
    setEditingSeriesItems([]);
    setCreateFromId("");
    setFormOpen(false);
  };

  const openCreate = () => {
    setSongDraft(null);
    setEditing(null);
    setEditScope("song");
    setEditingSeriesItems([]);
    setCreateFromId("");
    setFormOpen(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (item) => {
    setSongDraft(null);
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
    setEditingSeriesItems(items.filter(entry => normalizeTitleKey(entry.title) === normalizeTitleKey(item.title)));
    setCreateFromId("");
    setFormOpen(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCover = (item) => {
    setEditing(item); setEditScope("cover");
    setEditingSeriesItems(items.filter(entry => normalizeTitleKey(entry.title) === normalizeTitleKey(item.title)));
    setFormOpen(true); setError(""); window.scrollTo({top:0, behavior:"smooth"});
  };

  const openAddSongForAnime = (item) => {
    setSongDraft(null);
    setEditing(null);
    setEditScope("song");
    setEditingSeriesItems([]);
    setCreateFromId(item.id);
    setFormOpen(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const useSuggestion = request => {
    openCreate();
    const source=items.find(entry=>normalizeTitleKey(entry.animeTitle || entry.title)===normalizeTitleKey(request.animeTitle));
    if(source)setCreateFromId(source.id);
    setSongDraft({animeTitle: request.animeTitle || request.requestText || '', songTitle:request.songTitle || '', songType:request.songType === 'ED' ? 'ED':'OP', youtubeVideoId:request.youtubeVideoId || '', fromExisting:Boolean(source)});
  };

  const handleSave = async (data) => {
    setSaving(true);
    setError("");
    try {
      if (editing && editScope === "cover") {
        await updateAnimeCovers(editingSeriesItems.map(entry => entry.id), data.imageUrl);
      } else if (editing && editScope === "anime") {
        const sharedFields = {
          animeTitle: data.animeTitle,
          altTitles: data.altTitles,
          acceptedAnswers: data.acceptedAnswers,
          year: data.year,
          genre: data.genre,
          genres: data.genres,
          difficulty: data.difficulty,
          imageUrl: data.imageUrl,
          synopsis: data.synopsis,
          malId: data.malId, malUrl: data.malUrl, trailerVideoId: data.trailerVideoId, synopsisSource: data.synopsisSource,
          characters: data.characters
        };
        await Promise.all(editingSeriesItems.map((seriesItem) => updateAnimeSong(seriesItem.id, { ...seriesItem, ...sharedFields })));
      } else if (editing) {
        await updateAnimeSong(editing.id, data);
      } else {
        await createAnimeSong(data);
      }
      resetEditor();
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

  const handleImportExistingData = async () => {
    const confirmed = window.confirm("นำเข้ารายการเดิมจาก animeData.json พร้อมเรื่องย่อและตัวละครเข้า Firestore ใช่หรือไม่?");
    if (!confirmed) return;

    setImporting(true);
    setError("");
    try {
      const [animeResponse, synopsisResponse] = await Promise.all([fetch("/animeData.json"), fetch("/synopsis_th.json")]);
      if (!animeResponse.ok) throw new Error("โหลด animeData.json ไม่สำเร็จ");

      const animeData = await animeResponse.json();
      const synopsisData = synopsisResponse.ok ? await synopsisResponse.json() : null;
      const synopsisIndex = createSynopsisIndex(synopsisData);
      const existingIds = new Set(items.map((entry) => entry.id));

      const payload = (Array.isArray(animeData) ? animeData : [])
        .filter((anime) => !existingIds.has(`legacy-${anime.id}`))
        .map((anime) => {
          const candidates = [anime.title, ...(Array.isArray(anime.altTitles) ? anime.altTitles : [])];
          const synopsis = candidates.map((title) => synopsisIndex.get(normalizeTitleKey(title))).find(Boolean) || "";
          return {
            ...anime,
            documentId: `legacy-${anime.id}`,
            legacyId: anime.id,
            songTitle: anime.songTitle || anime.note || "",
            artist: anime.artist || "",
            imageUrl: anime.imageUrl || "",
            genre: anime.genre || "other",
            genres: anime.genres,
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

  if (authState === "checking") return <PageLoader dark label="กำลังตรวจสอบสิทธิ์แอดมิน…" />;
  if (authState === "unavailable") return <StatusScreen title="Firebase ยังไม่พร้อม">ยังไม่ได้ตั้งค่า Firebase สำหรับโปรเจกต์นี้</StatusScreen>;
  if (authState === "denied") {
    return (
      <StatusScreen title="ไม่มีสิทธิ์เข้าใช้งาน">
        <div className="text-sm text-slate-400">{user?.email}</div>
        {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}
        <Button className="mt-5" variant="outline" onClick={handleLogout}>ออกจากบัญชี</Button>
      </StatusScreen>
    );
  }

  const editorTitle = editing
    ? editScope === "cover" ? `เปลี่ยนปก: ${editing.animeTitle || editing.title}` : editScope === "anime"
      ? `แก้ไขข้อมูลเรื่อง: ${editing.animeTitle || editing.title}`
      : `แก้ไขเพลง: ${editing.songTitle || editing.note || editing.title}`
    : "เพิ่ม Anime / Song";

  return (
    <AdminShell
      user={user}
      activeSection={section}
      onSection={changeSection}
      onLogout={handleLogout}
      title={section !== "content" ? ({reports:"Report และแจ้งปัญหา",users:"จัดการผู้ใช้",logs:"บันทึกการใช้งาน"})[section] : formOpen ? editorTitle : "Content Dashboard"}
      description={section !== "content" ? "ตรวจสอบและจัดการข้อมูลสำหรับผู้ดูแลระบบ" : formOpen ? "แก้ไขข้อมูลโดยแยกข้อมูลเรื่องและข้อมูลเพลงให้ชัดเจน" : "จัดการอนิเมะ เพลง OP/ED เรื่องย่อ ตัวละคร และสถานะการใช้งาน"}
      actions={(
        <>
          {formOpen ? <Button variant="outline" onClick={resetEditor}>ยกเลิกการแก้ไข</Button> : null}
          <a href="/"><Button variant="outline"><ExternalLink className="h-4 w-4" /> เปิดหน้าเกม</Button></a>
          {section === "content" && !formOpen ? (
            <Button onClick={openCreate}><Plus className="h-4 w-4" /> เพิ่มข้อมูล</Button>
          ) : null}
        </>
      )}
    >
      {error ? (
        <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      {section === "reports" ? <ReportsPanel onUser={openUser}/> : section === "users" ? <UsersPanel adminUid={user.uid} initialUid={focusUid}/> : section === "logs" ? <LogsPanel/> : formOpen ? (
        <Card className="!border-white/8 !bg-white/[0.035]">
          <CardHeader className="border-b border-white/8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/12 text-indigo-300"><FilePenLine className="h-5 w-5" /></span>
              <CardTitle>{editorTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {editScope === "cover" ? <AnimeCoverEditor item={editing} count={editingSeriesItems.length} saving={saving} onSave={handleSave} onCancel={resetEditor}/> : <AnimeSongForm
              initialSongDraft={songDraft}
              item={editing}
              existingItems={items}
              preferredExistingId={createFromId}
              editScope={editScope}
              onSave={handleSave}
              onCancel={resetEditor}
              saving={saving}
            />}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <ContentInbox onUse={useSuggestion}/>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={LibraryBig} label="Anime series" value={summary.series} hint="จำนวนเรื่องไม่ซ้ำ" />
            <Metric icon={Music2} label="OP / ED" value={summary.songs} hint="เพลงในคลัง" />
            <Metric icon={Database} label="Active" value={summary.active} hint="กดเพื่อดูรายการที่เปิดใช้งาน" tone="success" onClick={() => showStatus("active")} />
            <Metric icon={CircleOff} label="Inactive" value={summary.inactive} hint="กดเพื่อดูรายการที่ยังไม่เปิด" tone="muted" onClick={() => showStatus("inactive")} />
          </section>

          <Card className="!border-white/8 !bg-white/[0.035]">
            <CardHeader className="border-b border-white/8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <CardTitle>คลังคอนเทนต์</CardTitle>
                  <div className="mt-1 text-sm text-slate-400">แสดง {filteredItems.length.toLocaleString()} จาก {items.length.toLocaleString()} รายการ</div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" onClick={handleImportExistingData} disabled={importing}>
                    <Upload className="h-4 w-4" /> {importing ? "กำลังนำเข้า…" : "นำเข้าข้อมูลเดิม"}
                  </Button>
                  <Button onClick={openCreate}><Plus className="h-4 w-4" /> เพิ่ม Anime / Song</Button>
                </div>
              </div>

              <div id="admin-content-library" className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input className="!border-white/10 !bg-black/20 pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นชื่อไทย ชื่อย่อ อนิเมะ เพลง หรือศิลปิน…" />
                </div>
                <label className="relative"><span className="sr-only">สถานะรายการ</span><select aria-label="สถานะรายการ" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="all">ทุกสถานะ</option><option value="active">Active · เปิดใช้งาน</option><option value="inactive">Inactive · ยังไม่เปิด</option></select></label>
                <div className="relative">
                  <ListFilter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select className="pl-10" value={displayMode} onChange={(event) => setDisplayMode(event.target.value)}>
                    <option value="series">แยกตามเรื่อง</option>
                    <option value="songs">เฉพาะเพลง OP/ED</option>
                    <option value="pending">นำเข้าแล้ว · รอวิดีโอ</option>
                    <option value="all">ทั้งหมด</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {loadingItems ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-16 text-center text-sm text-slate-500">กำลังโหลดข้อมูลจาก Firestore…</div>
              ) : (
                <AnimeSongTable
                  items={filteredItems}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onAddSong={openAddSongForAnime}
                  onEditAnime={openEditAnime}
                  onCover={openCover}
                  deletingId={deletingId}
                  onImport={handleImportExistingData}
                  importing={importing}
                  displayMode={displayMode}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminShell>
  );
}

function Metric({ icon: Icon, label, value, hint, tone = "default", onClick }) {
  const tones = {
    default: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/15",
    success: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/15",
    muted: "bg-slate-500/10 text-slate-400 ring-slate-500/15"
  };

  const Container = onClick ? "button" : "div";
  return (
    <Container type={onClick ? "button" : undefined} onClick={onClick} className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 rounded-2xl border border-white/8 bg-white/[0.035] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.15)]">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ring-inset ${tones[tone] || tones.default}`}><Icon className="h-5 w-5" /></div>
      <div className="mt-5 text-3xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="mt-1 text-sm font-semibold text-slate-300">{label}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </Container>
  );
}

function StatusScreen({ title, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b14] p-6 text-slate-100">
      <Card className="w-full max-w-lg !border-white/8 !bg-white/[0.035]">
        <CardContent className="p-8 text-center">
          <div className="text-xl font-bold text-white">{title}</div>
          <div className="mt-3 text-slate-400">{children}</div>
        </CardContent>
      </Card>
    </main>
  );
}
