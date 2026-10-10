import React, { useEffect, useRef, useState } from "react";
import "./web-mascot.css";

const STORAGE_KEY = "otoverse-mascot-hidden";

export default function WebMascot() {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });
  const [message,setMessage] = useState("เพลงนี้คุ้น ๆ ใช่ไหม? ♪");
  const [reaction,setReaction] = useState("");
  const [greeting, setGreeting] = useState(false);
  const [pose, setPose] = useState({ x: 24, direction: 1, walking: false });
  const greetingTimer = useRef(null);

  useEffect(() => () => clearTimeout(greetingTimer.current), []);
  useEffect(() => {
    const react = event => {
      if(hidden)return;
      const outcome=event.detail?.outcome;
      if(!['correct','wrong','skip'].includes(outcome))return;
      setMessage(outcome==='correct'?'เก่งมาก! เพลงนี้ใช่เลย ✦':outcome==='wrong'?'ไม่เป็นไร ลองเพลงถัดไปกันนะ ♡':'เก็บเพลงนี้ไว้ลองฟังทีหลังนะ ♪');
      setReaction(outcome);setGreeting(true);clearTimeout(greetingTimer.current);
      greetingTimer.current=setTimeout(()=>{setGreeting(false);setReaction('');},3200);
    };
    window.addEventListener('otoverse:answer',react);
    return ()=>window.removeEventListener('otoverse:answer',react);
  },[hidden]);

  useEffect(() => {
    if (hidden) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = preference.matches;
    const updatePreference = () => { reducedMotion = preference.matches; };
    preference.addEventListener("change", updatePreference);
    let previous = performance.now();
    let elapsed = 0;
    const timer = setInterval(() => {
      const now = performance.now();
      const delta = Math.min((now - previous) / 1000, .2);
      previous = now;
      if (document.hidden) return;
      elapsed += delta;
      const walking = !reducedMotion && !greeting && elapsed % 18 < 13;
      setPose(current => {
        const max = Math.max(12, window.innerWidth - 110);
        let x = Math.min(max, Math.max(12, current.x));
        let direction = current.direction;
        if (walking) {
          x += direction * delta * 26;
          if (x >= max) { x = max; direction = -1; }
          if (x <= 12) { x = 12; direction = 1; }
        }
        return { x, direction, walking };
      });
    }, 100);
    return () => { clearInterval(timer); preference.removeEventListener("change", updatePreference); };
  }, [hidden, greeting]);

  function toggleHidden(value) {
    setHidden(value);
    try { localStorage.setItem(STORAGE_KEY, value ? "1" : "0"); } catch { /* Optional preference. */ }
  }

  function greet() {
    setMessage("เพลงนี้คุ้น ๆ ใช่ไหม? ♪");setReaction("");
    setGreeting(true);
    clearTimeout(greetingTimer.current);
    greetingTimer.current = setTimeout(() => setGreeting(false), 2800);
  }

  if (hidden) return <button className="oto-mascot-restore" onClick={() => toggleHidden(false)} aria-label="แสดงมาสคอต">♫</button>;

  return (
    <div className={`oto-mascot ${pose.walking ? "is-walking" : ""} ${greeting ? "is-greeting" : ""} ${reaction === "correct" ? "is-celebrating" : ""}`} style={{ left: pose.x }}>
      {greeting ? <div className="oto-mascot-bubble" role="status" style={{ left: Math.max(8 - pose.x, Math.min(-10, window.innerWidth - pose.x - 168)) }}>{message}</div> : null}
      <button className="oto-mascot-hide" onClick={() => toggleHidden(true)} aria-label="ซ่อนมาสคอต" title="ซ่อนมาสคอต">×</button>
      <button className="oto-mascot-character" onClick={greet} aria-label="ทักทายมาสคอต OtoVerse" title="ทักทายมาสคอต" style={{ transform: `scaleX(${pose.direction})` }}>
        <span className="oto-mascot-sprite" aria-hidden="true" />
      </button>
    </div>
  );
}
