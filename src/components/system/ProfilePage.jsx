import React, { useEffect, useMemo, useState } from 'react';
import { getAnimeImageUrl } from '@/lib/media';
import { getFollowersCount, updateProfileShowcase } from '@/lib/profiles';
import './profile-page.css';

export default function ProfilePage({ uid, profile, own, favorites = [], anime = [], avatar, onClose, onSettings, onAnime, onChat, onFollow, following, busy, error }) {
  const [tab, setTab] = useState('favorites');
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
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
  const beginEdit = () => { setBio(profile?.bio || ''); setTop((profile?.topAnimeIds || []).map(String)); setRecommended((profile?.recommendedAnimeIds || []).map(String)); setNotice(''); setEditing(true); };
  const choose = (id, list, setter) => { const key = String(id); if (list.includes(key)) setter(list.filter(x => x !== key)); else if (list.length < 5) setter([...list, key]); };
  const save = async () => {
    setSaving(true); setNotice('');
    try { await updateProfileShowcase(uid, { bio, topAnimeIds: top, recommendedAnimeIds: recommended }); setEditing(false); setNotice('บันทึกโปรไฟล์แล้ว'); }
    catch { setNotice('บันทึกไม่สำเร็จ ลองอีกครั้งได้เลย'); }
    finally { setSaving(false); }
  };
  const renderCards = (list, ranked = false) => <div className="ov-profile-grid">{list.map((a, i) => <button type="button" className="ov-anime-tile" key={a.id} onClick={() => onAnime(a)}><div className="ov-anime-cover">{getAnimeImageUrl(a) ? <img src={getAnimeImageUrl(a)} alt="" loading="lazy" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} /> : <span>♫</span>}{ranked && <b className="ov-rank">{i + 1}</b>}</div><strong>{a.title}</strong><small>{a.year || 'ANIME'}</small></button>)}</div>;
  const list = tab === 'recommended' ? recommendedItems : tab === 'top' ? topItems : favoriteItems;
  const results = anime.filter(a => String(a.title || '').toLowerCase().includes(search.toLowerCase())).slice(0, 40);
  return <section className="ov-profile-page" role="dialog" aria-modal="true" aria-label={`โปรไฟล์ ${name}`}>
    <div className="ov-profile-nav"><button autoFocus onClick={onClose}>← กลับ</button><a href="#ov-profile-main">OtoVerse <span>/ PROFILE</span></a>{own ? <button onClick={onSettings}>ตั้งค่าบัญชี</button> : <span />}</div>
    <main id="ov-profile-main" className="ov-profile-main">
      <div className="ov-profile-banner"><span>YOUR ANIME, YOUR VERSE.</span><i>✦</i></div>
      <header className="ov-profile-header">
        <div className="ov-profile-avatar">{avatar || profile?.photoURL ? <img src={avatar || profile.photoURL} alt={`รูปโปรไฟล์ ${name}`} /> : <span>✦</span>}</div>
        <div className="ov-profile-identity"><small>OTOVERSE PLAYER</small><h1>{name}</h1><p className="ov-profile-bio">{profile?.bio || (own ? 'เล่าเรื่องตัวเองผ่านอนิเมะที่รัก เพิ่มแนะนำตัวและจัด Top 5 ของคุณได้เลย' : 'พื้นที่เก็บอนิเมะที่รักและเพลงที่ชอบ')}</p><div className="ov-profile-social"><span><b>{favoriteItems.length}</b> เรื่องโปรด</span><span><b>{followers ?? '…'}</b> ผู้ติดตาม</span><span><b>{profile?.following?.length || 0}</b> กำลังติดตาม</span></div></div>
        <div className="ov-profile-actions">{own ? <button className="ov-profile-primary" onClick={beginEdit}>แก้ไขโปรไฟล์</button> : <><button className="ov-profile-primary" onClick={onFollow} disabled={busy}>{following ? 'กำลังติดตาม ✓' : 'ติดตาม'}</button><button onClick={onChat}>ส่งข้อความ</button></>}</div>
      </header>
      {(error || notice) && <p role="status" className="ov-profile-notice">{error || notice}</p>}
      <div className="ov-profile-stats">{[[profile?.playCount || 0, 'รอบที่เล่น', '♫'], [profile?.totalScore || 0, 'คะแนนสะสม', '✦'], [profile?.bestStreak || 0, 'ตอบถูกต่อเนื่องสูงสุด', '⚡']].map(([value, label, icon]) => <div key={label}><span>{icon}</span><strong>{Number(value).toLocaleString()}</strong><small>{label}</small></div>)}</div>
      <section className="ov-profile-showcase"><div className="ov-profile-section-title"><div><small>THE ALL-TIME FAVORITES</small><h2>Top 5 ในใจ</h2></div>{own && <button onClick={beginEdit}>จัดอันดับ ↗</button>}</div>{topItems.length ? renderCards(topItems, true) : <div className="ov-profile-empty">♡<h3>เรื่องไหนที่อยู่ในใจเสมอ?</h3><p>{own ? 'เลือกอนิเมะได้ 5 เรื่อง แล้วเรียงตามอันดับที่คุณชอบ' : 'ยังไม่ได้จัดอันดับอนิเมะ'}</p>{own && <button onClick={beginEdit}>เลือก Top 5</button>}</div>}</section>
      <nav className="ov-profile-tabs" aria-label="คลังอนิเมะ">{[['favorites', '♡ เรื่องโปรด', favoriteItems.length], ['recommended', '✦ เรื่องที่แนะนำ', recommendedItems.length], ['top', '♛ Top 5', topItems.length]].map(([key, label, count]) => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>{label} <span>{count}</span></button>)}</nav>
      {list.length ? renderCards(list, tab === 'top') : <div className="ov-profile-empty"><h3>{tab === 'favorites' ? 'ยังไม่มีเรื่องโปรด' : 'ชั้นนี้ยังว่างอยู่'}</h3><p>{tab === 'favorites' ? 'เรื่องที่กดหัวใจในคลังอนิเมะจะแสดงที่นี่' : own ? 'เพิ่มเรื่องที่อยากแนะนำผ่านปุ่มแก้ไขโปรไฟล์' : 'รอเจ้าของโปรไฟล์มาเพิ่มเรื่องใหม่'}</p></div>}
    </main>
    {editing && <div className="ov-profile-editor" role="dialog" aria-modal="true" aria-label="แก้ไขโปรไฟล์"><div className="ov-profile-editor-body"><h2>แต่งพื้นที่ของคุณ</h2><label>แนะนำตัว<textarea maxLength={160} value={bio} onChange={e => setBio(e.target.value)} placeholder="อนิเมะที่ชอบ เพลงที่ฟัง หรืออะไรที่เป็นคุณ…" /></label><small>{bio.length}/160</small><h3>Top 5 · เรียงตามลำดับที่เลือก</h3><div className="ov-profile-selection">{top.map((id, i) => <button key={id} onClick={() => choose(id, top, setTop)}>{i + 1}. {byId.get(id)?.title || id} ×</button>)}</div><h3>เรื่องที่แนะนำ · สูงสุด 5 เรื่อง</h3><div className="ov-profile-selection">{recommended.map(id => <button key={id} onClick={() => choose(id, recommended, setRecommended)}>{byId.get(id)?.title || id} ×</button>)}</div><label>ค้นหาอนิเมะ<input value={search} onChange={e => setSearch(e.target.value)} placeholder="พิมพ์ชื่อเรื่อง…" /></label><div className="ov-profile-results">{results.map(a => <div key={a.id}><span>{a.title}</span><button aria-pressed={top.includes(String(a.id))} disabled={!top.includes(String(a.id)) && top.length >= 5} onClick={() => choose(a.id, top, setTop)}>Top 5 {top.includes(String(a.id)) ? '✓' : '+'}</button><button aria-pressed={recommended.includes(String(a.id))} disabled={!recommended.includes(String(a.id)) && recommended.length >= 5} onClick={() => choose(a.id, recommended, setRecommended)}>แนะนำ {recommended.includes(String(a.id)) ? '✓' : '+'}</button></div>)}{!results.length && <p>ไม่พบชื่อเรื่องนี้</p>}</div><div className="ov-profile-editor-footer"><button onClick={() => setEditing(false)} disabled={saving}>ยกเลิก</button><button className="ov-profile-primary" onClick={save} disabled={saving}>{saving ? 'กำลังบันทึก…' : 'บันทึกโปรไฟล์'}</button></div>{notice && <p role="status">{notice}</p>}</div></div>}
  </section>;
}
