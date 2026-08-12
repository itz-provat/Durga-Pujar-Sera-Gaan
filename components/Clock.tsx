"use client";

import { useEffect, useState } from "react";

const formatClock = () =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());

export function Clock() {
  const [time, setTime] = useState(formatClock);

  useEffect(() => {
    const id = window.setInterval(() => setTime(formatClock()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const match = time.match(/^(.*?)(:)(.*)$/);

  return (
    <div aria-label={`Current time ${time}`} className="text-xs font-medium tracking-[0.16em] text-white/80">
      {match ? (
        <>
          <span>{match[1]}</span>
          <span className="clock-colon">{match[2]}</span>
          <span>{match[3]}</span>
        </>
      ) : time}
    </div>
  );
}
