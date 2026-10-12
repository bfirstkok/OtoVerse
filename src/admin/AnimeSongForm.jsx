import MyAnimeListImport from "./MyAnimeListImport";
import { matchesAnimeSearch } from "@/lib/animeSearch";
import { prepareProfileImage } from "@/lib/avatars";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getYouTubeId, getYouTubeThumbUrl } from "@/lib/media";
import { GENRE_CONFIG, getEffectiveAnimeGenres } from "@/lib/animeGenre";

const EMPTY_CHARACTER = { name: "", role: "", image: "", bio: "" };
const EMPTY_FORM = {
  title: "",
  animeTitle: "",
  songType: "OP",
  songNumber: 1,
  altTitles: "",
  acceptedAnswers: "",
  songTitle: "",
  artist: "",
  youtubeVideoId: "",
  imageUrl: "",
  genre: "other",
  genres: ["other"],
  difficulty: "medium",
  year: "",
  note: "",
  synopsis: "",
  malId: null, malUrl: "", trailerVideoId: "", synopsisSource: "",
  characters: [],
  isActive: true
};

function lines(value) {
  if (Array.isArray(value)) return value.join("\n");
  return String(value || "");
}

function toFormValue(item) {
  if (!item) return { ...EMPTY_FORM, characters: [] };
  const titleMatch = String(item.title || "").match(/^(.*?)\s*\((OP|ED)\s*(\d*)\)\s*$/i);
  return {
    ...EMPTY_FORM,
    ...item,
    genres: getEffectiveAnimeGenres(item),
    animeTitle: String(item.animeTitle || titleMatch?.[1] || item.title || "").trim(),
    songType: String(item.songType || titleMatch?.[2] || "OP").toUpperCase(),
    songNumber: Number(item.songNumber || titleMatch?.[3] || 1),
    altTitles: lines(item.altTitles),
    acceptedAnswers: lines(item.acceptedAnswers),
    characters: Array.isArray(item.characters)
      ? item.characters.map((character) => ({ ...EMPTY_CHARACTER, ...character }))
      : []
  };
}

