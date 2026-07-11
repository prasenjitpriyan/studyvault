'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Layers, CheckSquare, Play, Pause, RotateCcw, Clock, ArrowRight, Timer } from 'lucide-react';
import { toast } from 'sonner';

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    notesCount: 0,
    decksCount: 0,
    cardsToReview: 0,
    tasksPending: 0,
  });
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
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

          for (const res of cardResponses) {
            if (res.ok) {
              const data = await res.json();
              const cards = data.flashcards || [];
              const reviews = cards.filter((c: { nextReview: string }) => new Date(c.nextReview) <= now);
              cardsToReviewCount += reviews.length;
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

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Study Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Review your statistics, manage goals, and start a study timer.</p>
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
              className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:border-zinc-700 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{item.name}</p>
                <h3 className="text-3xl font-extrabold mt-2 text-zinc-100">
                  {isLoading ? '...' : item.value}
                </h3>
              </div>
              <div className={`h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Pomodoro Focus Timer Panel (Takes 2 Columns on desktop) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" /> Focus Session
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => switchMode('work')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  timerMode === 'work'
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                    : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => switchMode('break')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  timerMode === 'break'
                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                    : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Break (5m)
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {/* Digital Clock display */}
            <div className="text-7xl md:text-8xl font-black font-mono tracking-tight mb-2 text-gradient">
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </div>
            <p className="text-xs text-zinc-400 mb-8 uppercase tracking-widest font-semibold">
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
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-5 py-3.5 rounded-xl transition-all"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Simple Progress Bar */}
          <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-6 overflow-hidden border border-zinc-800/50">
            <div
              className="bg-linear-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sidebar Cards Panel (Takes 1 Column) */}
        <div className="space-y-6">

          {/* Recent Notes Panel */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
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
                <div className="text-sm text-zinc-500 py-3 text-center">Loading notes...</div>
              ) : recentNotes.length === 0 ? (
                <div className="text-sm text-zinc-500 py-6 text-center border border-dashed border-zinc-800 rounded-xl">
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
                    className="block p-3.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/40 hover:border-zinc-800 rounded-xl transition-all"
                  >
                    <h4 className="text-sm font-semibold truncate text-zinc-200">{note.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                        {note.folder}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Pending Tasks Panel */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
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
                <div className="text-sm text-zinc-500 py-3 text-center">Loading tasks...</div>
              ) : pendingTasks.length === 0 ? (
                <div className="text-sm text-zinc-500 py-6 text-center border border-dashed border-zinc-800 rounded-xl">
                  All caught up! No tasks left.
                  <Link href="/dashboard/tasks" className="text-indigo-400 hover:underline block text-xs mt-2 font-semibold">
                    Add a new task
                  </Link>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3.5 bg-zinc-900/50 border border-zinc-800/40 rounded-xl flex items-center justify-between"
                  >
                    <div className="overflow-hidden mr-3">
                      <h4 className="text-sm font-medium truncate text-zinc-200">{task.title}</h4>
                      {task.dueDate && (
                        <p className="text-[10px] text-zinc-500 mt-1">
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
                          : 'bg-zinc-500/10 border border-zinc-700 text-zinc-400'
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
