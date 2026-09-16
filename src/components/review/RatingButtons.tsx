'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SM2Rating } from '@/lib/sm2';

interface RatingButtonsProps {
  intervalPreviews: Record<SM2Rating, string>;
  onRate: (rating: SM2Rating) => void;
  disabled?: boolean;
}

interface RatingOption {
  key: SM2Rating;
  label: string;
  sublabel: string;
  hotkey: string;
  colorClass: string;
  badgeClass: string;
  glowClass: string;
}

const RATING_OPTIONS: RatingOption[] = [
  {
    key: 'again',
    label: 'Again',
    sublabel: 'Forgot / Fail',
    hotkey: '1',
    colorClass: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
    glowClass: 'hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.25)]',
  },
  {
    key: 'hard',
    label: 'Hard',
    sublabel: 'Hesitant',
    hotkey: '2',
    colorClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    glowClass: 'hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.25)]',
  },
  {
    key: 'good',
    label: 'Good',
    sublabel: 'Recalled',
    hotkey: '3',
    colorClass: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-400 dark:text-indigo-300',
    badgeClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
    glowClass: 'hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.25)]',
  },
  {
    key: 'easy',
    label: 'Easy',
    sublabel: 'Effortless',
    hotkey: '4',
    colorClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    glowClass: 'hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.25)]',
  },
];

export default function RatingButtons({
  intervalPreviews,
  onRate,
  disabled = false,
}: RatingButtonsProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full space-y-2">
      <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        How well did you remember?
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {RATING_OPTIONS.map((opt, index) => {
          const preview = intervalPreviews[opt.key] || '<1m';

          return (
            <motion.button
              key={opt.key}
              type="button"
              disabled={disabled}
              onClick={() => onRate(opt.key)}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 14, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 10, scale: 0.98 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.08 }
                  : {
                      type: 'spring',
                      stiffness: 450,
                      damping: 28,
                      delay: index * 0.035, // fast, non-blocking stagger
                    }
              }
              whileHover={shouldReduceMotion ? {} : { scale: 1.025, y: -2 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col items-center justify-between gap-1.5 transition-shadow cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none ${opt.colorClass} ${opt.glowClass}`}
            >
              {/* Header row: Hotkey badge & Label */}
              <div className="flex items-center justify-between w-full">
                <span className="font-extrabold text-sm tracking-tight">{opt.label}</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-card/70 border border-current/20 text-[10px] font-mono font-bold leading-none">
                  {opt.hotkey}
                </kbd>
              </div>

              {/* Sublabel / Sentiment hint */}
              <span className="text-[10px] opacity-75 font-medium self-start">
                {opt.sublabel}
              </span>

              {/* Dynamic SM-2 Interval Preview Badge */}
              <div className="w-full pt-1.5 border-t border-current/15 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60">
                  Next
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${opt.badgeClass}`}
                >
                  {preview}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