function splitLines(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function baseAnimeTitle(value) {
  return String(value || "").replace(/\s*\((?:OP|ED)\s*\d*\)\s*$/i, "").trim();
}

function titleKey(value) {
  return baseAnimeTitle(value).toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function nextOpeningTitle(baseTitle, existingItems) {
  const key = titleKey(baseTitle);
  const highestOpening = existingItems.reduce((highest, entry) => {
    if (titleKey(entry?.title) !== key) return highest;
    const match = String(entry?.title || "").match(/\(OP\s*(\d+)\)\s*$/i);
    return match ? Math.max(highest, Number(match[1]) || 0) : highest;
  }, 0);
  return `${baseTitle} (OP${highestOpening + 1})`;
}

export default function AnimeSongForm({
  item,
  initialSongDraft,
  existingItems = [],
  preferredExistingId = "",
  editScope = "song",
  onSave,
  onCancel,
  saving
}) {
  const [form, setForm] = useState(() => toFormValue(item));
  const [imageBusy, setImageBusy] = useState(false);
  const [animeSearch, setAnimeSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [createMode, setCreateMode] = useState("existing");
  const [selectedExistingId, setSelectedExistingId] = useState("");

  const existingAnimeOptions = useMemo(() => {
    const seen = new Set();
    return existingItems.filter((entry) => {
      const key = titleKey(entry?.title);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [existingItems]);

  const matchingAnime = useMemo(() => existingAnimeOptions.filter(entry => matchesAnimeSearch({
    ...entry,
    altTitles: Array.isArray(entry.altTitles) ? entry.altTitles : [entry.altTitles].filter(Boolean)
  }, animeSearch)), [existingAnimeOptions, animeSearch]);

  useEffect(() => {
    setForm(toFormValue(item));
    setSelectedExistingId("");
  }, [item]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateCharacter = (index, field, value) => {
    setForm((current) => ({
      ...current,
      characters: current.characters.map((character, characterIndex) => (
        characterIndex === index ? { ...character, [field]: value } : character
      ))
    }));
  };

  const addCharacter = () => {
    setForm((current) => ({
      ...current,
      characters: [...current.characters, { ...EMPTY_CHARACTER }]
    }));
  };

  const removeCharacter = (index) => {
    setForm((current) => ({
      ...current,
      characters: current.characters.filter((_, characterIndex) => characterIndex !== index)
    }));
  };

  const chooseCreateMode = (mode) => {
    setCreateMode(mode);
    setSelectedExistingId("");
    setForm({ ...EMPTY_FORM, characters: [] });
  };

  const selectExistingAnime = (id) => {
    setSelectedExistingId(id);
    const source = existingItems.find((entry) => entry.id === id);
    if (!source) {
      setForm({ ...EMPTY_FORM, characters: [] });
      return;
    }

    const baseTitle = baseAnimeTitle(source.title);
    const nextTitle = nextOpeningTitle(baseTitle, existingItems);
    setForm({
      ...toFormValue({ ...source, title: nextTitle, animeTitle: baseTitle }),
      songType: "OP",
      songNumber: Number(nextTitle.match(/OP(\d+)/)?.[1]) || 1,
      songTitle: "",
      artist: "",
      youtubeVideoId: "",
      note: "",
      isActive: true,
      characters: Array.isArray(source.characters)
        ? source.characters.map((character) => ({ ...character }))
        : []
    });
  };

  useEffect(() => {
    if (!item && preferredExistingId) {
      setCreateMode("existing");
      selectExistingAnime(preferredExistingId);
    }
  }, [item, preferredExistingId]);

  useEffect(() => {
    if (!initialSongDraft || item) return;
    const type=initialSongDraft.songType || 'OP';
    const highest=existingItems.filter(entry => titleKey(entry.animeTitle || entry.title)===titleKey(initialSongDraft.animeTitle) && toFormValue(entry).songType===type).reduce((n,entry)=>Math.max(n,Number(toFormValue(entry).songNumber)||0),0);
    setCreateMode(initialSongDraft.fromExisting ? 'existing':'new');
    setForm(current=>({...current,...initialSongDraft,songNumber:highest+1}));
  }, [initialSongDraft, item]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");
    if (!item && createMode === "existing" && !String(form.animeTitle || "").trim()) { setFormError("กรุณาค้นหาและเลือกอนิเมะก่อนบันทึก"); return; }
    if (!form.genres.length) { setFormError("กรุณาเลือกประเภทอนิเมะอย่างน้อย 1 หมวด"); return; }
    const videoId = getYouTubeId(form.youtubeVideoId);
    if (editScope !== "anime" && !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) { setFormError("กรุณาวางลิงก์ YouTube หรือรหัสวิดีโอที่ถูกต้อง"); return; }
    const duplicate = existingItems.some(entry => entry.id !== item?.id && titleKey(entry.animeTitle || entry.title) === titleKey(form.animeTitle) && toFormValue(entry).songType === form.songType && Number(toFormValue(entry).songNumber) === Number(form.songNumber));
    if (editScope !== "anime" && duplicate) { setFormError("เรื่องนี้มีเพลงประเภทและลำดับนี้แล้ว กรุณาแก้รายการเดิมหรือเปลี่ยนลำดับเพลง"); return; }
    onSave({
      ...form,
      youtubeVideoId: videoId,
      title: `${String(form.animeTitle || "").trim()} (${form.songType}${Math.max(1, Number(form.songNumber) || 1)})`,
      altTitles: splitLines(form.altTitles),
      acceptedAnswers: splitLines(form.acceptedAnswers),
      characters: form.characters.map((character, index) => ({
        ...character,
        id: character.id ?? index + 1
      }))
    });
  };

  const previewImage = String(form.imageUrl || "").trim()
    || getYouTubeThumbUrl(form.youtubeVideoId, "mqdefault");
  const editingSongOnly = Boolean((item && editScope === "song") || (!item && createMode === "existing"));
  const editingAnimeOnly = Boolean(item && editScope === "anime");

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {!item ? (
        <FormSection title="ต้องการเพิ่มแบบไหน?">
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => chooseCreateMode("existing")}
              className={`rounded-2xl border p-4 text-left transition ${
                createMode === "existing"
                  ? "border-indigo-400 bg-indigo-500/15 text-white"
                  : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500"
              }`}
            >
              <div className="font-bold">เพิ่ม OP/ED ให้เรื่องที่มีอยู่แล้ว</div>
              <div className="mt-1 text-sm text-slate-400">ดึงเรื่องย่อ ปี รูป และตัวละครเดิมมาให้อัตโนมัติ</div>
            </button>
            <button
              type="button"
              onClick={() => chooseCreateMode("new")}
              className={`rounded-2xl border p-4 text-left transition ${
                createMode === "new"
                  ? "border-indigo-400 bg-indigo-500/15 text-white"
                  : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500"
              }`}
            >
              <div className="font-bold">เพิ่มเรื่องใหม่</div>
              <div className="mt-1 text-sm text-slate-400">สร้างข้อมูลอนิเมะพร้อมเพลงแรกตั้งแต่ต้น</div>
            </button>
          </div>

          {createMode === "existing" ? (
            <Field label="เลือกเรื่อง Anime ที่มีอยู่แล้ว">
              <Input aria-label="ค้นหาอนิเมะ" value={animeSearch} onChange={e => setAnimeSearch(e.target.value)} placeholder="พิมพ์ชื่อไทยหรือชื่อย่อ เช่น rezero…" className="mb-2"/>
              {animeSearch.trim() && <div className="mb-3 rounded-xl border border-slate-700 bg-slate-950 p-2">
                <p className="px-2 py-1 text-xs text-slate-400" role="status">{matchingAnime.length ? `พบ ${matchingAnime.length} เรื่อง · กดชื่อเพื่อเลือก` : 'ไม่พบเรื่องนี้ ลองชื่ออื่นหรือเพิ่มอนิเมะเรื่องใหม่'}</p>
                <div className="max-h-60 overflow-y-auto">{matchingAnime.slice(0, 20).map(entry => <button key={entry.id} type="button" disabled={saving} aria-pressed={selectedExistingId === entry.id} onClick={() => selectExistingAnime(entry.id)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-violet-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 ${selectedExistingId === entry.id ? 'bg-violet-500/20 text-violet-200' : 'text-slate-100'}`}>{baseAnimeTitle(entry.title)}{selectedExistingId === entry.id ? ' ✓' : ''}</button>)}</div>
                {matchingAnime.length > 20 && <p className="px-2 py-1 text-xs text-slate-400">แสดง 20 เรื่องแรก · พิมพ์เพิ่มเพื่อค้นหาให้เจาะจงขึ้น</p>}
              </div>}
              {!animeSearch.trim() && <p className="text-xs text-slate-400" role="status">{form.animeTitle ? `เลือกแล้ว: ${form.animeTitle}` : 'พิมพ์ชื่อเรื่องด้านบน แล้วกดเลือกจากผลการค้นหา'}</p>}
            </Field>
          ) : null}
        </FormSection>
      ) : null}

      {!editingSongOnly ? <FormSection title="ข้อมูลอนิเมะ">
        <MyAnimeListImport saving={saving} onImport={draft => setForm(current => ({ ...current, ...draft }))} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="ชื่อเรื่องอนิเมะ *">
            <Input value={form.animeTitle} onChange={(e) => update("animeTitle", e.target.value)} required />
          </Field>
          <Field label="ชื่ออื่น">
            <Input
              value={form.altTitles}
              onChange={(e) => update("altTitles", e.target.value)}
              placeholder="คั่นด้วย comma หรือขึ้นบรรทัดใหม่"
            />
          </Field>
          <Field label="ปีฉาย">
            <Input
              type="number"
              min="1900"
              max="2200"
              value={form.year ?? ""}
              onChange={(e) => update("year", e.target.value)}
            />
          </Field>
          <Field label="ประเภทอนิเมะ · เลือกได้หลายหมวด">
            <div className="flex flex-wrap gap-2" role="group" aria-label="ประเภทอนิเมะ">
              {Object.entries(GENRE_CONFIG).map(([value, config]) => <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${form.genres.includes(value) ? 'border-violet-500 bg-violet-500/20 text-violet-200' : 'border-slate-700 text-slate-300'}`}>
                <input type="checkbox" checked={form.genres.includes(value)} disabled={saving} onChange={() => setForm(current => {
                  let next = current.genres.includes(value) ? current.genres.filter(key => key !== value) : [...current.genres.filter(key => key !== 'other'), value];
                  if (value === 'other' && !current.genres.includes(value)) next = ['other'];
                  return { ...current, genres: next, genre: next[0] || 'other' };
                })} />{config.label}
              </label>)}
            </div>
            <p className="mt-2 text-xs text-slate-400">เลือกได้มากกว่า 1 หมวด · หมวดแรกใช้เป็นแนวหลักของเกม</p>
          </Field>
          <Field label="ระดับความยาก">
            <select
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={form.difficulty}
              onChange={(e) => update("difficulty", e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </Field>
          <Field label="ภาพปกเรื่อง (URL หรือเลือกจากเครื่อง)">
            <Input value={String(form.imageUrl || "").startsWith('data:') ? '' : form.imageUrl} placeholder={String(form.imageUrl || "").startsWith('data:') ? 'ใช้ภาพที่เลือกจากเครื่อง' : 'https://…'} onChange={(e) => update("imageUrl", e.target.value)} />
            <input className="mt-2 block w-full text-xs text-slate-400" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={saving || imageBusy} onChange={async e => {
              const file=e.target.files?.[0]; e.target.value=''; if(!file)return;
              setImageBusy(true); setFormError('');
              try {update('imageUrl', await prepareProfileImage('admin-cover', file, 'cover'));} catch {setFormError('เลือกรูปภาพขนาดไม่เกิน 8 MB');} finally {setImageBusy(false);}
            }}/>
          </Field>
        </div>

        <Field label="เรื่องย่อ / ประวัติเนื้อเรื่อง">
          <TextArea rows={7} value={form.synopsis} onChange={(e) => update("synopsis", e.target.value)} />
        </Field>
        <Field label="ตัวอย่างอนิเมะ YouTube (แยกจากเพลง OP/ED)">
          <Input value={form.trailerVideoId || ''} onChange={e => update('trailerVideoId', e.target.value)} placeholder="ลิงก์ YouTube หรือ Video ID · เว้นว่างได้" />
        </Field>
        {getYouTubeId(form.trailerVideoId) && <a className="text-sm text-violet-300 underline" href={`https://www.youtube.com/watch?v=${getYouTubeId(form.trailerVideoId)}`} target="_blank" rel="noreferrer">ดูตัวอย่างอนิเมะ ↗</a>}
        {form.malUrl && <p className="text-xs text-slate-400">แหล่งข้อมูล: {form.synopsisSource || 'MyAnimeList'} · บันทึกแล้วจะใส่ลิงก์ต้นทางในรายละเอียด</p>}
        {previewImage ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-200">ตัวอย่างรูป</div>
            <img
              className="aspect-video w-full max-w-sm rounded-2xl border border-slate-700 object-cover"
              src={previewImage}
              alt="ตัวอย่างรูปอนิเมะ"
            />
          </div>
        ) : null}
      </FormSection> : (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">เรื่องอนิเมะ</div>
          <div className="mt-1 text-lg font-bold text-white">{form.animeTitle}</div>
          <div className="mt-1 text-sm text-slate-400">ข้อมูลเรื่องและรูปปกใช้จากเรื่องเดิม · กรอกเฉพาะเพลงใหม่ได้เลย</div>
        </div>
      )}

      {!editingAnimeOnly ? <FormSection title="ข้อมูลเพลงและเกม">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="ประเภทเพลง">
            <select
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={form.songType}
              onChange={(e) => {
                const type = e.target.value;
                if (!item) {
                  const highest = existingItems.filter(entry => titleKey(entry.animeTitle || entry.title) === titleKey(form.animeTitle) && toFormValue(entry).songType === type).reduce((max,entry) => Math.max(max, Number(toFormValue(entry).songNumber) || 0), 0);
                  setForm(current => ({...current, songType:type, songNumber:highest + 1}));
                } else update("songType",type);
              }}
            >
              <option value="OP">Opening (OP)</option>
              <option value="ED">Ending (ED)</option>
            </select>
          </Field>
          <Field label="ลำดับเพลง">
            <Input
              type="number"
              min="1"
              value={form.songNumber}
              onChange={(e) => update("songNumber", e.target.value)}
            />
          </Field>
          <Field label="ชื่อเพลง OP/ED">
            <Input value={form.songTitle} onChange={(e) => update("songTitle", e.target.value)} />
          </Field>
          <Field label="ศิลปิน">
            <Input value={form.artist} onChange={(e) => update("artist", e.target.value)} />
          </Field>
          <Field label="ลิงก์ YouTube หรือ Video ID *">
            <Input
              value={form.youtubeVideoId}
              onChange={(e) => update("youtubeVideoId", e.target.value)}
              placeholder="วางลิงก์ youtube.com/watch หรือ youtu.be ได้เลย"
              required
            />
          </Field>
          <Field label="ชื่อเพลง/หมายเหตุเดิม">
            <Input value={form.note} onChange={(e) => update("note", e.target.value)} />
          </Field>
        </div>
        {getYouTubeId(form.youtubeVideoId) && <div className="flex gap-4 items-center rounded-xl bg-slate-950 p-3"><img src={getYouTubeThumbUrl(form.youtubeVideoId, "mqdefault")} alt="ตัวอย่างวิดีโอเพลง" className="w-32 rounded-lg"/><div className="text-sm text-slate-300"><div>ตรวจวิดีโอก่อนบันทึก</div><a className="text-indigo-300 underline" href={`https://www.youtube.com/watch?v=${getYouTubeId(form.youtubeVideoId)}`} target="_blank" rel="noreferrer">เปิดใน YouTube ↗</a></div></div>}
        <Field label="คำตอบที่ยอมรับ (คั่นด้วย comma หรือขึ้นบรรทัดใหม่)">
          <TextArea rows={4} value={form.acceptedAnswers} onChange={(e) => update("acceptedAnswers", e.target.value)} />
        </Field>
      </FormSection> : null}

      {!editingSongOnly ? <details className="rounded-xl border border-slate-700 p-3"><summary className="cursor-pointer text-sm text-slate-300">ข้อมูลตัวละครเพิ่มเติม (ไม่จำเป็นต้องกรอก)</summary><FormSection
        title={`ตัวละครแนะนำ (${form.characters.length})`}
        action={<Button variant="outline" onClick={addCharacter}>+ เพิ่มตัวละคร</Button>}
      >
        {form.characters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-600 p-6 text-center text-sm text-slate-400">
            ยังไม่มีตัวละคร กด “เพิ่มตัวละคร” เพื่อเริ่มกรอกข้อมูล
          </div>
        ) : (
          <div className="space-y-4">
            {form.characters.map((character, index) => (
              <div key={character.id ?? index} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-semibold text-slate-100">ตัวละคร #{index + 1}</div>
                  <Button variant="ghost" className="text-red-300 hover:text-red-200" onClick={() => removeCharacter(index)}>
                    ลบ
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="ชื่อ">
                    <Input value={character.name} onChange={(e) => updateCharacter(index, "name", e.target.value)} />
                  </Field>
                  <Field label="บทบาท">
                    <select
                      aria-label={`บทบาทตัวละคร ${index + 1}`}
                      className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                      value={character.role}
                      disabled={saving}
                      onChange={(e) => updateCharacter(index, "role", e.target.value)}
                    >
                      <option value="">— เลือกบทบาท —</option>
                      <option value="Main">ตัวละครหลัก</option>
                      <option value="Supporting">ตัวละครสมทบ</option>
                      {character.role && !['Main', 'Supporting'].includes(character.role) && <option value={character.role}>{character.role} (ค่าเดิม)</option>}
                    </select>
                  </Field>
                  <Field label="รูปตัวละคร URL">
                    <Input
                      type="url"
                      value={character.image}
                      onChange={(e) => updateCharacter(index, "image", e.target.value)}
                    />
                  </Field>
                  <Field label="ประวัติตัวละคร">
                    <TextArea
                      rows={3}
                      value={character.bio}
                      onChange={(e) => updateCharacter(index, "bio", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </FormSection></details> : null}

      <label className="flex items-center gap-3 text-sm font-medium text-slate-200">
        <input
          className="h-4 w-4 accent-indigo-500"
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
        />
        เปิดใช้งานรายการนี้ในเกม
      </label>

      {formError && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{formError}</p>}
      <div className="sticky bottom-0 bg-slate-950/95 flex flex-wrap justify-end gap-3 border-t border-slate-700 pt-5">
        <Button variant="outline" onClick={onCancel} disabled={saving || imageBusy}>ยกเลิก</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={saving || imageBusy}>
          {saving ? "กำลังบันทึก…" : item ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
        </Button>
      </div>
    </form>
  );
}

function FormSection({ title, action, children }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-200">
      <span>{label}</span>
      {children}
    </label>
  );
}

function TextArea(props) {
  return (
    <textarea
      className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
      {...props}
    />
  );
}
