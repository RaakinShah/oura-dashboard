'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

interface ActivityRingProps {
  label: string;
  value: number;
  max: number;
  color: string;
  delay?: number;
}

export const ActivityRing = memo(function ActivityRing({ label, value, max, color, delay = 0 }: ActivityRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }}
      className="flex flex-col items-center group cursor-pointer"
    >
      {/* Ring */}
      <div className="relative">
        <svg width="140" height="140" className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />

          {/* Progress Circle */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ delay: delay + 0.3, duration: 1.5, ease: 'easeOut' }}
            className="drop-shadow-xl group-hover:drop-shadow-2xl transition-all duration-300"
          />
        </svg>

        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.4 }}
            className="text-3xl font-black text-stone-900 tracking-tight"
          >
            {value}
          </motion.span>
          <span className="text-xs text-stone-500 font-semibold mt-0.5">/ {max}</span>
        </div>
      </div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.6, duration: 0.3 }}
        className="mt-4 text-sm font-bold text-stone-900 tracking-wide"
      >
        {label}
      </motion.p>

      {/* Percentage */}
      <span className="text-xs text-stone-500 mt-1.5 font-semibold">
        {percentage.toFixed(0)}%
      </span>
    </motion.div>
  );
});
