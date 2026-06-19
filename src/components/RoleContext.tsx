'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface IUserProfile {
  name: string;
  username: string;
  role: 'Citizen' | 'Officer' | 'Department Head' | 'Chief Minister';
  department?: string;
  district?: string;
}

interface IRoleContext {
  user: IUserProfile;
  setRole: (role: IUserProfile['role']) => void;
  isLoading: boolean;
}

const mockProfiles: Record<IUserProfile['role'], IUserProfile> = {
  'Citizen': {
    name: "Gourav Kumar",
    username: "citizen",
    role: "Citizen"
  },
  'Officer': {
    name: "Inspector Rajesh Kumar",
    username: "officer_power",
    role: "Officer",
    department: "Power Department",
    district: "North Delhi"
  },
  'Department Head': {
    name: "Anil Baijal",
    username: "depthead_power",
    role: "Department Head",
    department: "Power Department"
  },
  'Chief Minister': {
    name: "Arvind Kejriwal",
    username: "cm",
    role: "Chief Minister"
  }
};

const RoleContext = createContext<IRoleContext | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<IUserProfile>(mockProfiles['Citizen']);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedRole = localStorage.getItem('nagrik_role') as IUserProfile['role'];
    if (savedRole && mockProfiles[savedRole]) {
      setUserState(mockProfiles[savedRole]);
    }
    setIsLoading(false);
  }, []);

  const setRole = (role: IUserProfile['role']) => {
    const newProfile = mockProfiles[role];
    setUserState(newProfile);
    localStorage.setItem('nagrik_role', role);
    
    // Redirect based on role
    if (role === 'Citizen') {
      router.push('/citizen');
    } else if (role === 'Officer') {
      router.push('/officer');
    } else if (role === 'Department Head') {
      router.push('/dept-head');
    } else if (role === 'Chief Minister') {
      router.push('/cm');
    }
  };

  return (
    <RoleContext.Provider value={{ user, setRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
