'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { BookOpen, Layers, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create a GSAP context to scope animations cleanly
    const ctx = gsap.context(() => {
      // 1. Staggered landing elements loading transitions
      const tl = gsap.timeline();
      
      tl.fromTo('.gsap-logo',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      )
      .fromTo('.gsap-header-actions',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.6'
      )
      .fromTo('.gsap-pill',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.5)' },
        '-=0.2'
      )
      .fromTo('.gsap-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.gsap-text',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo('.gsap-ctas',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo('.gsap-vault-area',
        { opacity: 0, scale: 0.85, rotate: -5 },
        { opacity: 1, scale: 1, rotate: 0, duration: 1.2, ease: 'elastic.out(1, 0.75)' },
        '-=0.8'
      )
      .fromTo('.gsap-card-item',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15 },
        '-=0.7'
      );

      // 2. Continuous SVG Loop Animations
      // Bobbing Vault Core Body
      gsap.to('.vault-body', {
        y: -15,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      // Rotating Outer Ring
      gsap.to('.vault-ring-outer', {
        rotation: 360,
        transformOrigin: '50% 50%',
        duration: 22,
        repeat: -1,
        ease: 'none'
      });

      // Rotating Inner Ring (Counter-clockwise)
      gsap.to('.vault-ring-inner', {
        rotation: -360,
        transformOrigin: '50% 50%',
        duration: 16,
        repeat: -1,
        ease: 'none'
      });

      // Star particles bobbing separately
      gsap.to('.vault-star-1', {
        y: -10,
        opacity: 0.8,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.vault-star-2', {
        y: 10,
        opacity: 0.6,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.vault-star-3', {
        scale: 1.2,
        opacity: 0.9,
        transformOrigin: '50% 50%',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      // Floating items (Books) rotating slightly
      gsap.to('.vault-item-left', {
        y: -8,
        rotation: 5,
        transformOrigin: '50% 50%',
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.vault-item-right', {
        y: -12,
        rotation: -5,
        transformOrigin: '50% 50%',
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);

    return () => ctx.revert(); // clean up animations
  }, []);

  // GSAP Mouse Hover Animations for Feature Cards
  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: -6,
      scale: 1.025,
      borderColor: 'rgba(99, 102, 241, 0.35)',
      boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.12)',
      duration: 0.35,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      boxShadow: 'none',
      duration: 0.35,
      ease: 'power2.out'
    });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background text-foreground flex flex-col justify-between overflow-hidden">
      
      {/* Decorative Background Blur Nodes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight gsap-logo">
          <div className="h-9 w-9 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <span className="text-gradient font-extrabold tracking-tight">StudyVault</span>
        </div>
        <div className="flex items-center gap-4 gsap-header-actions">
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

      {/* Hero Section Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Left Side: Copy Elements */}
        <div className="lg:col-span-7 text-left space-y-6 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide self-start gsap-pill shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> Supercharge Your Study Flow
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight gsap-title">
            Your personal knowledge <br />
            <span className="text-gradient">vault for learning</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl gsap-text leading-relaxed">
            Organise notes, master materials using spaced-repetition flashcards, and run your academic schedule with a sleek, minimalist planner.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 gsap-ctas">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-indigo-500/25 transition-all"
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
        </div>

        {/* Right Side: Animated SVG vault vector */}
        <div className="lg:col-span-5 flex justify-center items-center relative select-none gsap-vault-area">
          <svg width="450" height="450" viewBox="0 0 450 450" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[380px] md:max-w-[440px] drop-shadow-3xl">
            {/* Center glow radial canvas */}
            <circle cx="225" cy="225" r="125" fill="url(#vault-glow)" opacity="0.35" />

            {/* Orbiting circular rings */}
            <circle cx="225" cy="225" r="160" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 10" className="text-indigo-500/25 vault-ring-outer" />
            <circle cx="225" cy="225" r="115" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" className="text-purple-500/25 vault-ring-inner" />

            {/* Vault graphics body */}
            <g className="vault-body">
              {/* Star particles */}
              <path d="M120 120L123 128L131 131L123 134L120 142L117 134L109 131L117 128L120 120Z" fill="#818cf8" className="vault-star-1" />
              <path d="M330 320L332 326L338 328L332 330L330 336L328 330L322 328L328 326L330 320Z" fill="#a78bfa" className="vault-star-2" />
              <path d="M225 60L228 72L240 75L228 78L225 90L222 78L210 75L222 72L225 60Z" fill="#60a5fa" className="vault-star-3" />

              {/* Glassmorphic Rounded Vault Shield */}
              <rect x="155" y="145" width="140" height="160" rx="24" fill="url(#shield-fill)" stroke="url(#shield-stroke)" strokeWidth="2" className="backdrop-blur-md" />

              {/* Vault Internal Core Glow */}
              <circle cx="225" cy="225" r="35" fill="url(#core-glow)" />

              {/* Sparkle icon at shield center */}
              <path d="M225 212L227.5 220L235 222.5L227.5 225L225 233L222.5 225L215 222.5L222.5 220L225 212Z" fill="#ffffff" />

              {/* Orbiting morphing book nodes */}
              <g transform="translate(90, 220)" className="vault-item-left">
                <rect width="24" height="18" rx="3" fill="url(#book-fill)" stroke="#818cf8" strokeWidth="1" />
                <line x1="4" y1="5" x2="20" y2="5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                <line x1="4" y1="9" x2="16" y2="9" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                <line x1="4" y1="13" x2="12" y2="13" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              </g>

              <g transform="translate(330, 200)" className="vault-item-right">
                <rect width="24" height="18" rx="3" fill="url(#book-fill)" stroke="#a78bfa" strokeWidth="1" />
                <line x1="4" y1="5" x2="20" y2="5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                <line x1="4" y1="9" x2="16" y2="9" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                <line x1="4" y1="13" x2="12" y2="13" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
              </g>
            </g>

            {/* Vector Definitions */}
            <defs>
              <radialGradient id="vault-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="shield-fill" x1="155" y1="145" x2="295" y2="305" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="shield-stroke" x1="155" y1="145" x2="295" y2="305" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
              </linearGradient>
              <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="45%" stopColor="#6366f1" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="book-fill" x1="0" y1="0" x2="24" y2="18" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </main>

      {/* Feature Highlights Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-20 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Notes Card */}
          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="glass-panel rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 gsap-card-item"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
            <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-indigo-400 mb-5">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-450 dark:group-hover:text-indigo-350 transition-colors">Notes Vault</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create, tag, and structure notes. Side-by-side edit and live markdown preview rendering for robust note-taking.
            </p>
          </div>

          {/* Flashcard Card */}
          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="glass-panel rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 gsap-card-item"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
            <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-purple-400 mb-5">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-purple-450 dark:group-hover:text-purple-350 transition-colors">Active Recall Decks</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Build custom card decks. Utilises the SuperMemo SM-2 spaced repetition scheduler to maximize knowledge retention.
            </p>
          </div>

          {/* Kanban Card */}
          <div
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="glass-panel rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 gsap-card-item"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-emerald-400 mb-5">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-450 dark:group-hover:text-emerald-350 transition-colors">Prioritized Tasks</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track deadlines and project status on a prioritized Kanban board. Keep assignments and milestones fully organized.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-border text-center text-xs text-muted-foreground z-10">
        <p>&copy; {new Date().getFullYear()} StudyVault. Powered by Next.js & MongoDB.</p>
      </footer>

    </div>
  );
}
