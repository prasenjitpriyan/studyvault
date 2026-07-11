'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, BookOpen, Layers, CheckSquare, LogOut, LayoutDashboard, Menu, X, User } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState('Student');

  useEffect(() => {
    const storedUser = localStorage.getItem('studyvault_username');
    if (storedUser) {
      setTimeout(() => setUsername(storedUser), 0);
    }
  }, []);

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
    <div className="flex h-screen bg-[#09090b] overflow-hidden text-zinc-100">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f0f17]/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="text-gradient font-extrabold">StudyVault</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex flex-col w-64 bg-[#0f0f17]/90 backdrop-blur-xl border-r border-zinc-800/80 transition-transform duration-300 transform md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-16 md:pt-0`}
      >
        {/* Brand logo - desktop only */}
        <div className="hidden md:flex items-center gap-2 px-6 py-6 border-b border-zinc-800/50">
          <div className="h-9 w-9 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-gradient font-extrabold text-lg tracking-tight">StudyVault</span>
        </div>

        {/* User Card */}
        <div className="px-4 py-6 border-b border-zinc-800/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
            <User className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-zinc-100">{username}</h4>
            <p className="text-xs text-zinc-500 truncate">Active Learner</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
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
                    ? 'bg-linear-to-r from-indigo-500/15 to-purple-500/5 border border-indigo-500/20 text-indigo-300'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Bottom Button */}
        <div className="p-4 border-t border-zinc-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-16 md:pt-0">
        <main className="flex-1 p-6 md:p-8 relative">
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
