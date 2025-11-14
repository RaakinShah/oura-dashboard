'use client';

import { motion } from 'framer-motion';

interface ActivityRingProps {
  label: string;
  value: number;
  max: number;
  color: string;
  delay?: number;
}

export function ActivityRing({ label, value, max, color, delay = 0 }: ActivityRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center group cursor-pointer"
    >
      {/* Ring */}
      <div className="relative">
        <svg width="120" height="120" className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />

          {/* Progress Circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ delay: delay + 0.3, duration: 1.5, ease: 'easeOut' }}
            className="drop-shadow-lg"
          />
        </svg>

        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.4 }}
            className="text-2xl font-bold text-stone-900"
          >
            {value}
          </motion.span>
          <span className="text-xs text-stone-500">/ {max}</span>
        </div>
      </div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.6, duration: 0.3 }}
        className="mt-3 text-sm font-medium text-stone-700"
      >
        {label}
      </motion.p>

      {/* Percentage */}
      <span className="text-xs text-stone-500 mt-1">
        {percentage.toFixed(0)}%
      </span>
    </motion.div>
  );
}
