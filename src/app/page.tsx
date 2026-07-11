import React from 'react';
import Link from 'next/link';
import { BookOpen, Layers, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'StudyVault - Your Ultimate Knowledge & Study Hub',
  description: 'Organise notes, master flashcards with spaced repetition, and manage your tasks in a beautiful obsidian-dark interface.',
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between overflow-hidden">

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-9 w-9 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-gradient font-extrabold tracking-tight">StudyVault</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-card text-foreground hover:bg-muted border border-border px-4 py-2 rounded-lg transition-all"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto z-10 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 dark:text-indigo-300 mb-6 animate-pulse">
          <Sparkles className="h-3 w-3" /> Reimagining personal study productivity
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl">
          Your personal knowledge <br />
          <span className="text-gradient">vault for lifelong learning</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Organise notes, master materials using spaced-repetition flashcards, and run your academic schedule with a sleek, minimalist planner.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center bg-card border border-border text-foreground hover:bg-muted font-semibold px-8 py-4 rounded-xl transition-all"
          >
            Access Dashboard
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">

          {/* Notes Card */}
          <div className="glass-panel rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
            <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-indigo-400 mb-5">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 dark:group-hover:text-indigo-300 transition-colors">Notes Vault</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create, tag, and structure notes. Side-by-side edit and live markdown preview rendering for robust note-taking.
            </p>
          </div>

          {/* Flashcard Card */}
          <div className="glass-panel rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 hover:border-purple-500/30">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
            <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-purple-400 mb-5">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 dark:group-hover:text-purple-300 transition-colors">Active Recall Decks</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Build custom card decks. Utilises the SuperMemo SM-2 spaced repetition scheduler to maximize knowledge retention.
            </p>
          </div>

          {/* Kanban Card */}
          <div className="glass-panel rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-emerald-400 mb-5">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 dark:group-hover:text-emerald-300 transition-colors">Prioritized Tasks</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track deadlines and project status on a prioritized Kanban board. Keep assignments and milestones fully organized.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-border text-center text-xs text-muted-foreground z-10">
        <p>&copy; {new Date().getFullYear()} StudyVault. Powered by Next.js & MongoDB.</p>
      </footer>

    </div>
  );
}
