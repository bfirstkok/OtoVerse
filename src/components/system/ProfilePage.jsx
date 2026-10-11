import ShareCardDialog from "./ShareCardDialog";
import WatchStatusSelector from "./WatchStatusSelector";
import {animeSeriesKey, WATCH_LABELS} from "@/lib/watchlist";
import {profileUrl} from "@/lib/shareCards";
import "@/styles/social-features.css";
import React, { useEffect, useMemo, useState } from 'react';
import { getAnimeImageUrl } from '@/lib/media';
import { getFollowersCount, updateProfileShowcase } from '@/lib/profiles';
import { prepareProfileImage } from '@/lib/avatars';
import './profile-page.css';

export default function ProfilePage({ uid, profile, own, favorites = [], anime = [], avatar, onClose, onSettings, onAnime, onChat, onFollow, following, busy, error }) {
  const [shareData,setShareData] = useState(null);
  const [linkNotice,setLinkNotice] = useState("");
  const [draftPhoto, setDraftPhoto] = useState(undefined);
  const [draftCover, setDraftCover] = useState(undefined);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState('');
  const [savedImages, setSavedImages] = useState({});
  const [tab, setTab] = useState('favorites');
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [nickname, setNickname] = useState('');
  const [top, setTop] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [followers, setFollowers] = useState(null);
  useEffect(() => { let active = true; getFollowersCount(uid).then(n => { if (active) setFollowers(n); }).catch(() => {}); return () => { active = false; }; }, [uid, following]);
  useEffect(() => {
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const escape = e => { if (e.key === 'Escape' && !editing) onClose(); };
    document.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', escape); };
  }, [onClose, editing]);
  const byId = useMemo(() => new Map(anime.map(a => [String(a.id), a])), [anime]);
  const items = ids => (Array.isArray(ids) ? ids : []).map(id => byId.get(String(id))).filter(Boolean);
  const topItems = items(profile?.topAnimeIds);
  const recommendedItems = items(profile?.recommendedAnimeIds);
  const favoriteItems = items(favorites);
  const name = profile?.nickname || profile?.displayName || 'ผู้เล่น';
  const beginEdit = () => { setNickname(profile?.nickname || profile?.displayName || ''); setBio(profile?.bio || ''); setTop((profile?.topAnimeIds || []).map(String)); setRecommended((profile?.recommendedAnimeIds || []).map(String)); setNotice(''); setDraftPhoto(undefined); setDraftCover(undefined); setImageError(''); setEditing(true); };
  const selectImage = async (file, kind) => {
    if (!file) return;
    setImageBusy(true); setImageError('');
    try { const url = await prepareProfileImage(uid, file, kind); if (kind === 'cover') setDraftCover(url); else setDraftPhoto(url); }
    catch { setImageError('เลือกรูป JPG, PNG, WebP, GIF หรือ AVIF ขนาดไม่เกิน 8 MB'); }
    finally { setImageBusy(false); }
  };
  const shownPhoto = savedImages.photoURL ?? avatar ?? profile?.photoURL;
  const shownCover = savedImages.coverURL ?? profile?.coverURL;
  const choose = (id, list, setter) => { const key = String(id); if (list.includes(key)) setter(list.filter(x => x !== key)); else if (list.length < 5) setter([...list, key]); };
  const save = async () => {
    setSaving(true); setNotice('');
    try { await updateProfileShowcase(uid, { nickname, bio, topAnimeIds: top, recommendedAnimeIds: recommended, photoURL: draftPhoto, coverURL: draftCover }); setSavedImages(prev => ({...prev, ...(draftPhoto !== undefined ? {photoURL: draftPhoto} : {}), ...(draftCover !== undefined ? {coverURL: draftCover} : {})})); setEditing(false); setNotice('บันทึกโปรไฟล์แล้ว'); }
    catch (e) { setNotice(e.message === 'nickname_required' ? 'กรุณาใส่ชื่อที่ต้องการแสดง' : e.message === 'nickname_too_long' ? 'ชื่อต้องไม่เกิน 14 ตัวอักษร' : e.message === 'nickname_taken' ? 'ชื่อนี้มีผู้ใช้แล้ว ลองชื่ออื่นนะ' : 'บันทึกไม่สำเร็จ ลองอีกครั้งได้เลย'); }
    finally { setSaving(false); }
  };
  const renderCards = (list, ranked = false) => <div className="ov-profile-grid">{list.map((a, i) => <article key={a.id}><button type="button" className="ov-anime-tile" onClick={() => onAnime(a)}><div className="ov-anime-cover">{getAnimeImageUrl(a) ? <img src={getAnimeImageUrl(a)} alt="" loading="lazy" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} /> : <span>♫</span>}{ranked && <b className="ov-rank">{i + 1}</b>}</div><strong>{a.title}</strong><small>{a.year || 'ANIME'}</small></button>{own && <WatchStatusSelector uid={uid} anime={a} watchlist={profile?.watchlist || {}}/>}</article>)}</div>;
  const watchlist = profile?.watchlist || {};
  const uniqueAnime = [...new Map(anime.map(a => [animeSeriesKey(a), a])).values()];
  const watchItems = status => uniqueAnime.filter(a => watchlist[animeSeriesKey(a)] === status);
  const copyLink = async () => {try {await navigator.clipboard.writeText(profileUrl(uid));setLinkNotice('คัดลอกลิงก์โปรไฟล์แล้ว');}catch{setLinkNotice(profileUrl(uid));}};
  const list = WATCH_LABELS[tab] ? watchItems(tab) : tab === 'recommended' ? recommendedItems : tab === 'top' ? topItems : favoriteItems;
  const results = anime.filter(a => String(a.title || '').toLowerCase().includes(search.toLowerCase())).slice(0, 40);
  return <section className="ov-profile-page" role="dialog" aria-modal="true" aria-label={`โปรไฟล์ ${name}`}>
    <div className="ov-profile-nav"><button autoFocus onClick={onClose}>← กลับ</button><a href="#ov-profile-main">OtoVerse <span>/ PROFILE</span></a>{own ? <button onClick={onSettings}>ตั้งค่าบัญชี</button> : <span />}</div>
    <main id="ov-profile-main" className="ov-profile-main">
      <div className="ov-profile-banner">{shownCover && <img className="ov-profile-cover-image" src={shownCover} alt="รูปปกโปรไฟล์" />}<span>YOUR ANIME, YOUR VERSE.</span><i>✦</i>{own && <button className="ov-cover-edit" onClick={beginEdit}>เปลี่ยนรูปปก</button>}</div>
      <header className="ov-profile-header">
        <div className="ov-profile-avatar">{shownPhoto ? <img src={shownPhoto} alt={`รูปโปรไฟล์ ${name}`} /> : <span>✦</span>}{own && <button className="ov-avatar-edit" aria-label="เปลี่ยนรูปโปรไฟล์" onClick={beginEdit}>✎</button>}</div>
        <div className="ov-profile-identity"><small>OTOVERSE PLAYER</small><h1>{name}</h1><p className="ov-profile-bio">{profile?.bio || (own ? 'เล่าเรื่องตัวเองผ่านอนิเมะที่รัก เพิ่มแนะนำตัวและจัด Top 5 ของคุณได้เลย' : 'พื้นที่เก็บอนิเมะที่รักและเพลงที่ชอบ')}</p><div className="ov-profile-social"><span><b>{favoriteItems.length}</b> เรื่องโปรด</span><span><b>{followers ?? '…'}</b> ผู้ติดตาม</span><span><b>{profile?.following?.length || 0}</b> กำลังติดตาม</span></div></div>
        <div className="ov-profile-actions">{own ? <button className="ov-profile-primary" onClick={beginEdit}>แก้ไขโปรไฟล์</button> : <><button className="ov-profile-primary" onClick={onFollow} disabled={busy}>{following ? 'กำลังติดตาม ✓' : 'ติดตาม'}</button><button onClick={onChat}>ส่งข้อความ</button></>}</div>
      </header>
      <div className="ov-profile-share-actions"><button onClick={copyLink}>คัดลอกลิงก์โปรไฟล์ ↗</button><button disabled={!topItems.length} onClick={() => setShareData({kind:'top',name,items:topItems,url:profileUrl(uid)})}>แชร์ Top 5 เป็นรูป</button>{linkNotice && <span role="status">{linkNotice}</span>}</div>
      {(error || notice) && <p role="status" className="ov-profile-notice">{error || notice}</p>}
      <div className="ov-profile-stats">{[[profile?.playCount || 0, 'รอบที่เล่น', '♫'], [profile?.totalScore || 0, 'คะแนนสะสม', '✦'], [profile?.bestStreak || 0, 'ตอบถูกต่อเนื่องสูงสุด', '⚡']].map(([value, label, icon]) => <div key={label}><span>{icon}</span><strong>{Number(value).toLocaleString()}</strong><small>{label}</small></div>)}</div>
      <section className="ov-profile-showcase"><div className="ov-profile-section-title"><div><small>THE ALL-TIME FAVORITES</small><h2>Top 5 ในใจ</h2></div>{own && <button onClick={beginEdit}>จัดอันดับ ↗</button>}</div>{topItems.length ? renderCards(topItems, true) : <div className="ov-profile-empty">♡<h3>เรื่องไหนที่อยู่ในใจเสมอ?</h3><p>{own ? 'เลือกอนิเมะได้ 5 เรื่อง แล้วเรียงตามอันดับที่คุณชอบ' : 'ยังไม่ได้จัดอันดับอนิเมะ'}</p>{own && <button onClick={beginEdit}>เลือก Top 5</button>}</div>}</section>
      <nav className="ov-profile-tabs" aria-label="คลังอนิเมะ">{[['favorites', '♡ เรื่องโปรด', favoriteItems.length], ['recommended', '✦ เรื่องที่แนะนำ', recommendedItems.length], ['top', '♛ Top 5', topItems.length], ...Object.entries(WATCH_LABELS).map(([key,label]) => [key,label,watchItems(key).length])].map(([key, label, count]) => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>{label} <span>{count}</span></button>)}</nav>
      {list.length ? renderCards(list, tab === 'top') : <div className="ov-profile-empty"><h3>{tab === 'favorites' ? 'ยังไม่มีเรื่องโปรด' : 'ชั้นนี้ยังว่างอยู่'}</h3><p>{WATCH_LABELS[tab] ? 'เลือกสถานะการดูจากการ์ดในคลังอนิเมะ แล้วเรื่องจะมาอยู่ที่นี่' : tab === 'favorites' ? 'เรื่องที่กดหัวใจในคลังอนิเมะจะแสดงที่นี่' : own ? 'เพิ่มเรื่องที่อยากแนะนำผ่านปุ่มแก้ไขโปรไฟล์' : 'รอเจ้าของโปรไฟล์มาเพิ่มเรื่องใหม่'}</p></div>}
    </main>
    {shareData && <ShareCardDialog data={shareData} onClose={() => setShareData(null)}/>}
    {editing && <div className="ov-profile-editor" role="dialog" aria-modal="true" aria-label="แก้ไขโปรไฟล์"><div className="ov-profile-editor-body"><h2>แต่งพื้นที่ของคุณ</h2><div className="ov-image-editor"><div className="ov-cover-preview">{(draftCover ?? shownCover) && <img src={draftCover ?? shownCover} alt="ตัวอย่างรูปปก" />}</div><div className="ov-avatar-preview">{(draftPhoto ?? shownPhoto) ? <img src={draftPhoto ?? shownPhoto} alt="ตัวอย่างรูปโปรไฟล์" /> : '✦'}</div><div className="ov-image-inputs"><label>เปลี่ยนรูปโปรไฟล์<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={imageBusy || saving} onChange={e => { selectImage(e.target.files?.[0], 'avatar'); e.target.value = ''; }} /></label><label>เปลี่ยนรูปปก<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={imageBusy || saving} onChange={e => { selectImage(e.target.files?.[0], 'cover'); e.target.value = ''; }} /></label></div>{(draftCover ?? shownCover) && <button type="button" disabled={imageBusy || saving} onClick={() => setDraftCover('')}>ลบรูปปก</button>}<p>ภาพไม่เกิน 8 MB · รูปปกแนะนำแนวนอน · กดบันทึกเพื่อใช้รูปใหม่</p>{imageBusy && <p role="status">กำลังเตรียมรูป…</p>}{imageError && <p role="alert">{imageError}</p>}</div><label>ชื่อที่แสดง<input value={nickname} maxLength={14} disabled={saving} onChange={e => setNickname(e.target.value)} placeholder="ใส่ชื่อของคุณ" autoComplete="nickname" /></label><small>{nickname.length}/14 ตัวอักษร · ใช้ในโปรไฟล์และอันดับผู้เล่น</small><label>แนะนำตัว<textarea maxLength={160} value={bio} onChange={e => setBio(e.target.value)} placeholder="อนิเมะที่ชอบ เพลงที่ฟัง หรืออะไรที่เป็นคุณ…" /></label><small>{bio.length}/160</small><h3>Top 5 · เรียงตามลำดับที่เลือก</h3><div className="ov-profile-selection">{top.map((id, i) => <button key={id} onClick={() => choose(id, top, setTop)}>{i + 1}. {byId.get(id)?.title || id} ×</button>)}</div><h3>เรื่องที่แนะนำ · สูงสุด 5 เรื่อง</h3><div className="ov-profile-selection">{recommended.map(id => <button key={id} onClick={() => choose(id, recommended, setRecommended)}>{byId.get(id)?.title || id} ×</button>)}</div><label>ค้นหาอนิเมะ<input value={search} onChange={e => setSearch(e.target.value)} placeholder="พิมพ์ชื่อเรื่อง…" /></label><div className="ov-profile-results">{results.map(a => <div key={a.id}><span>{a.title}</span><button aria-pressed={top.includes(String(a.id))} disabled={!top.includes(String(a.id)) && top.length >= 5} onClick={() => choose(a.id, top, setTop)}>Top 5 {top.includes(String(a.id)) ? '✓' : '+'}</button><button aria-pressed={recommended.includes(String(a.id))} disabled={!recommended.includes(String(a.id)) && recommended.length >= 5} onClick={() => choose(a.id, recommended, setRecommended)}>แนะนำ {recommended.includes(String(a.id)) ? '✓' : '+'}</button></div>)}{!results.length && <p>ไม่พบชื่อเรื่องนี้</p>}</div><div className="ov-profile-editor-footer"><button onClick={() => setEditing(false)} disabled={saving || imageBusy}>ยกเลิก</button><button className="ov-profile-primary" onClick={save} disabled={saving || imageBusy}>{saving ? 'กำลังบันทึก…' : 'บันทึกโปรไฟล์'}</button></div>{notice && <p role="status">{notice}</p>}</div></div>}
  </section>;
}
