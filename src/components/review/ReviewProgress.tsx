'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface ReviewProgressProps {
  currentIndex: number;
  totalCards: number;
  relearnCount: number;
  deckName: string;
  onExit: () => void;
}

export default function ReviewProgress({
  currentIndex,
  totalCards,
  relearnCount,
  deckName,
  onExit,
}: ReviewProgressProps) {
  const shouldReduceMotion = useReducedMotion();
  const safeTotal = Math.max(1, totalCards);
  const progressPercent = Math.min(100, Math.round(((currentIndex) / safeTotal) * 100));

  return (
    <div className="w-full space-y-3 select-none">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 text-xs font-semibold transition-colors cursor-pointer group"
            title="Exit Review Session (Esc)"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Exit</span>
            <kbd className="hidden md:inline-block ml-1 px-1 py-0.2 bg-muted rounded text-[9px] text-muted-foreground border border-border/60">
              Esc
            </kbd>
          </button>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
              <span className="truncate">{deckName}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <Sparkles className="h-2.5 w-2.5" /> Active Recall
              </span>
            </h2>
          </div>
        </div>

        {/* Counter Indicators */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          {relearnCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold tabular-nums">
              {relearnCount} again
            </span>
          )}
          <span className="text-muted-foreground text-[11px]">
            Card <strong className="text-foreground tabular-nums">{Math.min(currentIndex + 1, totalCards)}</strong> of{' '}
            <strong className="text-foreground tabular-nums">{totalCards}</strong>
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full bg-muted/40 h-2 rounded-full overflow-hidden border border-border/50">
        <motion.div
          className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 400, damping: 32 }
          }
        />
      </div>
    </div>
  );
}
