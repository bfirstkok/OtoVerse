import React, { useState } from "react";

export default function PlayerAvatar({ src, name }) {
  const [failedSource, setFailedSource] = useState(null);
  const source = String(src || "").trim();
  const initial = Array.from(String(name || "").trim())[0] || "?";
  return <div className="oto-rank-avatar" aria-hidden="true">
    {source && source !== failedSource ? <img key={source} src={source} alt="" draggable={false} referrerPolicy="no-referrer" onError={() => setFailedSource(source)} /> : <span>{initial}</span>}
  </div>;
}
