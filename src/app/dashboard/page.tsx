'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Layers, CheckSquare, Play, Pause, RotateCcw, Clock, ArrowRight, Timer, Flame, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { gsap } from 'gsap';
import StudyStreakCard from '@/components/dashboard/StudyStreakCard';

interface DashboardStats {
  notesCount: number;
  decksCount: number;
  cardsToReview: number;
  tasksPending: number;
}

interface RecentNote {
  _id: string;
  title: string;
  folder: string;
  updatedAt: string;
}

interface PendingTask {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

interface DeckProgress {
  _id: string;
  name: string;
  cardCount: number;
  dueCount: number;
  mastery: number;
}

export default function DashboardPage() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<DashboardStats>({
    notesCount: 0,
    decksCount: 0,
    cardsToReview: 0,
    tasksPending: 0,
  });
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [deckProgress, setDeckProgress] = useState<DeckProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Focus Timer State
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [initialTime, setInitialTime] = useState(25 * 60); // 25 minutes in seconds

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [notesRes, decksRes, tasksRes] = await Promise.all([
          fetch('/api/notes'),
          fetch('/api/decks'),
          fetch('/api/tasks'),
        ]);

        if (notesRes.ok && decksRes.ok && tasksRes.ok) {
          const notesData = await notesRes.json();
          const decksData = await decksRes.json();
          const tasksData = await tasksRes.json();

          // Calculate cards to review across all decks
          let cardsToReviewCount = 0;
          const now = new Date();

          // Fetch flashcards for each deck to sum cards to review
          const decks = decksData.decks || [];
          const cardPromises = decks.map((deck: { _id: string }) => fetch(`/api/decks/${deck._id}/flashcards`));
          const cardResponses = await Promise.all(cardPromises);

          const progressList: DeckProgress[] = [];

          for (let i = 0; i < decks.length; i++) {
            const deck = decks[i];
            const res = cardResponses[i];
            if (res && res.ok) {
              const data = await res.json();
              const cards = data.flashcards || [];
              const reviews = cards.filter((c: { nextReview: string }) => new Date(c.nextReview) <= now);
              cardsToReviewCount += reviews.length;

              // Calculate deck mastery percentage based on repetitions
              const masteredCards = cards.filter((c: { repetitions?: number }) => (c.repetitions || 0) >= 2);
              const mastery = cards.length > 0 ? Math.round((masteredCards.length / cards.length) * 100) : 0;

              progressList.push({
                _id: deck._id,
                name: deck.name,
                cardCount: cards.length,
                dueCount: reviews.length,
                mastery,
              });
            }
          }

          const notes = notesData.notes || [];
          const tasks = tasksData.tasks || [];

          setStats({
            notesCount: notes.length,
            decksCount: decks.length,
            cardsToReview: cardsToReviewCount,
            tasksPending: tasks.filter((t: { status: string }) => t.status !== 'done').length,
          });

          setDeckProgress(progressList);
          setRecentNotes(notes.slice(0, 3));
          setPendingTasks(tasks.filter((t: { status: string }) => t.status !== 'done').slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Could not fetch dashboard statistics.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo('.gsap-dash-header',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );

      tl.fromTo('.gsap-dash-stat',
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.2)' },
        '-=0.3'
      );

      tl.fromTo('.gsap-dash-timer',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.2'
      );

      tl.fromTo('.gsap-dash-sidebar-panel',
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' },
        '-=0.4'
      );

      // Add interactive hover transforms to stats cards
      const statsCards = gsap.utils.toArray('.gsap-dash-stat') as HTMLElement[];
      statsCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { y: -4, scale: 1.015, borderColor: 'rgba(99, 102, 241, 0.4)', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.1)', duration: 0.25, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { y: 0, scale: 1, borderColor: '', boxShadow: '', duration: 0.25, ease: 'power2.out' });
        });
      });

      // Add interactive hover to list items
      const listItems = gsap.utils.toArray('.gsap-dash-item') as HTMLElement[];
      listItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
          gsap.to(item, { x: 4, backgroundColor: 'rgba(255, 255, 255, 0.03)', duration: 0.2, ease: 'power2.out' });
        });
        item.addEventListener('mouseleave', () => {
          gsap.to(item, { x: 0, backgroundColor: '', duration: 0.2, ease: 'power2.out' });
        });
      });
    }, dashboardRef);

    return () => ctx.revert();
  }, [isLoading]);

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Note A5
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.35); // 350ms beep
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  };

  // Pomodoro Timer Logic
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isTimerRunning) {
      intervalId = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds((prev) => prev - 1);
        } else if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            // Timer Finished
            playBeep();
            setIsTimerRunning(false);
            if (timerMode === 'work') {
              toast.success('Focus session finished! Time for a short break.');
              setTimerMode('break');
              setTimerMinutes(5);
              setInitialTime(5 * 60);
            } else {
              toast.success('Break finished! Let\'s get back to focus.');
              setTimerMode('work');
              setTimerMinutes(25);
              setInitialTime(25 * 60);
            }
          } else {
            setTimerMinutes((prev) => prev - 1);
            setTimerSeconds(59);
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerRunning, timerMinutes, timerSeconds, timerMode]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (timerMode === 'work') {
      setTimerMinutes(25);
      setTimerSeconds(0);
      setInitialTime(25 * 60);
    } else {
      setTimerMinutes(5);
      setTimerSeconds(0);
      setInitialTime(5 * 60);
    }
  };

  const switchMode = (mode: 'work' | 'break') => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    if (mode === 'work') {
      setTimerMinutes(25);
      setTimerSeconds(0);
      setInitialTime(25 * 60);
    } else {
      setTimerMinutes(5);
      setTimerSeconds(0);
      setInitialTime(5 * 60);
    }
  };

  // Helper values for timer progress bar
  const totalSecondsRemaining = timerMinutes * 60 + timerSeconds;
  const progressPercent = ((initialTime - totalSecondsRemaining) / initialTime) * 100;

  // Dynamic greeting and date formatting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  return (
    <div ref={dashboardRef} className="space-y-8">
      {/* Header Greeting */}
      <div className="gsap-dash-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground" suppressHydrationWarning>
            {greeting}, PD 👋
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1" suppressHydrationWarning>
            {formattedDate} &bull; Ready for your daily focus?
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame className="h-3.5 w-3.5" /> 7 Day Streak
          </span>
        </div>
      </div>

      {/* TODAY'S REVIEW HERO FOCUS CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 bg-linear-to-br from-indigo-950/40 via-card/90 to-purple-950/30 border border-indigo-500/30 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 dark:text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Today&apos;s Review Session
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {isLoading ? '...' : `${stats.cardsToReview} cards due`}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Optimized by the SuperMemo SM-2 spaced repetition scheduler.
              </p>
            </div>

            {/* Progress bar preview */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Today&apos;s Progress</span>
                <span className="text-indigo-400 font-mono">72%</span>
              </div>
              <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden border border-border/40">
                <div className="bg-linear-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[72%]" />
              </div>
            </div>

            {/* Estimated time & subject metrics */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                <span><strong className="text-foreground font-mono">{stats.decksCount}</strong> {stats.decksCount === 1 ? 'subject' : 'subjects'}</span>
              </div>
              <span className="text-border">&bull;</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Estimated: <strong className="text-foreground font-mono">{Math.max(5, Math.round(stats.cardsToReview * 1.8))} min</strong></span>
              </div>
              <span className="text-border">&bull;</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Target Retention: <strong className="text-foreground font-mono">84%</strong></span>
              </div>
            </div>
          </div>

          {/* Primary Action Button: Start Review */}
          <div className="shrink-0 flex flex-col items-stretch sm:items-start gap-2">
            <Link
              href="/dashboard/flashcards?action=practice"
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Start Review</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-[11px] text-muted-foreground text-center sm:text-left font-medium">
              Press Enter or tap to begin
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { name: 'Total Notes', value: stats.notesCount, icon: BookOpen, href: '/dashboard/notes', color: 'text-indigo-400' },
          { name: 'Flashcard Decks', value: stats.decksCount, icon: Layers, href: '/dashboard/flashcards', color: 'text-purple-400' },
          { name: 'Cards to Review', value: stats.cardsToReview, icon: Timer, href: '/dashboard/flashcards', color: 'text-amber-400' },
          { name: 'Pending Tasks', value: stats.tasksPending, icon: CheckSquare, href: '/dashboard/tasks', color: 'text-emerald-400' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="gsap-dash-stat glass-panel p-6 rounded-2xl flex items-center justify-between border border-border/40 cursor-pointer"
            >
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.name}</p>
                <h3 className="text-3xl font-extrabold mt-2 text-foreground">
                  {isLoading ? '...' : item.value}
                </h3>
              </div>
              <div className={`h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Continue Learning — Subject Mastery */}
      <div className="glass-panel rounded-2xl p-6 space-y-4 border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-indigo-400" /> Continue Learning
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subject mastery calculated from SM-2 spaced repetition retention history.
            </p>
          </div>
          <Link
            href="/dashboard/flashcards"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            All Decks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="text-xs text-muted-foreground py-6 text-center">Loading subjects...</div>
        ) : deckProgress.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border/60 rounded-xl">
            <p className="text-sm font-medium text-muted-foreground">No subjects found</p>
            <Link
              href="/dashboard/flashcards"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline mt-2 font-semibold"
            >
              Create your first deck <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deckProgress.map((deck) => (
              <div
                key={deck._id}
                className="p-4 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/50 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-indigo-400 transition-colors truncate">
                      {deck.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {deck.cardCount} cards {deck.dueCount > 0 ? `· ${deck.dueCount} due` : '· caught up'}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 shrink-0">
                    {deck.mastery}% mastery
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted/70 h-1.5 rounded-full overflow-hidden border border-border/30">
                  <div
                    className="bg-linear-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, deck.mastery)}%` }}
                  />
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <Link
                    href="/dashboard/flashcards?action=practice"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Study Deck <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Pomodoro Focus Timer Panel (Takes 2 Columns on desktop) */}
        <div className="gsap-dash-timer lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" /> Focus Session
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => switchMode('work')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  timerMode === 'work'
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 dark:text-indigo-300'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => switchMode('break')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  timerMode === 'break'
                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 dark:text-purple-300'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Break (5m)
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {/* Digital Clock display */}
            <div className="timer-display text-7xl md:text-8xl font-black font-mono tracking-tight mb-2 text-gradient">
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground mb-8 uppercase tracking-widest font-semibold">
              {timerMode === 'work' ? 'Time to Focus' : 'Take a Break'}
            </p>

            {/* Timer Actions */}
            <div className="flex gap-4">
              <button
                onClick={toggleTimer}
                className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="h-5 w-5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 fill-white" /> Start Focus
                  </>
                )}
              </button>
              <button
                onClick={resetTimer}
                className="bg-card hover:bg-muted border border-border text-foreground px-5 py-3.5 rounded-xl transition-all"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Simple Progress Bar */}
          <div className="w-full bg-muted h-1.5 rounded-full mt-6 overflow-hidden border border-border/50">
            <div
              className="bg-linear-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sidebar Cards Panel (Takes 1 Column) */}
        <div className="space-y-6">

          {/* Cognitive Rhythm & Study Streak Component */}
          <StudyStreakCard
            streakDays={14}
            totalCardsReviewed={428}
            totalStudyTime="12h 42m"
          />

          {/* Recent Notes Panel */}
          <div className="gsap-dash-sidebar-panel glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-indigo-400" /> Recent Notes
              </h3>
              <Link href="/dashboard/notes" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-sm text-muted-foreground py-3 text-center">Loading notes...</div>
              ) : recentNotes.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
                  No notes created yet.
                  <Link href="/dashboard/notes" className="text-indigo-400 hover:underline block text-xs mt-2 font-semibold">
                    Create your first note
                  </Link>
                </div>
              ) : (
                recentNotes.map((note) => (
                  <Link
                    key={note._id}
                    href="/dashboard/notes"
                    className="gsap-dash-item block p-3.5 bg-muted/20 border border-border/40 rounded-xl"
                  >
                    <h4 className="text-sm font-semibold truncate text-foreground">{note.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                        {note.folder}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Pending Tasks Panel */}
          <div className="gsap-dash-sidebar-panel glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold flex items-center gap-2">
                <CheckSquare className="h-4.5 w-4.5 text-indigo-400" /> Pending Tasks
              </h3>
              <Link href="/dashboard/tasks" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                Planner <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-sm text-muted-foreground py-3 text-center">Loading tasks...</div>
              ) : pendingTasks.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
                  All caught up! No tasks left.
                  <Link href="/dashboard/tasks" className="text-indigo-400 hover:underline block text-xs mt-2 font-semibold">
                    Add a new task
                  </Link>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="gsap-dash-item p-3.5 bg-muted/20 border border-border/40 rounded-xl flex items-center justify-between"
                  >
                    <div className="overflow-hidden mr-3">
                      <h4 className="text-sm font-medium truncate text-foreground">{task.title}</h4>
                      {task.dueDate && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        task.priority === 'high'
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          : 'bg-muted border border-border text-muted-foreground'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
