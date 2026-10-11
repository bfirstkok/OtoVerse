import React, { useCallback, useEffect, useRef, useState } from "react";
import "./web-mascot.css";
import MascotChat from "./MascotChat";
import { createLinePicker } from "./mascotLines";

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
  const pickLine = useRef(createLinePicker());
  const lastSpoken = useRef(0);
  const character = useRef(null);
  const [chatOpen, setChatOpen] = useState(false);
  const closeChat = useCallback(() => { setChatOpen(false); character.current?.focus(); }, []);
  const speak = useCallback((category, outcome = '') => {
    lastSpoken.current = Date.now();
    setMessage(pickLine.current(category));
    setReaction(outcome);
    setGreeting(true);
    clearTimeout(greetingTimer.current);
    greetingTimer.current = setTimeout(() => { setGreeting(false); setReaction(''); }, 6500);
  }, []);

  useEffect(() => {
    if (hidden || chatOpen) {
      clearTimeout(greetingTimer.current);
      setGreeting(false);
      setReaction('');
      return;
    }
    const available = () => !document.hidden && !document.querySelector('[role="dialog"]') && !['play', 'online'].includes(window.history.state?.page);
    const welcome = setTimeout(() => {
      if (!lastSpoken.current && available()) speak('welcome');
    }, 5000);
    const idle = setInterval(() => {
      // Keep spontaneous chatter out of an active round and other dialogs.
      if (available() && Date.now() - lastSpoken.current >= 60000) speak('idle');
    }, 15000);
    return () => { clearTimeout(welcome); clearInterval(idle); };
  }, [hidden, chatOpen, speak]);

  useEffect(() => () => clearTimeout(greetingTimer.current), []);
  useEffect(() => {
    const react = event => {
      if(hidden || chatOpen || document.hidden)return;
      const outcome=event.detail?.outcome;
      if(!['correct','wrong','skip'].includes(outcome))return;
      speak(outcome, outcome);
    };
    window.addEventListener('otoverse:answer',react);
    return ()=>window.removeEventListener('otoverse:answer',react);
  },[hidden, chatOpen, speak]);

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
      const walking = !reducedMotion && !greeting && !chatOpen && elapsed % 18 < 13;
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
  }, [hidden, greeting, chatOpen]);

  function toggleHidden(value) {
    setHidden(value);
    if (value) setChatOpen(false);
    try { localStorage.setItem(STORAGE_KEY, value ? "1" : "0"); } catch { /* Optional preference. */ }
  }

  if (hidden) return <button className="oto-mascot-restore" onClick={() => toggleHidden(false)} aria-label="แสดงมาสคอต">♫</button>;

  return (
    <>
    <div className={`oto-mascot ${pose.walking ? "is-walking" : ""} ${greeting ? "is-greeting" : ""} ${reaction === "correct" ? "is-celebrating" : ""}`} style={{ left: pose.x }}>
      {greeting ? <div className="oto-mascot-bubble" role="status" style={{ left: Math.max(8 - pose.x, Math.min(-10, window.innerWidth - pose.x - 168)) }}>{message}</div> : null}
      <button className="oto-mascot-hide" onClick={() => toggleHidden(true)} aria-label="ซ่อนมาสคอต" title="ซ่อนมาสคอต">×</button>
      <button className="oto-mascot-character" ref={character} onClick={() => setChatOpen(value => !value)} aria-expanded={chatOpen} aria-label="คุยกับน้องอ๊อตโต่ะ" title="คุยกับน้องอ๊อตโต่ะ" style={{ transform: `scaleX(${pose.direction})` }}>
        <span className="oto-mascot-sprite" aria-hidden="true" />
      </button>
    </div>
    <MascotChat open={chatOpen} onClose={closeChat}/>
    </>
  );
}
