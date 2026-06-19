'use client';

import React from 'react';
import { Landmark, PhoneCall, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-blue-500" />
          <div className="text-left">
            <span className="font-bold text-white tracking-wide">GOVERNMENT OF NCT OF DELHI</span>
            <p className="text-[10px] text-slate-500">Department of Information Technology & Administrative Reforms</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-medium">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Grievance Guidelines</a>
          <a href="#" className="hover:text-white transition-colors flex items-center gap-1 text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" /> NIC Security Audited
          </a>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
          <span>NIC Support Desk: <strong className="text-slate-300">1800-11-2525</strong></span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center border-t border-slate-800 mt-6 pt-4 text-[10px] text-slate-600 font-semibold">
        &copy; {new Date().getFullYear()} NAGRIK Kendra. All rights reserved. Managed by National Informatics Centre (NIC) Delhi.
      </div>
    </footer>
  );
}
