'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/components/RoleContext';
import { 
  FileText, CheckCircle, Clock, AlertTriangle, 
  MapPin, PlusCircle, RotateCcw, ThumbsUp, ThumbsDown, 
  FileImage, BrainCircuit
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(() => import('@/components/ComplaintMap'), { ssr: false });

export default function CitizenDashboard() {
  const { user } = useRole();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const fetchGrievances = async () => {
    try {
      const res = await fetch('/api/grievances');
      if (!res.ok) throw new Error("Failed to load grievances");
      const data = await res.json();
      
      // Filter grievances matching the logged-in citizen
      // Since it's a demo, we can show the citizen's grievances or all grievances if citizen role is generic
      // Let's filter where citizen.name is the logged-in user, but if list is empty, show default citizen's
      const filtered = data.filter((g: any) => 
        g.citizen?.name?.toLowerCase().includes('amit') || 
        g.citizen?.name?.toLowerCase().includes('gourav') ||
        g.citizen?.email === user.username + '@gmail.com'
      );
      setGrievances(filtered.length > 0 ? filtered : data);
    } catch (err: any) {
      setError(err.message || 'Failed to load database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleVerification = async (id: string, feedback: 'YES' | 'NO') => {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/grievances/${id}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });

      if (!res.ok) throw new Error("Failed to process verification");

      setActionMessage(
        feedback === 'YES' 
          ? 'Thank you. Issue closure has been verified and logged.' 
          : 'Grievance reopened. Assigned officer metrics and Trust Index adjusted.'
      );
      
      setTimeout(() => setActionMessage(''), 4000);
      fetchGrievances();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  // Metrics calculations
  const total = grievances.length;
  const resolved = grievances.filter(g => g.status === 'Resolved').length;
  const pending = grievances.filter(g => g.status === 'Pending' || g.status === 'In Progress').length;
  const critical = grievances.filter(g => g.isCriticalAlert && g.status !== 'Resolved').length;

  const getStatusBadge = (status: string, isCritical: boolean) => {
    switch (status) {
      case 'Resolved':
        return <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase">Resolved</span>;
      case 'In Progress':
        return <span className="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase">In Progress</span>;
      case 'Reopened':
        return <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase animate-pulse">Reopened</span>;
      default:
        return <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
          isCritical ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
        }`}>{isCritical ? 'Critical Alert' : 'Pending'}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Citizen Grievance Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Welcome back, {user.name}. View, track, or file municipal grievances for the NCT of Delhi.</p>
        </div>
        <Link
          href="/citizen/new-grievance"
          className="bg-[#0B3B82] hover:bg-[#072a61] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>File New Grievance</span>
        </Link>
      </div>

      {/* Action Banner Notification */}
      {actionMessage && (
        <div className="bg-blue-550 bg-opacity-10 border border-blue-500 text-[#0B3B82] dark:text-blue-300 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <BrainCircuit className="w-5 h-5 text-[#0B3B82] dark:text-blue-400" />
          {actionMessage}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-border-color p-4.5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2.5 rounded-lg text-[#0B3B82] dark:text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Submitted</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{total}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4.5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="bg-green-100 dark:bg-green-900/50 p-2.5 rounded-lg text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Resolved</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{resolved}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4.5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-slate-600 dark:text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Action</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{pending}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4.5 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="bg-red-100 dark:bg-red-900/50 p-2.5 rounded-lg text-red-655 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Critical Alerts</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{critical}</div>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Grievance List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b pb-2 uppercase tracking-wide">My Grievance History</h2>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">Retrieving database grievances...</div>
          ) : grievances.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-dashed border-border-color text-center flex flex-col items-center gap-3">
              <FileText className="w-10 h-10 text-slate-300" />
              <div className="font-bold text-slate-500 text-xs">No Grievances Lodged</div>
              <p className="text-[10px] text-slate-400 max-w-xs">You have not registered any grievances yet. Click "File New Grievance" above to submit.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map((g) => {
                const id = String(g.id || g._id);
                const showVerification = g.status === 'Resolved';
                
                return (
                  <div 
                    key={id}
                    className={`bg-white dark:bg-slate-900 border border-border-color rounded-xl p-5 shadow-sm transition-all ${
                      g.isCriticalAlert ? 'border-l-4 border-l-red-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4 flex-wrap mb-2.5">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{g.category} &bull; {g.department}</div>
                        <h3 className="font-bold text-sm text-slate-950 dark:text-white mt-0.5">{g.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(g.status, g.isCriticalAlert)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium mb-3.5">
                      {g.description}
                    </p>

                    <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 font-semibold border-t pt-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{g.citizen.district} ({g.citizen.pinCode})</span>
                      </div>
                      <div>
                        Filed on: {new Date(g.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>

                    {/* AI analysis tag preview */}
                    {g.aiAnalysis && (
                      <div className="mt-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-border-color text-[10px] flex items-center justify-between flex-wrap gap-2">
                        <span className="text-slate-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                          <BrainCircuit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> NAGRIK-AI Analysis
                        </span>
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-slate-600 dark:text-slate-400">Urgency: <strong className="text-red-600">{g.aiAnalysis.urgencyScore}/100</strong></span>
                          <span>&bull;</span>
                          <span className="text-slate-600 dark:text-slate-400">Priority: <strong className="uppercase">{g.aiAnalysis.priority}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* ANTI FALSE CLOSURE BANNER (HERO FEATURE) */}
                    {showVerification && (
                      <div className="mt-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Anti-False Closure Resolution Verification</h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold mt-0.5">
                              Officer marked this complaint as <strong>Resolved</strong> with remarks: <em>"{g.resolution?.remarks}"</em>.
                              Has this issue actually been resolved?
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2.5 border-t border-blue-100 dark:border-blue-900/60 pt-3">
                          <button
                            disabled={verifyingId !== null}
                            onClick={() => handleVerification(id, 'NO')}
                            className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>NO, Reopen Issue</span>
                          </button>
                          <button
                            disabled={verifyingId !== null}
                            onClick={() => handleVerification(id, 'YES')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>YES, Close Complaint</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column - Map & Guidelines */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b pb-2 uppercase tracking-wide">Live Grievance Mapping</h2>
            <div className="h-[280px]">
              <ComplaintMap grievances={grievances} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-border-color rounded-xl p-5 shadow-sm">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 border-b pb-1.5">Delhi Citizen Charter</h3>
            <ul className="space-y-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-[#0B3B82] dark:text-blue-400 px-1.5 py-0.2 rounded font-extrabold text-[9px] mt-0.5">1</span>
                <span>All complaints are routed automatically by Gemini AI to correct departments.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-[#0B3B82] dark:text-blue-400 px-1.5 py-0.2 rounded font-extrabold text-[9px] mt-0.5">2</span>
                <span>Officers are penalised for closing issues without actual physical resolution.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-[#0B3B82] dark:text-blue-400 px-1.5 py-0.2 rounded font-extrabold text-[9px] mt-0.5">3</span>
                <span>Critical safety concerns (live wires, gas leak) bypass routine queues.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
