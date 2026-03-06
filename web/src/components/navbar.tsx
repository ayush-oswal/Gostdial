'use client';

import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Bot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/60 shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform duration-200">
              <Bot size={17} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
              💀 GhostDial
            </span>
          </Link>

          {/* Nav links + actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60',
              )}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard'
                  ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60',
              )}
            >
              Dashboard
            </Link>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-2" />

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />
              ) : (
                <div className="w-[17px] h-[17px]" />
              )}
            </button>

            <Link
              href="/dashboard"
              className="ml-1 text-sm font-semibold px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25"
            >
              Launch
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
