import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ImageOff,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAnimeImageUrl, getYouTubeId, getYouTubeThumbUrl } from "@/lib/media";
import { getAnimeGenreLabel } from "@/lib/animeGenre";

function baseAnimeTitle(value) {
  return String(value || "").replace(/\s*\((?:OP|ED)\s*\d*\)\s*$/i, "").trim();
}

function seriesKey(value) {
  return baseAnimeTitle(value).toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function songTypeLabel(item) {
  const match = String(item?.title || "").match(/\((OP|ED)\s*(\d*)\)\s*$/i);
  if (match) return `${match[1].toUpperCase()}${match[2] || ""}`;
  return item?.songTitle ? "เพลง" : "ข้อมูลเรื่อง";
}

function groupItems(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = seriesKey(item.title) || item.id;
    if (!groups.has(key)) groups.set(key, { key, title: baseAnimeTitle(item.title) || item.title, items: [] });
    groups.get(key).items.push(item);
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) => String(a.title).localeCompare(String(b.title), "th", { numeric: true }))
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "th", { numeric: true }));
}

function YouTubePreview({ videoSource, title }) {
  const youtubeId = getYouTubeId(videoSource);
  if (!youtubeId) return <span className="text-xs text-slate-600">ไม่มีวิดีโอ</span>;

  return (
    <a
      className="group relative block w-full max-w-36 overflow-hidden rounded-xl border border-white/8 bg-black/30"
      href={`https://www.youtube.com/watch?v=${youtubeId}`}
      target="_blank"
      rel="noreferrer"
      title="เปิดวิดีโอใน YouTube"
    >
      <img className="aspect-video w-full object-cover opacity-80 transition group-hover:opacity-100" src={getYouTubeThumbUrl(videoSource, "mqdefault")} alt={`YouTube preview: ${title}`} loading="lazy" />
      <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-black/65 text-white backdrop-blur"><ExternalLink className="h-3.5 w-3.5" /></span>
    </a>
  );
}

export default function AnimeSongTable({
  items,
  onEdit,
  onDelete,
  onAddSong,
  onEditAnime,
  deletingId,
  onImport,
  importing,
  displayMode = "all"
}) {
  const groups = useMemo(() => groupItems(items), [items]);
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());

  const toggleGroup = (key) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center sm:p-14">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-800/70 text-slate-500"><ImageOff className="h-5 w-5" /></div>
        <div className="mt-4 font-semibold text-slate-200">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</div>
        <div className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">ลองเปลี่ยนคำค้นหาหรือตัวกรอง หาก Firestore ยังว่างสามารถนำเข้าข้อมูลเดิมได้ทันที</div>
        {onImport ? (
          <Button className="mt-5" variant="outline" onClick={onImport} disabled={importing}>
            {importing ? "กำลังนำเข้าข้อมูล…" : "นำเข้าข้อมูลเดิม"}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const primary = group.items[0];
        const isExpanded = displayMode !== "series" || expandedGroups.has(group.key);
        const songCount = group.items.filter((item) => /\((?:OP|ED)\s*\d*\)\s*$/i.test(item.title)).length;
        const imageUrl = getAnimeImageUrl(primary);

        return (
          <section key={group.key} className="overflow-hidden rounded-2xl border border-white/8 bg-black/15">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
              <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => toggleGroup(group.key)}>
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-slate-400">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
                {imageUrl ? (
                  <img className="h-16 w-24 shrink-0 rounded-xl border border-white/8 object-cover" src={imageUrl} alt={group.title} loading="lazy" />
                ) : (
                  <div className="grid h-16 w-24 shrink-0 place-items-center rounded-xl border border-white/8 bg-white/[0.025] text-slate-600"><ImageOff className="h-5 w-5" /></div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-white">{group.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge>{songCount} OP/ED</Badge>
                    <Badge variant="secondary">{getAnimeGenreLabel(primary)}</Badge>
                    {primary.year ? <Badge variant="outline">{primary.year}</Badge> : null}
                    <Badge variant={primary.synopsis ? "success" : "warning"}>{primary.synopsis ? "มีเรื่องย่อ" : "ไม่มีเรื่องย่อ"}</Badge>
                  </div>
                </div>
              </button>

              <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                {onEditAnime ? <Button size="sm" variant="outline" onClick={() => onEditAnime(primary, group.items)}><Pencil className="h-3.5 w-3.5" /> แก้ไขเรื่อง</Button> : null}
                {onAddSong ? <Button size="sm" onClick={() => onAddSong(primary)}><Plus className="h-3.5 w-3.5" /> เพิ่ม OP/ED</Button> : null}
              </div>
            </div>

            {isExpanded ? (
              <div className="border-t border-white/8 bg-black/10">
                {group.items.map((item) => (
                  <article key={item.id} className="grid gap-4 border-b border-white/6 p-4 last:border-b-0 md:grid-cols-[74px_minmax(220px,1fr)_150px_100px_auto] md:items-center">
                    <div><Badge variant="outline" className="justify-center">{songTypeLabel(item)}</Badge></div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-100">{item.songTitle || item.note || item.title}</div>
                      {item.artist ? <div className="mt-1 truncate text-sm text-slate-400">{item.artist}</div> : null}
                      <div className="mt-1 truncate text-xs text-slate-600">{item.title}</div>
                    </div>
                    <YouTubePreview videoSource={item.youtubeVideoId} title={item.title} />
                    <div><Badge variant={item.isActive !== false ? "success" : "secondary"}>{item.isActive !== false ? "ใช้งาน" : "ปิด"}</Badge></div>
                    <div className="flex gap-2 md:justify-end">
                      <Button size="sm" variant="outline" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /> แก้ไข</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(item)} disabled={deletingId === item.id}>
                        <Trash2 className="h-3.5 w-3.5" /> {deletingId === item.id ? "กำลังลบ…" : "ลบ"}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
