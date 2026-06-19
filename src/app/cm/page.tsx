'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, CheckCircle, Clock, AlertTriangle, 
  Map, BarChart3, HelpCircle, Activity, Sparkles, 
  ArrowUpRight, Users, Landmark, Heart
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(() => import('@/components/ComplaintMap'), { ssr: false });

interface IWarRoomLog {
  time: string;
  type: 'registered' | 'assigned' | 'resolved' | 'reopened' | 'critical';
  text: string;
}

export default function CmDashboard() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<IWarRoomLog[]>([]);

  // District rankings list
  const districtRankings = [
    { rank: 1, name: "South Delhi", accuracy: 96, avgTime: "1.5 Days", satisfaction: 94 },
    { rank: 2, name: "New Delhi", accuracy: 94, avgTime: "1.8 Days", satisfaction: 91 },
    { rank: 3, name: "West Delhi", accuracy: 88, avgTime: "2.5 Days", satisfaction: 86 },
    { rank: 4, name: "North Delhi", accuracy: 84, avgTime: "3.2 Days", satisfaction: 81 },
    { rank: 5, name: "East Delhi", accuracy: 68, avgTime: "5.4 Days", satisfaction: 60 } // Poor because of Sanjay Sharma
  ];

  const fetchCmData = async () => {
    try {
      const res = await fetch('/api/grievances');
      const data = await res.json();
      setGrievances(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmData();
    
    // Seed initial War Room logs
    const now = new Date();
    setLogs([
      { time: "22:42:01", type: 'critical', text: "Critical Alert registered in Rohini: Sparking cables near school." },
      { time: "22:38:15", type: 'reopened', text: "Citizen disputed resolution #G482. Complaint Reopened." },
      { time: "22:31:40", type: 'resolved', text: "Grievance resolved: MCD cleared Mayur Vihar dumping yard." },
      { time: "22:25:12", type: 'assigned', text: "Officer Sanjay Sharma assigned to water contamination case." },
      { time: "22:18:03", type: 'registered', text: "Grievance registered in Dwarka Sector 12: Low water pressure." }
    ]);

    // Setup simulated live stream updates for the War Room
    const types: IWarRoomLog['type'][] = ['registered', 'assigned', 'resolved', 'reopened', 'critical'];
    const districts = ["South Delhi", "West Delhi", "East Delhi", "North Delhi", "Central Delhi"];
    const cats = ["Water Supply", "Sanitation", "Electricity Post", "Pothole Damage", "DTC Transit"];
    const names = ["Inspector Rajesh", "Officer Sharma", "Meenakshi Dey", "System Router"];

    const interval = setInterval(() => {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomDist = districts[Math.floor(Math.random() * districts.length)];
      const randomCat = cats[Math.floor(Math.random() * cats.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const timeStr = new Date().toTimeString().split(' ')[0];

      let text = '';
      switch (randomType) {
        case 'registered':
          text = `New complaint registered in ${randomDist}: ${randomCat} failure.`;
          break;
        case 'assigned':
          text = `AI Router assigned ${randomDist} ${randomCat} complaint to ${randomName}.`;
          break;
        case 'resolved':
          text = `${randomName} marked the ${randomDist} ${randomCat} grievance as RESOLVED.`;
          break;
        case 'reopened':
          text = `Grievance #${Math.floor(Math.random()*9000+1000)} in ${randomDist} reopened: Citizen flagged false closure!`;
          break;
        case 'critical':
          text = `⚠️ CRITICAL ESCALATION: ${randomCat} emergency reported in ${randomDist}.`;
          break;
      }

      setLogs(prev => [
        { time: timeStr, type: randomType, text },
        ...prev.slice(0, 14) // keep last 15 items
      ]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Aggregate metrics
  const total = grievances.length;
  const pending = grievances.filter(g => g.status === 'Pending' || g.status === 'In Progress').length;
  const resolved = grievances.filter(g => g.status === 'Resolved').length;
  const critical = grievances.filter(g => g.isCriticalAlert && g.status !== 'Resolved').length;
  
  const falseClosuresCount = grievances.filter(g => g.falseClosureCount > 0).length;
  const falseClosureRate = total > 0 ? Math.round((falseClosuresCount / total) * 100) : 0;
  
  // Overall satisfaction
  const satisfactionRate = 84; // mock Delhi wide rate
  const deptTrustIndex = 88;
  const officerTrustIndex = 86;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-color pb-4">
        <div>
          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>NAGRIK Executive Command Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Chief Minister's Intelligence Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/cm"
            className="bg-[#0B3B82] text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-md"
          >
            War Room Overview
          </Link>
          <Link
            href="/cm/visit"
            className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-border-color px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Map className="w-4 h-4 text-[#0B3B82] dark:text-blue-400" />
            <span>CM Visit Intelligence</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-border-color p-4 rounded-xl shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Lodged</span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{total}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4 rounded-xl shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Open Grievances</span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{pending}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4 rounded-xl shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Resolved</span>
          <div className="text-lg font-black text-emerald-600 mt-0.5">{resolved}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4 rounded-xl shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Critical Alerts</span>
          <div className={`text-lg font-black mt-0.5 ${critical > 0 ? 'text-red-500 animate-pulse-red' : 'text-slate-500'}`}>
            {critical}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4 rounded-xl shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Satisfaction</span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{satisfactionRate}%</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4 rounded-xl shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">False Closures</span>
          <div className={`text-lg font-black mt-0.5 ${falseClosureRate > 10 ? 'text-red-500 font-bold' : 'text-slate-900 dark:text-white'}`}>
            {falseClosureRate}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4 rounded-xl shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Officer Trust</span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{officerTrustIndex}%</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-border-color p-4 rounded-xl shadow-sm">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Dept Trust</span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{deptTrustIndex}%</div>
        </div>

      </div>

      {/* Main Grid: Live War Room Map & Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Grid: Live Activity War Room Feed */}
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-md flex flex-col gap-4 h-[450px]">
          <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
            <h3 className="font-black text-xs text-red-500 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Real-Time War Room Feed</span>
            </h3>
            <span className="text-[9px] bg-red-950/60 border border-red-900 text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
              Live updates
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2.5 items-start text-[11px] leading-relaxed border-b border-slate-950 pb-2">
                <span className="text-slate-500 font-mono shrink-0 mt-0.5">{log.time}</span>
                <div className="flex-1">
                  <span className={`inline-block mr-1.5 text-[8px] font-black uppercase px-1 rounded ${
                    log.type === 'critical' ? 'bg-red-950 text-red-400 border border-red-900' :
                    log.type === 'reopened' ? 'bg-orange-950 text-orange-400 border border-orange-900' :
                    log.type === 'resolved' ? 'bg-green-950 text-green-400 border border-green-900' : 'bg-slate-850 text-slate-400'
                  }`}>
                    {log.type}
                  </span>
                  <span className="font-semibold text-slate-350">{log.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Grid: Live Hotspot Intelligence Map */}
        <div className="bg-white dark:bg-slate-900 border border-border-color rounded-xl p-5 shadow-sm flex flex-col gap-4 h-[450px]">
          <div className="border-b pb-2">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Delhi Hotspot Intelligence Map</h3>
          </div>
          <div className="flex-1">
            <ComplaintMap grievances={grievances} />
          </div>
        </div>

        {/* Right Grid: AI Insights Panel */}
        <div className="bg-white dark:bg-slate-900 border border-border-color rounded-xl p-5 shadow-sm flex flex-col gap-4 h-[450px]">
          <div className="border-b pb-2 flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>AI Governance Insights</span>
            </h3>
            <span className="text-[9px] text-slate-400 uppercase font-bold">Dynamic Trends</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wide">⚠️ Sector Spike detected</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                "East Delhi has experienced a 37% rise in water supply complaints over the last week."
              </p>
              <div className="text-[9px] text-slate-400 font-semibold mt-1">Recommended Action: Direct DJB CEO to audit pipe leaks in Mayur Vihar.</div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="text-[10px] text-blue-700 dark:text-blue-400 font-extrabold uppercase tracking-wide">⚡ Utility Bottleneck</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                "Electrical complaints in Rohini have increased by 24%."
              </p>
              <div className="text-[9px] text-slate-400 font-semibold mt-1">Recommended Action: Deploy supplementary linemen in North Delhi division.</div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-extrabold uppercase tracking-wide">🛣️ Infrastructure Density</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                "Road maintenance complaints are concentrated around South Delhi flyovers."
              </p>
              <div className="text-[9px] text-slate-400 font-semibold mt-1">Recommended Action: Schedule spot inspections of Lajpat Nagar repair sites.</div>
            </div>

          </div>
        </div>

      </div>

      {/* District Rankings Table */}
      <div className="bg-white dark:bg-slate-900 border border-border-color rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="p-4 border-b border-border-color bg-slate-50 dark:bg-slate-900/60 flex justify-between items-center">
          <h2 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Delhi Districts Grievance Performance Rankings
          </h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase">All 11 Districts Monitored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-color text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100/50 dark:bg-slate-950/40">
                <th className="p-4">Rank</th>
                <th className="p-4">District Region</th>
                <th className="p-4 text-center">Resolution Rate</th>
                <th className="p-4 text-center">Average Resolution Time</th>
                <th className="p-4 text-center">Citizen Satisfaction Index</th>
                <th className="p-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color text-xs font-semibold">
              {districtRankings.map((dist) => (
                <tr key={dist.rank} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 text-slate-500">#{dist.rank}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{dist.name}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      dist.accuracy > 90 ? 'bg-green-100 text-green-800' :
                      dist.accuracy > 80 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {dist.accuracy}%
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-700 dark:text-slate-200">{dist.avgTime}</td>
                  <td className="p-4 text-center text-slate-700 dark:text-slate-200">{dist.satisfaction}%</td>
                  <td className="p-4 text-right">
                    <span className={`inline-block text-[10px] font-extrabold uppercase ${
                      dist.accuracy > 80 ? 'text-green-600' : 'text-red-500 animate-pulse'
                    }`}>
                      {dist.accuracy > 80 ? 'Secure' : 'Review Triggered'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
