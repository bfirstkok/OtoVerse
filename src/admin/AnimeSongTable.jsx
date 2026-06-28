import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: baseAnimeTitle(item.title) || item.title,
        items: []
      });
    }
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
  if (!youtubeId) return <span className="text-slate-500">ไม่มีวิดีโอ</span>;
  return (
    <a
      className="block w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-950"
      href={`https://www.youtube.com/watch?v=${youtubeId}`}
      target="_blank"
      rel="noreferrer"
      title="เปิดวิดีโอใน YouTube"
    >
      <img
        className="aspect-video w-full object-cover"
        src={getYouTubeThumbUrl(videoSource, "mqdefault")}
        alt={`YouTube preview: ${title}`}
        loading="lazy"
      />
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
      <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-950/50 p-10 text-center">
        <div className="font-semibold text-slate-200">ยังไม่มีข้อมูลใน Firestore</div>
        <div className="mt-1 text-sm text-slate-400">
          นำเข้ารายการอนิเมะ เพลง เรื่องย่อ และตัวละครจากข้อมูลเดิมของเว็บ
        </div>
        {onImport ? (
          <Button className="mt-5 bg-indigo-600 hover:bg-indigo-500" onClick={onImport} disabled={importing}>
            {importing ? "กำลังนำเข้าข้อมูล…" : "นำเข้าข้อมูลเดิมตอนนี้"}
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

        return (
          <section key={group.key} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/60">
            <button
              type="button"
              className="flex w-full items-center gap-4 bg-slate-800/80 px-4 py-4 text-left transition hover:bg-slate-800"
              onClick={() => toggleGroup(group.key)}
            >
              {getAnimeImageUrl(primary) ? (
                <img
                  className="h-16 w-24 shrink-0 rounded-xl border border-slate-600 object-cover"
                  src={getAnimeImageUrl(primary)}
                  alt={group.title}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-xs text-slate-400">
                  ไม่มีรูป
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-bold text-white">{group.title}</h3>
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-200">
                    {songCount} OP/ED
                  </span>
                  <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-200">
                    {getAnimeGenreLabel(primary)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                  {primary.year ? <span>ปี {primary.year}</span> : null}
                  <span>{Array.isArray(primary.characters) ? primary.characters.length : 0} ตัวละคร</span>
                  <span>{primary.synopsis ? "มีเรื่องย่อ" : "ยังไม่มีเรื่องย่อ"}</span>
                </div>
              </div>

              <span className="shrink-0 text-xl text-slate-300">{isExpanded ? "▾" : "▸"}</span>
            </button>

            {onAddSong ? (
              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-700 bg-slate-800/80 px-4 py-2">
                {onEditAnime ? (
                  <Button variant="outline" onClick={() => onEditAnime(primary, group.items)}>
                    แก้ไขข้อมูลเรื่อง
                  </Button>
                ) : null}
                <Button
                  className="bg-indigo-600 hover:bg-indigo-500"
                  onClick={() => onAddSong(primary)}
                >
                  + เพิ่ม OP/ED ให้เรื่องนี้
                </Button>
              </div>
            ) : null}

            {isExpanded ? (
              <div className="divide-y divide-slate-800">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-4 px-4 py-4 pl-8 hover:bg-slate-800/40 md:grid-cols-[90px_minmax(260px,1fr)_150px_90px_150px] md:items-center"
                  >
                    <div>
                      <span className="inline-flex rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-sm font-bold text-indigo-200">
                        {songTypeLabel(item)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-slate-100">{item.songTitle || item.note || item.title}</div>
                      {item.artist ? <div className="mt-1 text-sm text-slate-400">{item.artist}</div> : null}
                      <div className="mt-1 truncate text-xs text-slate-500">{item.title}</div>
                    </div>

                    <YouTubePreview videoSource={item.youtubeVideoId} title={item.title} />

                    <div>
                      <span className={item.isActive
                        ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                        : "rounded-full bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300"}
                      >
                        {item.isActive ? "ใช้งาน" : "ปิด"}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => onEdit(item)}>แก้ไข</Button>
                      <Button
                        className="border-red-900 bg-red-950 text-red-200 hover:bg-red-900"
                        onClick={() => onDelete(item)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? "กำลังลบ…" : "ลบ"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
