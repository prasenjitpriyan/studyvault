'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Layers, CheckSquare, Sparkles, ArrowRight, Menu, X, Network, Brain } from 'lucide-react';
import gsap from 'gsap';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Respect prefers-reduced-motion
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.gsap-header', {
          opacity: 0,
          y: -14,
          duration: 0.5,
        })
          .from(
            '.gsap-pill',
            {
              opacity: 0,
              y: 12,
              duration: 0.4,
            },
            '-=0.2'
          )
          .from(
            '.gsap-title',
            {
              opacity: 0,
              y: 20,
              duration: 0.6,
            },
            '-=0.2'
          )
          .from(
            '.gsap-text',
            {
              opacity: 0,
              y: 16,
              duration: 0.5,
            },
            '-=0.3'
          )
          .from(
            '.gsap-ctas',
            {
              opacity: 0,
              y: 16,
              duration: 0.5,
            },
            '-=0.3'
          )
          .from(
            '.gsap-visual-container',
            {
              opacity: 0,
              scale: 0.96,
              duration: 0.6,
            },
            '-=0.3'
          )
          .fromTo(
            '.gsap-curve-decay',
            { strokeDashoffset: 500 },
            { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' },
            '-=0.2'
          )
          .fromTo(
            '.gsap-curve-sm2',
            { strokeDashoffset: 500 },
            { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out' },
            '-=0.7'
          )
          .from(
            '.gsap-marker',
            {
              opacity: 0,
              scale: 0,
              stagger: 0.08,
              duration: 0.4,
              ease: 'back.out(2)',
            },
            '-=0.5'
          )
          .from(
            '.gsap-card-item',
            {
              opacity: 0,
              y: 20,
              stagger: 0.08,
              duration: 0.5,
            },
            '-=0.4'
          );
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Immediate appearance without displacement
        gsap.set(
          [
            '.gsap-header',
            '.gsap-pill',
            '.gsap-title',
            '.gsap-text',
            '.gsap-ctas',
            '.gsap-visual-container',
            '.gsap-card-item',
          ],
          { opacity: 1, y: 0, scale: 1 }
        );
        gsap.set(['.gsap-curve-decay', '.gsap-curve-sm2'], {
          strokeDashoffset: 0,
        });
        gsap.set('.gsap-marker', { opacity: 1, scale: 1 });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: -4,
      borderColor: 'rgba(99, 102, 241, 0.4)',
      boxShadow: '0 16px 32px -12px rgba(99, 102, 241, 0.1)',
      duration: 0.24,
      ease: 'power2.out',
    });
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      boxShadow: 'none',
      duration: 0.24,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-background text-foreground flex flex-col overflow-hidden select-none"
    >
      {/* Decorative Subtle Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none" />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center z-20 gsap-header">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl tracking-tight shrink-0"
        >
          <div className="h-9 w-9 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-gradient">StudyVault</span>
        </Link>

        {/* Desktop nav actions */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-card text-foreground hover:bg-muted border border-border px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            Create Account
          </Link>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mx-4 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 p-4 space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center text-sm font-medium text-foreground px-4 py-3 rounded-xl hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center text-sm font-semibold bg-linear-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-xl"
            >
              Create Account
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10 md:pt-12 md:pb-16 flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 items-center z-10">
        {/* Left: Academic Copy */}
        <div className="lg:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start gap-5">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 dark:text-indigo-300 text-xs font-bold tracking-wide gsap-pill shadow-xs">
            <Brain className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            Active Recall &amp; Cognitive Architecture
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight gsap-title leading-[1.15]">
            Structured knowledge.
            <br />
            <span className="text-gradient">Engineered retention.</span>
          </h1>

          {/* Sub-copy */}
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg gsap-text leading-relaxed">
            StudyVault integrates Markdown note-taking, topological knowledge graphs, and the SuperMemo SM-2 spaced repetition algorithm into a calm, focused personal learning sanctuary.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="gsap-ctas flex flex-col min-[480px]:flex-row gap-3 w-full sm:w-auto pt-2">
            <Link
              href="/dashboard/flashcards?action=practice"
              className="flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-sm cursor-pointer"
            >
              Start Review <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center bg-card border border-border text-foreground hover:bg-muted font-semibold px-6 py-3.5 rounded-xl transition-all text-sm cursor-pointer"
            >
              Explore Dashboard
            </Link>
          </div>
        </div>

        {/* Right: Academic Storytelling SVG (Ebbinghaus vs. SM-2 Consolidation) */}
        <div className="lg:col-span-6 flex justify-center items-center w-full mt-10 lg:mt-0 gsap-visual-container">
          <div className="w-full max-w-lg glass-panel bg-card/90 border border-border/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Header of graphic */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                  Memory Consolidation Dynamics
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  Ebbinghaus Decay vs. SM-2 Spaced Recall
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                {"R = e^(-t/S)"}
              </span>
            </div>

            {/* SVG Graph Graphic */}
            <svg
              viewBox="0 0 500 280"
              className="w-full h-auto overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="sm2AreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="decayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="40" x2="480" y2="40" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="50" y1="90" x2="480" y2="90" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="50" y1="150" x2="480" y2="150" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="50" y1="210" x2="480" y2="210" stroke="currentColor" strokeOpacity="0.12" />

              {/* Axis Y Labels */}
              <text x="40" y="44" textAnchor="end" fill="currentColor" fillOpacity="0.5" className="text-[10px] font-mono">100%</text>
              <text x="40" y="94" textAnchor="end" fill="currentColor" fillOpacity="0.5" className="text-[10px] font-mono">75%</text>
              <text x="40" y="154" textAnchor="end" fill="currentColor" fillOpacity="0.5" className="text-[10px] font-mono">50%</text>
              <text x="40" y="214" textAnchor="end" fill="currentColor" fillOpacity="0.5" className="text-[10px] font-mono">20%</text>

              {/* Axis X Time Labels */}
              <text x="50" y="235" textAnchor="middle" fill="currentColor" fillOpacity="0.5" className="text-[10px] font-mono">Day 0</text>
              <text x="140" y="235" textAnchor="middle" fill="currentColor" fillOpacity="0.5" className="text-[10px] font-mono">Day 1</text>
              <text x="240" y="235" textAnchor="middle" fill="currentColor" fillOpacity="0.5" className="text-[10px] font-mono">Day 6</text>
              <text x="360" y="235" textAnchor="middle" fill="currentColor" fillOpacity="0.5" className="text-[10px] font-mono">Day 16</text>
              <text x="460" y="235" textAnchor="middle" fill="currentColor" fillOpacity="0.5" className="text-[10px] font-mono">Day 35</text>

              {/* Exponential Forgetting Curve (Red/Orange dashed decay) */}
              <path
                d="M 50 40 Q 110 180 460 210"
                stroke="#f87171"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeDashoffset="500"
                className="gsap-curve-decay"
              />

              {/* SM-2 Spaced Repetition Sawtooth Curve (Reinforcement Waves) */}
              {/* Review 1 (Day 1): Jump back to 95%, decays slower */}
              {/* Review 2 (Day 6): Jump back to 98%, decays much slower */}
              {/* Review 3 (Day 16): Jump to 100%, nearly flat */}
              <path
                d="M 50 40 Q 95 110 140 145 L 140 46 Q 190 85 240 110 L 240 44 Q 300 68 360 80 L 360 42 Q 410 48 460 54"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="500"
                strokeDashoffset="500"
                className="gsap-curve-sm2"
              />

              {/* Recall Event Markers */}
              <g className="gsap-marker">
                <circle cx="140" cy="46" r="4.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="140" y1="46" x2="140" y2="210" stroke="#818cf8" strokeOpacity="0.25" strokeDasharray="2 2" />
              </g>
              <g className="gsap-marker">
                <circle cx="240" cy="44" r="4.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="240" y1="44" x2="240" y2="210" stroke="#818cf8" strokeOpacity="0.25" strokeDasharray="2 2" />
              </g>
              <g className="gsap-marker">
                <circle cx="360" cy="42" r="4.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="360" y1="42" x2="360" y2="210" stroke="#818cf8" strokeOpacity="0.25" strokeDasharray="2 2" />
              </g>
            </svg>

            {/* Legend Footer */}
            <div className="flex items-center justify-between border-t border-border/50 pt-3 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                <span className="font-semibold text-foreground">SM-2 Spaced Recall (&gt;90% Retention)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-3 border-b-2 border-dashed border-red-400 inline-block" />
                <span className="text-muted-foreground">Standard Decay</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── 4 PILLARS FEATURE SUITE ──────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Notes Card */}
          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="glass-panel rounded-2xl p-5 sm:p-6 relative group overflow-hidden transition-all duration-300 gsap-card-item cursor-default"
          >
            <div className="h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center text-indigo-400 mb-4">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold mb-2 group-hover:text-indigo-400 transition-colors">
              Notes Vault
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Markdown note capture with live split preview, folder taxonomy, and automated AI conceptual distillation.
            </p>
          </div>

          {/* Flashcard Card */}
          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="glass-panel rounded-2xl p-5 sm:p-6 relative group overflow-hidden transition-all duration-300 gsap-card-item cursor-default"
          >
            <div className="h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center text-purple-400 mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold mb-2 group-hover:text-purple-400 transition-colors">
              Active Recall Decks
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tactile flashcard review powered by the SuperMemo SM-2 algorithm to permanently defeat the forgetting curve.
            </p>
          </div>

          {/* Knowledge Graph Card */}
          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="glass-panel rounded-2xl p-5 sm:p-6 relative group overflow-hidden transition-all duration-300 gsap-card-item cursor-default"
          >
            <div className="h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center text-cyan-400 mb-4">
              <Network className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold mb-2 group-hover:text-cyan-400 transition-colors">
              Knowledge Graph
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interactive 2D/3D WebGL topological network mapping cross-disciplinary links between notes, decks, and concepts.
            </p>
          </div>

          {/* Kanban Card */}
          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="glass-panel rounded-2xl p-5 sm:p-6 relative group overflow-hidden transition-all duration-300 gsap-card-item cursor-default"
          >
            <div className="h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center text-emerald-400 mb-4">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold mb-2 group-hover:text-emerald-400 transition-colors">
              Task Board
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fluid cross-column Kanban task board keeping revision milestones and daily study commitments structured.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-border text-center text-xs text-muted-foreground z-10">
        <p>&copy; {new Date().getFullYear()} StudyVault. Engineered for calm, intellectual mastery.</p>
      </footer>
    </div>
  );
}
