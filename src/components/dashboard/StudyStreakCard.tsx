'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Brain, Clock, Layers, Sparkles } from 'lucide-react';

interface DayCadence {
  label: string;      // 'M', 'T', 'W', etc.
  fullName: string;   // 'Monday', 'Tuesday', etc.
  status: 'completed' | 'active' | 'upcoming';
  reviewsCount?: number;
  focusMinutes?: number;
}

interface StudyStreakCardProps {
  streakDays?: number;
  totalCardsReviewed?: number;
  totalStudyTime?: string;
  className?: string;
}

export default function StudyStreakCard({
  streakDays = 14,
  totalCardsReviewed = 428,
  totalStudyTime = '12h 42m',
  className = '',
}: StudyStreakCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredDay, setHoveredDay] = useState<DayCadence | null>(null);

  // 7-day weekly cadence (Mon - Sun)
  const weekDays: DayCadence[] = [
    { label: 'M', fullName: 'Monday', status: 'completed', reviewsCount: 64, focusMinutes: 50 },
    { label: 'T', fullName: 'Tuesday', status: 'completed', reviewsCount: 48, focusMinutes: 45 },
    { label: 'W', fullName: 'Wednesday', status: 'completed', reviewsCount: 72, focusMinutes: 60 },
    { label: 'T', fullName: 'Thursday', status: 'completed', reviewsCount: 56, focusMinutes: 40 },
    { label: 'F', fullName: 'Friday', status: 'completed', reviewsCount: 80, focusMinutes: 75 },
    { label: 'S', fullName: 'Saturday', status: 'completed', reviewsCount: 62, focusMinutes: 55 },
    { label: 'S', fullName: 'Sunday', status: 'upcoming', reviewsCount: 0, focusMinutes: 0 },
  ];

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 380, damping: 30 }}
      className={`glass-panel rounded-3xl p-6 sm:p-7 border border-border/70 bg-card/90 shadow-xl relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Subtle background ambient gradient accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-amber-500/8 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Section: Header & Streak Count */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            <Brain className="h-3.5 w-3.5 text-indigo-400" /> Cognitive Rhythm
          </span>
          <span className="text-[11px] font-medium text-muted-foreground/80">
            Current Cadence
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-4 mt-1">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Study Streak
            </h3>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                <span className="text-amber-500 drop-shadow-sm select-none">🔥</span>
                <span>{streakDays} days</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="h-3 w-3" /> Unbroken
            </span>
          </div>
        </div>

        {/* 7-Day Weekly Cadence Track: M T W T F S S */}
        <div className="mt-6 pt-5 border-t border-border/40">
          <div className="flex items-center justify-between gap-1">
            {weekDays.map((day, idx) => {
              const isCompleted = day.status === 'completed';

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 cursor-pointer group relative py-1"
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground font-mono group-hover:text-foreground transition-colors">
                    {day.label}
                  </span>

                  {/* Day Indicator Dot */}
                  <motion.div
                    whileHover={{ scale: 1.25 }}
                    className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-xs shadow-amber-500/20'
                        : 'border border-dashed border-border/80 text-muted-foreground/40'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Micro-insight / Hover readout */}
          <div className="h-5 mt-2 flex items-center justify-center">
            {hoveredDay ? (
              <motion.p
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-muted-foreground text-center font-medium"
              >
                <strong className="text-foreground">{hoveredDay.fullName}</strong>:{' '}
                {hoveredDay.status === 'completed'
                  ? `${hoveredDay.reviewsCount} cards · ${hoveredDay.focusMinutes}m focus`
                  : 'Planned study session'}
              </motion.p>
            ) : (
              <p className="text-[11px] text-muted-foreground/70 text-center">
                6 of 7 days completed this cycle
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row: Cards Reviewed & Study Time */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-border/40">
        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Cards reviewed</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-foreground">
            {totalCardsReviewed}
          </div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">
            Active recall events
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Study time</span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-foreground">
            {totalStudyTime}
          </div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">
            Deep focus logged
          </div>
        </div>
      </div>

      {/* Cognitive Anchor: consistency → retention → mastery */}
      <div className="mt-6 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          <span>Philosophy</span>
          <span className="text-[10px] lowercase font-normal text-muted-foreground/70 font-mono">
            spaced repetition
          </span>
        </div>

        {/* 3-stage progression chain */}
        <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-between text-xs font-semibold">
          <span className="text-amber-400 font-bold">consistency</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          <span className="text-indigo-400 font-bold">retention</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          <span className="text-purple-400 font-bold">mastery</span>
        </div>

        <p className="text-[11px] text-muted-foreground/80 text-center mt-2.5 leading-relaxed">
          Daily active recall stabilizes memories against the forgetting curve without artificial gamification.
        </p>
      </div>
    </motion.div>
  );
}
