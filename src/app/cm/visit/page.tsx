'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Sparkles, BrainCircuit, 
  AlertTriangle, ShieldAlert, ListTodo, ClipboardList, 
  PlayCircle, Landmark, Search, X
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(() => import('@/components/ComplaintMap'), { ssr: false });

export default function CmVisitIntel() {
  const [location, setLocation] = useState('Rohini Sector 15');
  const [loading, setLoading] = useState(false);
  const [intelData, setIntelData] = useState<any | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Coordinates mapping for Delhi spots for simulation
  const locationCoordinates: Record<string, { lat: number; lng: number }> = {
    'rohini': { lat: 28.7247, lng: 77.1205 },
    'dwarka': { lat: 28.5921, lng: 77.0460 },
    'lajpat nagar': { lat: 28.5708, lng: 77.2372 },
    'mayur vihar': { lat: 28.6095, lng: 77.2912 },
    'dwarka sector 12': { lat: 28.5921, lng: 77.0460 },
    'rohini sector 15': { lat: 28.7247, lng: 77.1205 }
  };

  const getCoordinates = (loc: string) => {
    const l = loc.toLowerCase().trim();
    for (const key of Object.keys(locationCoordinates)) {
      if (l.includes(key)) {
        return locationCoordinates[key];
      }
    }
    return { lat: 28.6139, lng: 77.2090 }; // Central Delhi fallback
  };

  const handleGenerateIntel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/visit-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location })
      });

      if (!res.ok) throw new Error("Failed to compile Visit Briefing");
      const data = await res.json();
      
      // Inject coordinates into data
      data.coords = getCoordinates(location);
      setIntelData(data);
    } catch (e) {
      alert("Failed to load visit intelligence. Please try a seeded location like 'Sector 15 Rohini' or 'Dwarka'.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-color pb-4">
        <div className="flex items-center gap-3">
          <Link href="/cm" className="p-2 border border-border-color rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-650 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span>CM Spot Visit Intelligence</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Input visit coordinates to compile neighborhood unresolved complaints, officer performance logs, and directives.</p>
          </div>
        </div>

        <button 
          onClick={() => setShowProfileModal(true)}
          className="hidden sm:flex items-center gap-2.5 border-l pl-4 border-border-color cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-800/20 p-1.5 rounded-xl transition-all text-left focus:outline-none"
        >
          <img 
            src="/rekha_gupta.png" 
            alt="CM Rekha Gupta" 
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover shadow-md"
          />
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
              Rekha Gupta
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Hon'ble Chief Minister
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Input Form & Directives */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-border-color rounded-xl p-5 shadow-sm">
            <h2 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3.5 border-b pb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0B3B82] dark:text-blue-400" /> Target Visit Zone
            </h2>

            <form onSubmit={handleGenerateIntel} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Specify Location or District</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sector 15 Rohini, Dwarka"
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-955 dark:text-white border border-border-color rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0B3B82]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
                  Demo Seeded Areas: <strong className="text-slate-600 dark:text-slate-300">Sector 15 Rohini, Dwarka Sector 12, Lajpat Nagar, Mayur Vihar</strong>.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#0B3B82] hover:bg-[#072a61] disabled:bg-slate-300 text-white font-bold p-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs uppercase tracking-wider cursor-pointer shadow-sm"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>{loading ? "Compiling AI Analysis..." : "Compile Visit Briefing"}</span>
              </button>
            </form>
          </div>

          {/* AI Directives Card */}
          {intelData && (
            <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <h3 className="font-extrabold text-xs text-blue-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-2">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>AI Directives & Actions</span>
              </h3>

              <div className="flex flex-col gap-3">
                {intelData.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-2.5 items-start text-xs font-semibold leading-relaxed">
                    <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-900 text-[9px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center / Right Columns: Map & Grievance list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {intelData ? (
            <div className="flex flex-col gap-6">
              
              {/* Map displaying 2km radius circle and local unresolved cases */}
              <div className="flex flex-col gap-2">
                <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
                  🔍 Proximity Audit Zone (2KM Radius)
                </h3>
                <div className="h-[280px]">
                  <ComplaintMap 
                    visitMode={true} 
                    visitCoords={intelData.coords} 
                    visitRadius={2000} 
                  />
                </div>
              </div>

              {/* Briefing summary and priority list */}
              <div className="bg-white dark:bg-slate-900 border border-border-color rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-[#0B3B82] dark:text-blue-450 uppercase tracking-wider">Neighborhood Briefing Report</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{intelData.issues.length} Unresolved local issues</span>
                </div>

                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                  {intelData.summary}
                </p>

                {/* Priority Checklist */}
                <div className="mt-2 flex flex-col gap-2">
                  <h4 className="font-extrabold text-[10px] text-slate-450 uppercase tracking-wide flex items-center gap-1">
                    <ListTodo className="w-3.5 h-3.5" /> High Priority Checklist for CM Inspect
                  </h4>
                  
                  <div className="flex flex-col gap-2">
                    {intelData.issues.map((iss: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-border-color p-3.5 rounded-lg flex justify-between items-start gap-4">
                        <div>
                          <div className="text-[9px] text-slate-450 font-bold uppercase">{iss.department} &bull; Priority: {iss.priority}</div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">"{iss.title}"</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          iss.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                          iss.priority === 'High' ? 'bg-orange-100 text-orange-850' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {iss.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-border-color border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <BrainCircuit className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
              <div className="font-bold text-slate-500 text-xs">No Visit Intelligence Compiled</div>
              <p className="text-[10px] text-slate-400 max-w-sm">Input the CM's scheduled inspection coordinates on the left panel, and click "Compile Visit Briefing" to run AI analytics and extract local charts.</p>
            </div>
          )}
        </div>

      </div>

      {/* CM PROFILE DETAIL MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col border border-border-color">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-900 dark:from-slate-900/80 dark:to-blue-950/50 p-5 flex items-center justify-between border-b border-border-color">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">Chief Minister Profile & Accomplishments</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content Body: Left photo, Right info */}
            <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
              {/* Left Side: Photo */}
              <div className="w-full md:w-1/3 flex flex-col items-center gap-3">
                <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-[#0B3B82] dark:border-blue-500 shadow-lg bg-slate-100 dark:bg-slate-900">
                  <img 
                    src="/rekha_gupta.png" 
                    alt="CM Rekha Gupta" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Rekha Gupta</h4>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider mt-0.5">Delhi Chief Minister</p>
                </div>
              </div>
              
              {/* Right Side: Info & Achievements */}
              <div className="flex-1 flex flex-col gap-4">
                {/* General Information */}
                <div>
                  <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-border-color pb-1 mb-2">General Information</h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 font-semibold block">Office Jurisdiction</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">National Capital Territory of Delhi</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 font-semibold block">Term Inception</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">February 2026</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 font-semibold block">Contact Helpline</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">1031 (CM Grievance Line)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 font-semibold block">NAGRIK Platform Rating</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">92% Public Trust Index</span>
                    </div>
                  </div>
                </div>
                
                {/* Key Achievements */}
                <div>
                  <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-border-color pb-1 mb-2">Key Accomplishments & Initiatives</h5>
                  <ul className="flex flex-col gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-350">
                    <li className="flex gap-2 items-start font-semibold">
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">✦</span>
                      <span><strong>NAGRIK Portal Launch</strong>: Standardized Delhi's first real-time grievance tracking interface with built-in AI routing and anti-false closure safeguards.</span>
                    </li>
                    <li className="flex gap-2 items-start font-semibold">
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">✦</span>
                      <span><strong>Digital Decentralization</strong>: Authorized Direct CM Spot Auditing protocols, bypassing bureaucratic intermediaries to review field grievances instantly.</span>
                    </li>
                    <li className="flex gap-2 items-start font-semibold">
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">✦</span>
                      <span><strong>Clean Air Delhi Action Plan</strong>: Spearheaded MCD-joint initiatives to clean illegal dumping yards and mitigate local dust emissions.</span>
                    </li>
                    <li className="flex gap-2 items-start font-semibold">
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">✦</span>
                      <span><strong>Critical Infrastructure Safety</strong>: Mandated standard resolution response time rules for utility hazards like sparking transformers and toxic water leaks.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
