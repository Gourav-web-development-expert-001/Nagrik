'use client';

import React from 'react';
import { useRole, IUserProfile } from './RoleContext';
import { ShieldAlert, User, Shield, Briefcase } from 'lucide-react';

export default function RoleSwitcher() {
  const { user, setRole, isLoading } = useRole();

  if (isLoading) return null;

  const rolesList: { role: IUserProfile['role']; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      role: 'Citizen', 
      label: 'Citizen Portal', 
      icon: <User className="w-4 h-4" />, 
      desc: 'Submit and track grievances' 
    },
    { 
      role: 'Officer', 
      label: 'Officer Desk', 
      icon: <Briefcase className="w-4 h-4" />, 
      desc: 'Resolve complaints & update status' 
    },
    { 
      role: 'Department Head', 
      label: 'Department H.Q.', 
      icon: <Shield className="w-4 h-4" />, 
      desc: 'Review metrics & officer ratings' 
    },
    { 
      role: 'Chief Minister', 
      label: 'CM War Room', 
      icon: <ShieldAlert className="w-4 h-4" />, 
      desc: 'Delhi overall intelligence & alerts' 
    }
  ];

  return (
    <div className="bg-[#0B3B82] text-white border-b border-blue-900 py-1.5 px-4 sticky top-0 z-50 text-xs shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase animation-pulse">
            DEMO MODE
          </span>
          <span className="font-medium text-blue-200">
            Active Identity: <strong className="text-white font-bold">{user.name}</strong> ({user.role}) {user.department ? ` - ${user.department}` : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-blue-300 font-medium mr-1">Switch View:</span>
          {rolesList.map((r) => (
            <button
              key={r.role}
              onClick={() => setRole(r.role)}
              title={r.desc}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all duration-200 font-semibold cursor-pointer ${
                user.role === r.role
                  ? 'bg-white text-[#0B3B82] shadow-sm scale-105'
                  : 'bg-blue-950 text-blue-200 hover:bg-blue-900 hover:text-white'
              }`}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
