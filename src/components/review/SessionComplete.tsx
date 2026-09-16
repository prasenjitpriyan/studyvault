'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Trophy, RotateCcw, ArrowLeft, Flame, Clock } from 'lucide-react';
import { SM2Rating } from '@/lib/sm2';

export interface SessionSummaryStats {
  totalReviewed: number;
  durationSeconds: number;
  ratingCounts: Record<SM2Rating, number>;
}

interface SessionCompleteProps {
  deckName: string;
  stats: SessionSummaryStats;
  onRestart: () => void;
  onExit: () => void;
}

export default function SessionComplete({
  deckName,
  stats,
  onRestart,
  onExit,
}: SessionCompleteProps) {
  const shouldReduceMotion = useReducedMotion();

  const total = Math.max(1, stats.totalReviewed);
  const passedCards = (stats.ratingCounts.good || 0) + (stats.ratingCounts.easy || 0);
  const accuracyPercent = Math.round((passedCards / total) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  // Circular gauge calculations
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracyPercent / 100) * circumference;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.1 }
          : { type: 'spring', stiffness: 380, damping: 28 }
      }
      className="w-full max-w-lg mx-auto glass-panel bg-card/95 rounded-3xl border border-indigo-500/30 p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Trophy Badge */}
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-2xl bg-linear-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
          <Trophy className="h-8 w-8 animate-bounce" />
        </div>
      </div>

      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 dark:text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Review Session Complete
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-3 tracking-tight">
          Outstanding Work!
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          You finished reviewing <span className="font-bold text-foreground">{deckName}</span>.
        </p>
      </div>

      {/* Accuracy Ring & Duration */}
      <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/50">
        {/* Radial Accuracy Gauge */}
        <div className="flex flex-col items-center justify-center p-3">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-muted"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-indigo-500"
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                initial={shouldReduceMotion ? false : { strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 180, damping: 24, delay: 0.2 }
                }
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-foreground font-mono">
                {accuracyPercent}%
              </span>
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                Accuracy
              </span>
            </div>
          </div>
        </div>

        {/* Time and Cards Metrics */}
        <div className="flex flex-col justify-center space-y-3 p-3 text-left">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Study Time</p>
              <p className="text-sm font-bold text-foreground font-mono">
                {formatTime(stats.durationSeconds)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Cards Reviewed</p>
              <p className="text-sm font-bold text-foreground font-mono">
                {stats.totalReviewed} cards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Pills */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <span className="block font-black text-sm">{stats.ratingCounts.again || 0}</span>
          <span className="text-[9px] uppercase font-semibold">Again</span>
        </div>
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <span className="block font-black text-sm">{stats.ratingCounts.hard || 0}</span>
          <span className="text-[9px] uppercase font-semibold">Hard</span>
        </div>
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <span className="block font-black text-sm">{stats.ratingCounts.good || 0}</span>
          <span className="text-[9px] uppercase font-semibold">Good</span>
        </div>
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span className="block font-black text-sm">{stats.ratingCounts.easy || 0}</span>
          <span className="text-[9px] uppercase font-semibold">Easy</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-card border border-border hover:bg-muted font-bold text-xs text-foreground transition-all cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Re-Study Deck</span>
        </button>
        <button
          onClick={onExit}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Decks</span>
        </button>
      </div>
    </motion.div>
  );
}
