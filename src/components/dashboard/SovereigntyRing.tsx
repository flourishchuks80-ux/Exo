"use client";

import { useEffect, useState } from "react";

interface SovereigntyRingProps {
  score: number;
  label: string;
  statusLine: string;
}

export function SovereigntyRing({ score, label, statusLine }: SovereigntyRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 200);
    return () => clearTimeout(timer);
  }, [score]);

  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const gap = circumference - progress;

  const scoreColor =
    score >= 80 ? "#00D4AA" : score >= 50 ? "#F59E0B" : score >= 25 ? "#3B82F6" : "#4F5E7A";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#192235"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${gap}`}
            style={{
              transition: "stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease",
              filter: `drop-shadow(0 0 8px ${scoreColor}60)`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold font-mono transition-all duration-1000"
            style={{ color: scoreColor }}
          >
            {animatedScore}
          </span>
          <span className="text-xs text-[#4F5E7A] mt-1">Sovereignty Score</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-[#F0F4FF]">{label}</p>
        <p className="text-xs text-[#8B9CC8] mt-1">{statusLine}</p>
      </div>
    </div>
  );
}
