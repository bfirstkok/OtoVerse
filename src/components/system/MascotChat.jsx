import React, { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";
import "./mascot-chat.css";

const INTRO = { role: "assistant", content: "สวัสดีค่ะ เราชื่อน้องอ๊อตโต่ะ ♡ ถามวิธีใช้ OtoVerse หรือคุยเรื่องอนิเมะกับเราได้เลย!" };
const ENDPOINT = import.meta.env.VITE_MASCOT_CHAT_URL || "https://otoverse-mascot-api.vercel.app/api/chat";
export default function MascotChat({ open, onClose }) {
  const [user, setUser] = useState(firebaseAuth?.currentUser || null);
  const [messages, setMessages] = useState([INTRO]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scroll = useRef(null), field = useRef(null), controller = useRef(null), pending = useRef(false);
  useEffect(() => { setMessages([INTRO]); setError(""); setInput(""); controller.current?.abort(); }, [user?.uid]);
  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    const escape = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", escape);
    const unsubscribe = firebaseAuth ? onAuthStateChanged(firebaseAuth, setUser) : () => {};
    return () => { unsubscribe(); controller.current?.abort(); window.removeEventListener("keydown", escape); };
  }, [open, onClose]);
  useEffect(() => { if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [messages, busy, error]);
  async function send(text = input) {
    text = text.trim();
    if (!text || pending.current || !user) return;
    pending.current = true; setBusy(true); setError("");
    const history = messages.slice(1).slice(-8);
    setMessages(previous => [...previous, { role: "user", content: text }]); setInput("");
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 45000);
    try {
      const token = await user.getIdToken();
      const response = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: text, history }), signal: controller.current.signal });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.reply) throw new Error(data.error || "น้องอ๊อตโต่ะยังเชื่อมต่อ AI ไม่ได้ ลองใหม่อีกครั้งนะคะ");
      setMessages(previous => [...previous, { role: "assistant", content: data.reply }]);
    } catch (e) { setInput(text); setError(e.name === "AbortError" ? "รอนานไปนิด ลองส่งใหม่อีกครั้งนะคะ" : e.message); }
    finally { clearTimeout(timeout); pending.current = false; setBusy(false); }
  }
  if (!open) return null;
  return <section className="oto-mascot-chat" role="dialog" aria-modal="false" aria-labelledby="mascot-chat-title">
    <header><img src="/otoverse-mascot-walk.webp" alt=""/><div><h2 id="mascot-chat-title">น้องอ๊อตโต่ะ</h2><p>เพื่อนคุยเรื่องอนิเมะ · ผู้ช่วย OtoVerse</p></div><button onClick={onClose} aria-label="ปิดแชท">×</button></header>
    <div className="oto-chat-messages" ref={scroll} role="log" aria-live="polite" aria-relevant="additions">
      {messages.map((m, i) => <div key={i} className={`oto-chat-message ${m.role}`}><span>{m.role === "assistant" ? "น้องอ๊อตโต่ะ" : "คุณ"}</span><p>{m.content}</p></div>)}
      {busy && <p className="oto-chat-thinking" role="status">น้องอ๊อตโต่ะกำลังคิด… ✦</p>}
      {error && <p className="oto-chat-error" role="alert">{error}</p>}
    </div>
    <div className="oto-chat-suggestions">{["เริ่มเล่นทายเพลงยังไง", "แนะนำอนิเมะให้หน่อย", "จัด Top 5 ตรงไหน"].map(q => <button key={q} disabled={!user || busy} onClick={() => send(q)}>{q}</button>)}</div>
    {!user ? <p className="oto-chat-login">เข้าสู่ระบบที่หน้าแรกก่อน เพื่อคุยกับน้องนะคะ <a href="/">ไปหน้าแรก →</a></p> : <form onSubmit={e => { e.preventDefault(); send(); }}><textarea ref={field} value={input} maxLength={800} rows={2} aria-label="คำถามถึงน้องอ๊อตโต่ะ" placeholder="ถามเรื่องอนิเมะหรือวิธีใช้เว็บ…" onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}/><button type="submit" disabled={busy || !input.trim()}>ส่ง ↗</button></form>}
    <small>คำตอบจาก AI อาจคลาดเคลื่อน · ไม่ต้องส่งข้อมูลส่วนตัว</small>
  </section>;
}
