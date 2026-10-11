import React, {useEffect, useMemo, useState} from 'react';
import {normalizeAnimeSearch} from '@/lib/searchNormalization';
import './anime-news.css';

const categories = {all: 'ทุกข่าว', announcement: 'ประกาศใหม่', trailer: 'ตัวอย่าง', release: 'วันฉาย', industry: 'วงการอนิเมะ', event: 'อีเวนต์'};
const symbols = {announcement: '✦', trailer: '▷', release: '◷', industry: '◈', event: '✧'};
const date = value => new Intl.DateTimeFormat('th-TH', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok'}).format(new Date(value));
const remoteDigest = 'https://raw.githubusercontent.com/bfirstkok/OtoVerse/main/public/anime-news.json';

function validDigest(data) {
  return Array.isArray(data?.items) && Number.isFinite(Date.parse(data.updatedAt))
    && data.items.every(item => item.id && item.title && item.summary && Number.isFinite(Date.parse(item.publishedAt))
      && /^https:\/\/((?:www\.)?animenewsnetwork\.com|(?:www\.)?crunchyroll\.com)\//.test(item.url));
}

function NewsImage({item}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item.imageUrl]);
  return <div className={`ov-news-art art-${item.category || 'announcement'} ${item.imageUrl && !failed ? 'has-news-image' : ''}`}>
    {item.imageUrl && !failed ? <img src={item.imageUrl} alt={item.titleOriginal} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)}/> : <span aria-hidden="true">{symbols[item.category] || '✦'}</span>}
    <small>{categories[item.category] || 'ประกาศใหม่'}</small><i aria-hidden="true">OTO / NEWS</i>
  </div>;
}

