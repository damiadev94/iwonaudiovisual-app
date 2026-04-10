"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface SelectionTimerProps {
  closeDate: string;
}

export function SelectionTimer({ closeDate }: SelectionTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculate() {
      const now = new Date().getTime();
      const end = new Date(closeDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [closeDate]);

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gold/5 border border-gold/20">
      <Clock className="h-5 w-5 text-gold shrink-0" />
      <div className="flex gap-4">
        {[
          { value: timeLeft.days, label: "dias" },
          { value: timeLeft.hours, label: "hrs" },
          { value: timeLeft.minutes, label: "min" },
          { value: timeLeft.seconds, label: "seg" },
        ].map((unit) => (
          <div key={unit.label} className="text-center">
            <p className="text-2xl font-bold font-mono text-gold">{String(unit.value).padStart(2, "0")}</p>
            <p className="text-xs text-muted-foreground">{unit.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
