'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, BookOpen, Layers, CheckSquare, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });

      if (res.ok) {
        toast.success('Logged out successfully.');
        localStorage.removeItem('studyvault_username');
        router.push('/');
        router.refresh();
      } else {
        throw new Error('Logout failed');
      }
    } catch {
      toast.error('Could not log out.');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Notes Vault', href: '/dashboard/notes', icon: BookOpen },
    { name: 'Flashcards', href: '/dashboard/flashcards', icon: Layers },
    { name: 'Task Board', href: '/dashboard/tasks', icon: CheckSquare },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="text-gradient font-extrabold">StudyVault</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex flex-col w-64 bg-card/90 backdrop-blur-xl border-r border-border/80 transition-transform duration-300 transform md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-16 md:pt-0`}
      >
        {/* Brand logo - desktop only */}
        <div className="hidden md:flex items-center gap-2 px-6 py-6 border-b border-border/50">
          <div className="h-9 w-9 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-gradient font-extrabold text-lg tracking-tight">StudyVault</span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-linear-to-r from-indigo-500/15 to-purple-500/5 border border-indigo-500/20 text-indigo-400 dark:text-indigo-300'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-muted-foreground'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Theme Switcher Control */}
        <div className="px-4 py-3 border-t border-border/50 flex flex-col gap-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Appearance</span>
          <ThemeToggle />
        </div>

        {/* Logout Bottom Button */}
        <div className="p-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:border-destructive/20 border border-transparent transition-all"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-16 md:pt-0">
        <main className="flex-1 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-900/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-purple-900/5 blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto z-10 relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
