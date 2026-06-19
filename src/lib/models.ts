import mongoose, { Schema, Document } from 'mongoose';

// User Interface and Schema
export interface IUser {
  name: string;
  username: string;
  password?: string;
  role: 'Citizen' | 'Officer' | 'Department Head' | 'Chief Minister';
  department?: string;
  district?: string;
  trustScore: number;
  resolutionAccuracy: number;
  citizenSatisfaction: number;
  falseClosures: number;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, required: true, enum: ['Citizen', 'Officer', 'Department Head', 'Chief Minister'] },
  department: { type: String },
  district: { type: String },
  trustScore: { type: Number, default: 100 },
  resolutionAccuracy: { type: Number, default: 100 },
  citizenSatisfaction: { type: Number, default: 100 },
  falseClosures: { type: Number, default: 0 }
}, { timestamps: true });

// Grievance Interface and Schema
export interface IGrievance {
  id?: string;
  _id?: any;
  title: string;
  description: string;
  citizen: {
    name: string;
    phone: string;
    email: string;
    address: string;
    district: string;
    pinCode: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Reopened';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: string;
  department: string;
  severity: 'Low' | 'Medium' | 'High';
  anonymous: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  aiAnalysis?: {
    category: string;
    department: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    sentiment: string;
    summary: string;
    keywords: string[];
    urgencyScore: number;
  };
  assignedOfficer?: {
    id: string;
    name: string;
    trustScore?: number;
  };
  resolution?: {
    remarks: string;
    images: string[];
    video?: string;
    location?: { lat: number; lng: number };
    timestamp: Date;
  };
  falseClosureCount: number;
  isDuplicate: boolean;
  masterGrievanceId?: string;
  supportingCount: number;
  isCriticalAlert: boolean;
  emergencyScore: number;
}

const GrievanceSchema = new Schema<IGrievance>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  citizen: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    pinCode: { type: String, required: true }
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { type: String, required: true, enum: ['Pending', 'In Progress', 'Resolved', 'Reopened'], default: 'Pending' },
  priority: { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  category: { type: String, required: true },
  department: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  anonymous: { type: Boolean, default: false },
  images: [{ type: String }],
  aiAnalysis: {
    category: { type: String },
    department: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'] },
    sentiment: { type: String },
    summary: { type: String },
    keywords: [{ type: String }],
    urgencyScore: { type: Number }
  },
  assignedOfficer: {
    id: { type: String },
    name: { type: String },
    trustScore: { type: Number }
  },
  resolution: {
    remarks: { type: String },
    images: [{ type: String }],
    video: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    timestamp: { type: Date }
  },
  falseClosureCount: { type: Number, default: 0 },
  isDuplicate: { type: Boolean, default: false },
  masterGrievanceId: { type: String },
  supportingCount: { type: Number, default: 0 },
  isCriticalAlert: { type: Boolean, default: false },
  emergencyScore: { type: Number, default: 0 }
}, { timestamps: true });

// Audit Log Interface and Schema
export interface IAuditLog {
  action: string;
  performedBy: string;
  role: string;
  targetId?: string;
  details: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  role: { type: String, required: true },
  targetId: { type: String },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Avoid OverwriteModelError
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Grievance = mongoose.models.Grievance || mongoose.model<IGrievance>('Grievance', GrievanceSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
