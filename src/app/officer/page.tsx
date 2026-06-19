'use client';

import React, { useEffect, useState } from 'react';
import { useRole } from '@/components/RoleContext';
import { 
  ShieldAlert, CheckCircle, Clock, AlertTriangle, 
  MapPin, Eye, FileText, Check, Award, ShieldAlert as AlertIcon, 
  X, Camera, Video
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useRole();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'critical' | 'inprogress' | 'resolved'>('assigned');
  
  // Selected grievance detail view / resolution modal state
  const [selectedGrievance, setSelectedGrievance] = useState<any | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [proofVideo, setProofVideo] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Officer rating metrics fetched dynamically
  const [officerMetrics, setOfficerMetrics] = useState({
    trustScore: 92,
    resolutionAccuracy: 88,
    citizenSatisfaction: 85,
    falseClosures: 1
  });

  const fetchOfficerData = async () => {
    try {
      setLoading(true);
      // Fetch all grievances and filter for this officer
      const res = await fetch('/api/grievances');
      const data = await res.json();
      
      const filtered = data.filter((g: any) => g.assignedOfficer?.id === user.username);
      setGrievances(filtered);

      // Fetch officer user profile to get live metrics
      const usersRes = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, password: 'password' }) // Seed passwords are 'password'
      });
      if (usersRes.ok) {
        const profile = await usersRes.json();
        setOfficerMetrics({
          trustScore: profile.user.trustScore,
          resolutionAccuracy: profile.user.resolutionAccuracy,
          citizenSatisfaction: profile.user.citizenSatisfaction,
          falseClosures: profile.user.falseClosures || 0
        });
      }
    } catch (e) {
      console.error("Failed to fetch officer data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, [user.username]);

  const handleAcceptGrievance = async (id: string) => {
    try {
      const res = await fetch(`/api/grievances/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'In Progress',
          assignedOfficer: {
            id: user.username,
            name: user.name
          }
        })
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      alert("Grievance accepted. Status set to 'In Progress'.");
      fetchOfficerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolveGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      alert("Please enter resolution remarks.");
      return;
    }

    setSubmittingResolution(true);
    try {
      const res = await fetch(`/api/grievances/${selectedGrievance.id || selectedGrievance._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Resolved',
          resolution: {
            remarks,
            images: ["proof_closure_gps_validated.jpg"], // simulated file upload
            video: proofVideo || "",
            location: selectedGrievance.location,
            timestamp: new Date()
          },
          assignedOfficer: {
            id: user.username,
            name: user.name
          }
        })
      });

      if (!res.ok) throw new Error("Failed to resolve grievance");

      alert("Resolution submitted! Citizen has been notified via SMS and Email for verification.");
      setShowResolveModal(false);
      setSelectedGrievance(null);
      setRemarks('');
      setProofVideo('');
      fetchOfficerData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingResolution(false);
    }
  };

  // Filtering list based on tab
  const getFilteredGrievances = () => {
    switch (activeTab) {
      case 'critical':
        return grievances.filter(g => g.isCriticalAlert && g.status !== 'Resolved');
      case 'inprogress':
        return grievances.filter(g => g.status === 'In Progress');
      case 'resolved':
        return grievances.filter(g => g.status === 'Resolved');
      default: // 'assigned' (all open cases)
        return grievances.filter(g => g.status !== 'Resolved');
    }
  };

  const activeGrievances = getFilteredGrievances();

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Officer Grievance Desk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage and resolve public complaints assigned to your jurisdiction.</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
          HQ: {user.district} Region
        </div>
      </div>

      {/* Trust Rating & Accountability Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-border-color p-5 rounded-xl shadow-sm">
        <div className="flex flex-col items-center justify-center p-3 text-center border-b md:border-b-0 md:border-r border-border-color">
          <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-full text-[#0B3B82] dark:text-blue-400 mb-2">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trust Score</span>
          <div className={`text-xl font-black mt-1 ${
            officerMetrics.trustScore > 85 ? 'text-green-600' :
            officerMetrics.trustScore > 70 ? 'text-amber-500' : 'text-red-500 font-bold'
          }`}>{officerMetrics.trustScore}%</div>
          <p className="text-[9px] text-slate-400 mt-1 font-semibold">Affected by disputed closures</p>
        </div>

        <div className="flex flex-col items-center justify-center p-3 text-center border-b md:border-b-0 md:border-r border-border-color">
          <div className="bg-green-50 dark:bg-green-950/40 p-2.5 rounded-full text-green-600 dark:text-green-400 mb-2">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Resolution Accuracy</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{officerMetrics.resolutionAccuracy}%</div>
          <p className="text-[9px] text-slate-400 mt-1 font-semibold">Target standard: 90%</p>
        </div>

        <div className="flex flex-col items-center justify-center p-3 text-center border-b md:border-b-0 md:border-r border-border-color">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-full text-amber-500 dark:text-amber-400 mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Citizen Satisfaction</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{officerMetrics.citizenSatisfaction}%</div>
          <p className="text-[9px] text-slate-400 mt-1 font-semibold">Based on verified feedback</p>
        </div>

        <div className="flex flex-col items-center justify-center p-3 text-center">
          <div className="bg-red-50 dark:bg-red-950/40 p-2.5 rounded-full text-red-550 dark:text-red-400 mb-2">
            <AlertIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Disputed Closures</span>
          <div className={`text-xl font-black mt-1 ${officerMetrics.falseClosures > 0 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
            {officerMetrics.falseClosures}
          </div>
          <p className="text-[9px] text-slate-400 mt-1 font-semibold">False Closure reopens</p>
        </div>
      </div>

      {/* Workspace Tabs & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Tabs */}
        <div className="bg-white dark:bg-slate-900 border border-border-color rounded-xl p-4.5 shadow-sm flex flex-col gap-1.5">
          <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mb-2 border-b pb-1.5">Case Folders</h3>
          
          <button
            onClick={() => setActiveTab('assigned')}
            className={`text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'assigned'
                ? 'bg-[#0B3B82] text-white'
                : 'text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Assigned Complaints</span>
            <span className="bg-blue-100 text-[#0B3B82] text-[10px] px-1.5 py-0.5 rounded font-black">
              {grievances.filter(g => g.status !== 'Resolved').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('critical')}
            className={`text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'critical'
                ? 'bg-[#0B3B82] text-white'
                : 'text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1">
              Critical Cases ⚠️
            </span>
            <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded font-black">
              {grievances.filter(g => g.isCriticalAlert && g.status !== 'Resolved').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inprogress')}
            className={`text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'inprogress'
                ? 'bg-[#0B3B82] text-white'
                : 'text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>In Progress</span>
            <span className="bg-blue-100 text-[#0B3B82] text-[10px] px-1.5 py-0.5 rounded font-black">
              {grievances.filter(g => g.status === 'In Progress').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'resolved'
                ? 'bg-[#0B3B82] text-white'
                : 'text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Resolved Cases</span>
            <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-black">
              {grievances.filter(g => g.status === 'Resolved').length}
            </span>
          </button>
        </div>

        {/* Complaints Table Area */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-border-color rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border-color flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
            <h2 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              {activeTab === 'assigned' && "Assigned Queue"}
              {activeTab === 'critical' && "Critical Urgency Bypasses"}
              {activeTab === 'inprogress' && "Cases In Progress"}
              {activeTab === 'resolved' && "Resolved Log"}
            </h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{activeGrievances.length} cases found</span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400 font-bold text-xs">Loading grievance roster...</div>
          ) : activeGrievances.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
              <CheckCircle className="w-10 h-10 text-slate-200 dark:text-slate-800" />
              <div className="font-bold text-slate-400 text-xs">Queue Cleared</div>
              <p className="text-[10px] text-slate-450 max-w-xs">There are no complaints under this folder status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-color text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100/50 dark:bg-slate-950/40">
                    <th className="p-4">Complaint ID</th>
                    <th className="p-4">Citizen</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Submitted</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color text-xs font-semibold">
                  {activeGrievances.map((g) => {
                    const id = String(g.id || g._id);
                    return (
                      <tr 
                        key={id} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          g.status === 'Reopened' ? 'bg-orange-50/20 dark:bg-orange-950/10' : ''
                        }`}
                      >
                        <td className="p-4 font-mono text-[10px] text-[#0B3B82] dark:text-blue-400">#{id.substring(0, 8)}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{g.citizen.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{g.citizen.district}</div>
                        </td>
                        <td className="p-4 text-slate-650 dark:text-slate-350">{g.category}</td>
                        <td className="p-4">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            g.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                            g.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {g.priority}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{new Date(g.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            g.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            g.status === 'In Progress' ? 'bg-blue-100 text-blue-850' :
                            g.status === 'Reopened' ? 'bg-orange-100 text-orange-850 animate-pulse' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {g.status === 'Pending' && (
                              <button
                                onClick={() => handleAcceptGrievance(id)}
                                className="bg-blue-50 hover:bg-[#0B3B82] text-[#0B3B82] hover:text-white border border-blue-200 dark:border-blue-900/60 p-1.5 rounded transition-all cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                                title="Accept Case"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept</span>
                              </button>
                            )}

                            {(g.status === 'In Progress' || g.status === 'Reopened' || g.status === 'Pending') && (
                              <button
                                onClick={() => {
                                  setSelectedGrievance(g);
                                  setShowResolveModal(true);
                                }}
                                className="bg-[#0B3B82] hover:bg-[#072a61] text-white p-1.5 rounded transition-all cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                                title="Submit Resolution"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Resolve</span>
                              </button>
                            )}

                            {g.status === 'Resolved' && (
                              <span className="text-[10px] text-slate-400 font-bold uppercase py-1 px-2">Completed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* RESOLUTION MODAL */}
      {showResolveModal && selectedGrievance && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-border-color rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="bg-[#0B3B82] text-white p-4.5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Submit Resolution Signature</h3>
                <p className="text-[10px] text-blue-200 mt-0.5 font-semibold">Complaint ID: #{String(selectedGrievance.id || selectedGrievance._id).substring(0, 10)}</p>
              </div>
              <button 
                onClick={() => {
                  setShowResolveModal(false);
                  setSelectedGrievance(null);
                }}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolveGrievanceSubmit} className="p-6 flex flex-col gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-border-color text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Description</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  "{selectedGrievance.title}"
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {selectedGrievance.description}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Resolution Actions Taken *</label>
                <textarea
                  required
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Describe exact physical modifications, repairs completed, or investigations resolved..."
                  className="bg-slate-50 dark:bg-slate-950 border border-border-color rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#0B3B82]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Proof Photo Upload</label>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-border-color rounded-lg p-3 text-center flex flex-col items-center justify-center gap-1 hover:border-[#0B3B82] cursor-pointer">
                    <Camera className="w-5 h-5 text-slate-450" />
                    <span className="text-[9px] font-semibold text-slate-500">proof_closure_gps.jpg</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase">Proof Video Attachment</label>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-border-color rounded-lg p-3 text-center flex flex-col items-center justify-center gap-1 hover:border-[#0B3B82] cursor-pointer">
                    <Video className="w-5 h-5 text-slate-450" />
                    <span className="text-[9px] font-semibold text-slate-500">Upload brief .mp4</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-900/60 text-[10px] font-semibold flex items-start gap-2 text-slate-600 dark:text-slate-350">
                <MapPin className="w-4 h-4 text-[#0B3B82] dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[#0B3B82] dark:text-blue-300 font-extrabold uppercase">GPS Signature Embedded</span>
                  Geotagged coordinates: Lat: {selectedGrievance.location.lat.toFixed(5)}, Lng: {selectedGrievance.location.lng.toFixed(5)} &bull; Time: {new Date().toLocaleTimeString()}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingResolution}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider mt-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submittingResolution ? "Submitting Signature..." : "Sign Resolution & Close Case"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
