'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/components/RoleContext';
import { Landmark, ShieldCheck, UserCheck, ShieldAlert, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const quickLogins = [
    { label: "Citizen Profile", user: "citizen", role: "Citizen" as const },
    { label: "Power Officer", user: "officer_power", role: "Officer" as const },
    { label: "Power Dept Head", user: "depthead_power", role: "Department Head" as const },
    { label: "Chief Minister", user: "cm", role: "Chief Minister" as const }
  ];

  const handleQuickLogin = (role: 'Citizen' | 'Officer' | 'Department Head' | 'Chief Minister') => {
    setRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please input both username and password.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      // Set role in Context and redirect
      setRole(data.user.role);
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-10 px-4">
      <div className="bg-white dark:bg-slate-900 border border-border-color rounded-2xl w-full max-w-md shadow-lg overflow-hidden">
        
        {/* Government Emblem Header */}
        <div className="bg-[#0B3B82] text-white p-6 text-center flex flex-col items-center gap-2">
          <div className="bg-white/10 p-2.5 rounded-full">
            <Landmark className="w-6 h-6 text-blue-200" />
          </div>
          <div>
            <h2 className="font-black text-base tracking-widest">GOVERNMENT OF NCT OF DELHI</h2>
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider mt-0.5">NAGRIK Governance Command Access</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Username / ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin ID or email"
                className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-border-color rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#0B3B82]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Secret Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-border-color rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#0B3B82]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B3B82] hover:bg-[#072a61] disabled:bg-slate-350 text-white font-bold p-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? "Authenticating Session..." : "Secure Login"}</span>
            </button>
          </form>

          {/* Quick Logins for Evaluator */}
          <div className="border-t pt-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2 text-center">Evaluator Quick Logins</span>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickLogin(q.role)}
                  className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-850 dark:text-slate-200 border border-border-color p-2 rounded-lg text-[10px] font-bold tracking-wide transition-colors flex items-center gap-1.5 justify-center cursor-pointer shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
