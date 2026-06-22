'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/components/RoleContext';
import { ArrowLeft, BrainCircuit, FileText, Send, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const ComplaintMap = dynamic(() => import('@/components/ComplaintMap'), { ssr: false });

export default function NewGrievanceForm() {
  const router = useRouter();
  const { user } = useRole();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<any | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('citizen@gmail.com');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('North Delhi');
  const [pinCode, setPinCode] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [anonymous, setAnonymous] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({ lat: 28.6139, lng: 77.2090 });

  const handleAiAssist = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in the title and description to run AI analysis.");
      return;
    }

    setAiLoading(true);
    setAiPreview(null);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });

      if (!res.ok) throw new Error("AI analysis failed");
      const data = await res.json();
      setAiPreview(data);
    } catch (e) {
      alert("AI Service is temporarily busy. We will perform AI analysis automatically on submission.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !address || !pinCode || !coords) {
      alert("Please fill in all required fields and select coordinates on the map.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          citizen: {
            name: anonymous ? "Anonymous Citizen" : name,
            phone,
            email,
            address,
            district,
            pinCode
          },
          location: coords,
          severity,
          anonymous,
          images: [] // mock list
        })
      });

      if (!res.ok) throw new Error("Failed to submit grievance");
      
      alert("Grievance lodged successfully! AI routing assigned it to the respective officer.");
      router.push('/citizen');
    } catch (error: any) {
      alert(error.message || "Failed to submit grievance");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  const districtsList = [
    "North Delhi", "South Delhi", "East Delhi", "West Delhi", 
    "New Delhi", "Central Delhi", "North East Delhi", 
    "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara"
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-color pb-4">
        <Link href="/citizen" className="p-2 border border-border-color rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors glass-card bg-transparent shadow-none">
          <ArrowLeft className="w-4 h-4 text-slate-650 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Lodge Municipal Grievance</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Submit your complaint. Fields marked with * are mandatory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Form Panel */}
        <div className="glass-card rounded-xl p-6 shadow-sm flex flex-col gap-4.5">
          <h2 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-border-color pb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#0B3B82] dark:text-blue-400" /> Complaint Specifications
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Complaint Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken water pipe leaking on main road"
              className="glass-input rounded-lg p-2.5 text-xs focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Detailed Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact landmarks, severity details, and duration of the problem..."
              className="glass-input rounded-lg p-2.5 text-xs focus:outline-none"
            />
          </div>

          {/* AI Assist button */}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleAiAssist}
              className="bg-blue-500/10 dark:bg-blue-500/5 text-[#0B3B82] dark:text-blue-400 border border-blue-500/20 dark:border-blue-900/50 hover:bg-blue-500/20 px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer glass-card shadow-none"
            >
              <BrainCircuit className="w-4 h-4 text-[#0B3B82] dark:text-blue-400 animate-pulse" />
              <span>{aiLoading ? "AI Classifying..." : "AI Assist Route Pre-Check"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">District *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="glass-input rounded-lg p-2.5 text-xs focus:outline-none"
              >
                {districtsList.map((d) => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Pin Code *</label>
              <input
                type="text"
                required
                pattern="^[0-9]{6}$"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="1100xx"
                className="glass-input rounded-lg p-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Residential Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat/House No, Pocket, Sector, Colony"
              className="glass-input rounded-lg p-2.5 text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Reporter Name</label>
              <input
                type="text"
                disabled={anonymous}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input disabled:opacity-50 rounded-lg p-2.5 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Contact Number</label>
              <input
                type="text"
                disabled={anonymous}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input disabled:opacity-50 rounded-lg p-2.5 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 bg-slate-100/30 dark:bg-slate-950/40 p-3 rounded-lg border border-border-color">
            <div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Anonymous Mode</div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">Conceal identity from municipal officers.</p>
            </div>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-4.5 h-4.5 text-[#0B3B82] border-border-color focus:ring-0 rounded cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B3B82] hover:bg-[#072a61] disabled:bg-slate-350 text-white font-bold p-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer text-xs uppercase tracking-wider"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? "Registering Grievance..." : "File Official Complaint"}</span>
          </button>
        </div>

        {/* Right Panel - Map Picker & AI Preview */}
        <div className="flex flex-col gap-6">
          {/* Map Location Picker */}
          <div className="flex flex-col gap-2">
            <div>
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Geotagging Pick Point *</h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">Click on the map to drop the GPS location pin of the issue.</p>
            </div>
            <div className="h-[280px]">
              <ComplaintMap selectedLocation={coords} onLocationSelect={handleLocationSelect} />
            </div>
            {coords && (
              <div className="text-[10px] font-bold text-[#0B3B82] dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/5 p-2 rounded border border-blue-500/20">
                Selected GPS Coordinates: Latitude: {coords.lat.toFixed(5)}, Longitude: {coords.lng.toFixed(5)}
              </div>
            )}
          </div>

          {/* AI Precheck Preview Panel */}
          {aiPreview && (
            <div className="glass-card rounded-xl p-5 shadow-lg flex flex-col gap-3.5 animate-fade-in">
              <h3 className="font-black text-xs text-blue-650 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-border-color pb-2">
                <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" /> Gemini AI Routing Summary
              </h3>
              
              <div className="grid grid-cols-2 gap-3.5 text-xs font-bold">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Assigned Department</span>
                  <div className="text-slate-900 dark:text-slate-100 text-xs mt-0.5">{aiPreview.department}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Category</span>
                  <div className="text-slate-900 dark:text-slate-100 text-xs mt-0.5">{aiPreview.category}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">AI Priority Assignment</span>
                  <div className="text-slate-900 dark:text-slate-100 text-xs mt-0.5 uppercase tracking-wide flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      aiPreview.priority === 'Urgent' ? 'bg-red-500' :
                      aiPreview.priority === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></span>
                    {aiPreview.priority}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">AI Urgency Rating</span>
                  <div className={`text-sm font-black mt-0.5 ${
                    aiPreview.urgencyScore > 80 ? 'text-red-500 animate-pulse' :
                    aiPreview.urgencyScore > 50 ? 'text-orange-400' : 'text-blue-450'
                  }`}>
                    {aiPreview.urgencyScore} / 100
                  </div>
                </div>
              </div>

              {aiPreview.isCriticalAlert && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-[10px] text-red-600 dark:text-red-400 font-bold flex items-start gap-1.5 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="uppercase block text-red-500 font-black">EMERGENCY CRITICAL ALERT DETECTED</span>
                    Exposed emergency terms trigger immediate War Room escalation.
                  </div>
                </div>
              )}

              <div className="border-t border-border-color pt-3">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">AI Summary</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold italic mt-1">
                  "{aiPreview.summary}"
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Identified Keywords</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {aiPreview.keywords.map((kw: string, i: number) => (
                    <span key={i} className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-450 px-2 py-0.5 rounded text-[10px] font-bold border border-border-color">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
