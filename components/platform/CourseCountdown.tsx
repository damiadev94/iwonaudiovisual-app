"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function diffToParts(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: false,
  };
}

export function CourseCountdown({
  releaseAt,
  size = "sm",
  onDone,
}: {
  releaseAt: string;
  size?: "sm" | "lg";
  onDone?: () => void;
}) {
  const targetMs = new Date(releaseAt).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => diffToParts(targetMs));

  useEffect(() => {
    const id = setInterval(() => {
      const next = diffToParts(targetMs);
      setTimeLeft(next);
      if (next.done) {
        clearInterval(id);
        onDone?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs, onDone]);

  const items = [
    { label: "Días", val: timeLeft.days },
    { label: "Hs", val: timeLeft.hours },
    { label: "Min", val: timeLeft.minutes },
    { label: "Seg", val: timeLeft.seconds },
  ];

  if (size === "lg") {
    return (
      <div className="flex gap-3 md:gap-5">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl w-16 h-16 md:w-24 md:h-24 flex items-center justify-center shadow-2xl">
              <span className="text-2xl md:text-5xl font-black text-gold tabular-nums">
                {item.val.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="mt-1.5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // size === "sm" — inline compact
  return (
    <div className="flex items-center gap-1.5 tabular-nums font-mono text-sm font-bold text-gold">
      <span>{timeLeft.days.toString().padStart(2, "0")}d</span>
      <span className="text-muted-foreground">:</span>
      <span>{timeLeft.hours.toString().padStart(2, "0")}h</span>
      <span className="text-muted-foreground">:</span>
      <span>{timeLeft.minutes.toString().padStart(2, "0")}m</span>
      <span className="text-muted-foreground">:</span>
      <span>{timeLeft.seconds.toString().padStart(2, "0")}s</span>
    </div>
  );
}