export default function AnimeNews({standalone = false}) {
  const [digest, setDigest] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [query, setQuery] = useState(''), [category, setCategory] = useState('all'), [source, setSource] = useState('all');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); let mounted = true;
    setLoading(true); setError('');
    // Read the scheduled digest directly so news updates do not require redeploying the game.
    const load = async url => {
      const response = await fetch(url, {signal: controller.signal, cache: 'no-cache'});
      if (!response.ok) throw new Error('unavailable');
      const data = await response.json(); if (!validDigest(data)) throw new Error('invalid'); return data;
    };
    (async () => {
      let loaded = false;
      await Promise.allSettled([remoteDigest, '/anime-news.json'].map(async url => {
        const data = await load(url);
        if (!mounted) return;
        loaded = true;
        setDigest(previous => !previous || Date.parse(data.updatedAt) > Date.parse(previous.updatedAt) ? data : previous);
      }));
      if (mounted) {
        if (!loaded) setError('ยังโหลดข่าวไม่ได้ ลองอีกครั้งได้เลย');
        setLoading(false);
      }
    })();
    const timeout = setTimeout(() => controller.abort(), 20000);
    return () => {mounted = false; clearTimeout(timeout); controller.abort();};
  }, [reload]);

  const items = useMemo(() => (digest?.items || []).filter(item =>
    (category === 'all' || item.category === category) && (source === 'all' || item.sourceId === source)
    && normalizeAnimeSearch([item.title, item.titleOriginal, item.summary].join(' ')).includes(normalizeAnimeSearch(query))), [digest, query, category, source]);
  const stale = digest && Date.now() - Date.parse(digest.updatedAt) > 12 * 3600000;

  return <div className={`ov-news ${standalone ? 'ov-news-standalone' : ''}`}>
    {standalone && <nav className="ov-news-nav"><a href="/">← กลับ OtoVerse</a><span>OTOVERSE / NEWS</span></nav>}
    <header className="ov-news-hero"><div><span className="ov-news-eyebrow">THE ANIME BRIEF</span><h1>ข่าวสารอนิเมะ<br/><em>อ่านง่าย ไม่ตกเรื่องใหม่</em></h1><p>ประกาศใหม่ ตัวอย่าง และวันฉาย<br/>รวมข่าวจากต้นทาง สรุปให้เป็นภาษาไทยด้วย AI</p></div><div className="ov-news-orbit" aria-hidden="true"><span>✦</span><i>NEWS</i></div><div className="ov-news-status"><span>✦ สรุปด้วย AI</span><span>อัปเดตเป็นรอบทุก 6 ชั่วโมง</span>{digest && <time dateTime={digest.updatedAt}>อัปเดต {date(digest.updatedAt)} · {new Date(digest.updatedAt).toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok'})}</time>}</div></header>
    <div className="ov-news-tools"><label className="ov-news-search"><span>⌕</span><input type="search" aria-label="ค้นหาข่าวสารอนิเมะ" placeholder="ค้นหาชื่อเรื่องหรือข่าวที่สนใจ…" value={query} onChange={e => setQuery(e.target.value)}/></label><label className="ov-news-source">แหล่งข่าว<select aria-label="เลือกแหล่งข่าว" value={source} onChange={e => setSource(e.target.value)}><option value="all">ทุกแหล่งข่าว</option><option value="ann">Anime News Network</option><option value="crunchyroll">Crunchyroll</option></select></label></div>
    <div className="ov-news-categories">{Object.entries(categories).map(([key, label]) => <button key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>)}</div>
    <div className="ov-news-caption"><span>ข่าวล่าสุด <b>{items.length}</b> ข่าว</span><p>สรุปจากหัวข้อและข้อความย่อในฟีด · อ่านรายละเอียดครบที่ต้นทาง</p></div>
    {stale && <p className="ov-news-notice">กำลังแสดงข่าวที่อัปเดตล่าสุดเมื่อ {date(digest.updatedAt)} รอบอัปเดตใหม่อาจล่าช้า</p>}
    {!!digest?.unavailableSources?.length && <p className="ov-news-notice">รอบนี้ดึงข่าวจาก {digest.unavailableSources.join(', ')} ไม่สำเร็จ</p>}
    {error && <div role="alert" className="ov-news-empty"><h2>{error}</h2><button onClick={() => setReload(n => n + 1)}>ลองโหลดอีกครั้ง</button></div>}
    {loading && !digest && <div className="ov-news-grid" aria-label="กำลังโหลดข่าว">{[0,1,2].map(n => <div className="ov-news-skeleton" key={n}/>)}</div>}
    {!loading && !error && !items.length && <div className="ov-news-empty"><h2>ยังไม่พบข่าวที่ค้นหา</h2><p>ลองเปลี่ยนคำค้นหรือเลือกทุกหมวด</p><button onClick={() => {setQuery('');setCategory('all');setSource('all');}}>ล้างตัวกรอง</button></div>}
    <div className="ov-news-grid">{items.map((item, i) => <article key={item.id} className={`ov-news-card ${i === 0 && category === 'all' && !query ? 'is-featured' : ''}`}><NewsImage item={item}/><div className="ov-news-copy"><div className="ov-news-meta"><span>{item.source}</span><time dateTime={item.publishedAt}>{date(item.publishedAt)}</time></div><h2>{item.title}</h2><p>{item.summary}</p><details><summary>ดูหัวข้อภาษาต้นฉบับ</summary><p lang="en">{item.titleOriginal}</p></details><footer><span>{item.summaryBasis === 'headline' ? 'AI แปลหัวข้อข่าว' : 'AI สรุปข้อความย่อ'}</span><a href={item.url} target="_blank" rel="noopener noreferrer">อ่านต้นฉบับ ↗</a></footer></div></article>)}</div>
    <div className="ov-news-bottom">ต้นทางข่าว: <a href="https://www.animenewsnetwork.com/news/" target="_blank" rel="noreferrer">Anime News Network</a> · <a href="https://www.crunchyroll.com/news" target="_blank" rel="noreferrer">Crunchyroll News</a><br/>วันที่บนการ์ดคือวันที่เผยแพร่ข่าวต้นฉบับ · สรุป AI อาจคลาดเคลื่อน โปรดตรวจรายละเอียดจากต้นทาง</div>
  </div>;
}
