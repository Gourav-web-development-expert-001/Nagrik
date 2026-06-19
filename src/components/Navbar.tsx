'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRole } from './RoleContext';
import { Sun, Moon, LogOut, CheckCircle, Shield, Landmark } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useRole();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('nagrik_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('nagrik_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-border-color transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="bg-[#0B3B82] text-white p-2 rounded-md group-hover:bg-[#072a61] transition-all">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-wider text-[#0B3B82] dark:text-blue-400">NAGRIK</span>
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-[#0B3B82] dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    G&RI Kendra
                  </span>
                </div>
                <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight uppercase">
                  Delhi CM Governance Intelligence Platform
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link 
              href="/" 
              className={`hover:text-[#0B3B82] dark:hover:text-blue-400 transition-colors ${
                pathname === '/' ? 'text-[#0B3B82] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Home
            </Link>
            
            {user.role === 'Citizen' && (
              <>
                <Link 
                  href="/citizen" 
                  className={`hover:text-[#0B3B82] dark:hover:text-blue-400 transition-colors ${
                    pathname === '/citizen' ? 'text-[#0B3B82] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  My Portal
                </Link>
                <Link 
                  href="/citizen/new-grievance" 
                  className={`hover:text-[#0B3B82] dark:hover:text-blue-400 transition-colors ${
                    pathname === '/citizen/new-grievance' ? 'text-[#0B3B82] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  File Complaint
                </Link>
              </>
            )}

            {user.role === 'Officer' && (
              <Link 
                href="/officer" 
                className={`hover:text-[#0B3B82] dark:hover:text-blue-400 transition-colors ${
                  pathname === '/officer' ? 'text-[#0B3B82] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Officer Desk
              </Link>
            )}

            {user.role === 'Department Head' && (
              <Link 
                href="/dept-head" 
                className={`hover:text-[#0B3B82] dark:hover:text-blue-400 transition-colors ${
                  pathname === '/dept-head' ? 'text-[#0B3B82] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                HQ Analytics
              </Link>
            )}

            {user.role === 'Chief Minister' && (
              <Link 
                href="/cm" 
                className={`hover:text-[#0B3B82] dark:hover:text-blue-400 transition-colors ${
                  pathname?.startsWith('/cm') ? 'text-[#0B3B82] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                CM War Room
              </Link>
            )}
          </div>

          {/* Action buttons (Theme switcher & User card) */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-all border border-border-color cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Profile Brief or Login */}
            <div className="flex items-center gap-2 border-l pl-3 border-border-color">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  {user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/20 rounded-lg border border-border-color transition-colors cursor-pointer"
                title="Logout Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
