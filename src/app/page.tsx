'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileText, Search, ShieldCheck, Cpu, 
  Map, AlertTriangle, Users, BarChart3, Clock 
} from 'lucide-react';

export default function LandingPage() {
  const stats = [
    { label: "Total Complaints", value: "12,482", subtext: "Since inception", icon: <FileText className="w-5 h-5 text-blue-600" /> },
    { label: "Resolved Cases", value: "11,894", subtext: "95.2% resolution rate", icon: <ShieldCheck className="w-5 h-5 text-emerald-600" /> },
    { label: "Departments Connected", value: "28", subtext: "All MCD & GNCTD departments", icon: <Users className="w-5 h-5 text-purple-600" /> },
    { label: "Avg. Resolution Time", value: "2.8 Days", subtext: "Down from 14.5 days", icon: <Clock className="w-5 h-5 text-amber-600" /> }
  ];

  const features = [
    {
      title: "AI Complaint Routing",
      desc: "Automatically identifies department ownership and categorizes issues using advanced LLM reasoning.",
      icon: <Cpu className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Smart Categorization",
      desc: "Detects urgency levels, sentiment, and extracts semantic keywords instantly upon submission.",
      icon: <FileText className="w-6 h-6 text-[#0B3B82]" />
    },
    {
      title: "Officer Accountability",
      desc: "Dynamic Trust Scores and closure ratings mapped directly to individual resolving officers.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Critical Alert Detection",
      desc: "Scans for immediate threats like gas leaks, live wires, or fires, escalating to DMs instantly.",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />
    },
    {
      title: "Duplicate Complaint Detection",
      desc: "Uses coordinate proximity to group identical neighborhood reports under unified Master Issues.",
      icon: <Users className="w-6 h-6 text-indigo-600" />
    },
    {
      title: "Heatmap Analytics",
      desc: "Real-time geographical hotspot indexing maps sewage, AQI, road, water, or safety complaints.",
      icon: <Map className="w-6 h-6 text-teal-600" />
    },
    {
      title: "CM Intelligence Dashboard",
      desc: "CM War Room panel with live alerts feed, visit intelligence briefings, and chatbot oversight.",
      icon: <BarChart3 className="w-6 h-6 text-red-700" />
    }
  ];

  return (
    <div className="flex flex-col gap-12 w-full py-4">
      {/* Hero Section */}
      <section className="text-center py-10 px-4 max-w-4xl mx-auto flex flex-col items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-blue-50 dark:bg-blue-950/40 text-[#0B3B82] dark:text-blue-300 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border border-blue-200 dark:border-blue-900/60"
        >
          Government of NCT of Delhi Portal
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight"
        >
          Empowering Delhi Through <span className="text-[#0B3B82] dark:text-blue-400">Intelligent Grievance Resolution</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-600 dark:text-slate-300 max-w-2xl text-base sm:text-lg font-medium leading-relaxed"
        >
          An AI-powered grievance response and monitoring network ensuring administrative accountability, prompt departmental closures, and real-time oversight for the Chief Minister.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mt-4"
        >
          <Link
            href="/citizen/new-grievance"
            className="bg-[#0B3B82] hover:bg-[#072a61] text-white font-bold px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Register Complaint</span>
          </Link>
          <Link
            href="/citizen"
            className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold px-6 py-3 rounded-lg shadow-sm border border-border-color flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            <Search className="w-4 h-4 text-[#0B3B82] dark:text-blue-400" />
            <span>Track Complaint</span>
          </Link>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-border-color rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{s.value}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{s.subtext}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg">
              {s.icon}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Feature Grid Section */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-955 dark:text-white">Governance Intelligence Network</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">NAGRIK combines artificial intelligence and real-time mapping to ensure civic grievances are closed accurately.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900 border border-border-color rounded-xl p-6 hover:border-[#0B3B82] dark:hover:border-blue-400 transition-colors shadow-sm flex flex-col gap-4"
            >
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl w-fit">
                {f.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
