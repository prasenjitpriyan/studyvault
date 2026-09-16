'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion, PanInfo } from 'motion/react';
import { HelpCircle, Eye, CornerDownLeft, Sparkles } from 'lucide-react';
import { SM2Rating } from '@/lib/sm2';

export interface CardData {
  _id: string;
  front: string;
  back: string;
  repetitions?: number;
  interval?: number;
  easeFactor?: number;
  nextReview?: string;
}

interface ReviewCardProps {
  card: CardData;
  isRevealed: boolean;
  onReveal: () => void;
  onSwipeRate?: (rating: SM2Rating) => void;
  lastRatingDirection?: SM2Rating | null;
  remainingQueueLength: number;
}

export default function ReviewCard({
  card,
  isRevealed,
  onReveal,
  onSwipeRate,
  lastRatingDirection,
  remainingQueueLength,
}: ReviewCardProps) {
  const shouldReduceMotion = useReducedMotion();

  // Exit animation directional mapping
  const exitVariants = {
    exit: (direction: SM2Rating | null) => {
      if (shouldReduceMotion) return { opacity: 0 };

      switch (direction) {
        case 'again':
          return { x: -260, y: 30, rotate: -8, opacity: 0, scale: 0.9 };
        case 'hard':
          return { y: 140, opacity: 0, scale: 0.92 };
        case 'good':
          return { x: 260, y: -20, rotate: 8, opacity: 0, scale: 0.9 };
        case 'easy':
          return { y: -160, x: 80, rotate: 5, opacity: 0, scale: 0.85 };
        default:
          return { opacity: 0, scale: 0.95 };
      }
    },
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!onSwipeRate || !isRevealed) return;

    const threshold = 120;
    if (info.offset.x > threshold) {
      // Swiped right -> Good
      onSwipeRate('good');
    } else if (info.offset.x < -threshold) {
      // Swiped left -> Again
      onSwipeRate('again');
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* ── Background Stack Depth Layers ── */}
      {remainingQueueLength > 1 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl bg-card/40 border border-border/30 transform translate-y-4 scale-[0.93] pointer-events-none transition-all"
        />
      )}
      {remainingQueueLength > 0 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl bg-card/60 border border-border/50 transform translate-y-2 scale-[0.965] pointer-events-none transition-all"
        />
      )}

      {/* ── Active Main Card ── */}
      <motion.div
        key={card._id}
        custom={lastRatingDirection}
        variants={exitVariants}
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.94, y: 16 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit="exit"
        transition={
          shouldReduceMotion
            ? { duration: 0.1 }
            : { type: 'spring', stiffness: 420, damping: 30 }
        }
        drag={isRevealed ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
        className="relative z-10 w-full min-h-85 sm:min-h-95 glass-panel bg-card/90 rounded-3xl border border-border/80 shadow-2xl flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        tabIndex={0}
        role="region"
        aria-label="Flashcard active review"
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !isRevealed) {
            e.preventDefault();
            onReveal();
          }
        }}
      >
        {/* Top Card Bar */}
        <div className="p-5 sm:p-6 pb-2 flex items-center justify-between border-b border-border/40 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-indigo-400">
            <HelpCircle className="h-3.5 w-3.5" /> Prompt / Question
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/80">
            {isRevealed ? 'Swipe left (Again) · right (Good)' : 'Press Space to Reveal'}
          </span>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
          <motion.div layout className="max-w-xl w-full">
            <p className="flashcard-text text-foreground font-semibold text-lg sm:text-xl leading-relaxed whitespace-pre-wrap wrap-break-word">
              {card.front}
            </p>
          </motion.div>

          {/* Answer Area (Spring Reveal) */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                key="answer-content"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.08 }
                    : { type: 'spring', stiffness: 450, damping: 28 }
                }
                className="w-full mt-6 pt-6 border-t border-indigo-500/20 text-center flex flex-col items-center"
              >
                <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-extrabold text-indigo-400 dark:text-indigo-300 mb-2.5 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  <Sparkles className="h-3 w-3" /> Answer
                </div>
                <p className="flashcard-text text-foreground/95 font-medium text-base sm:text-lg leading-relaxed whitespace-pre-wrap wrap-break-word max-w-xl">
                  {card.back}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Reveal Action Bar (Visible when not revealed) */}
        {!isRevealed && (
          <div className="p-4 sm:p-6 pt-0 flex justify-center">
            <motion.button
              type="button"
              onClick={onReveal}
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              className="w-full max-w-md flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 cursor-pointer transition-all"
            >
              <Eye className="h-4 w-4" />
              <span>Show Answer</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] opacity-80 font-mono font-normal ml-1.5 px-1.5 py-0.5 rounded bg-white/10">
                Space <CornerDownLeft className="h-2.5 w-2.5" />
              </span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
