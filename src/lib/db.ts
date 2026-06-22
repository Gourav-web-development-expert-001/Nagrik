import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { User, Grievance, AuditLog, IGrievance, IUser, IAuditLog } from './models';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Ensure the src/data directory exists
const ensureDataDir = () => {
  const dir = path.dirname(DB_JSON_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Seed Data definition
const seedUsers: IUser[] = [
  {
    name: "Rekha Gupta",
    username: "cm",
    password: "password",
    role: "Chief Minister",
    avatar: "/rekha_gupta.png",
    trustScore: 100,
    resolutionAccuracy: 100,
    citizenSatisfaction: 100,
    falseClosures: 0
  },
  {
    name: "Anil Baijal",
    username: "depthead_power",
    password: "password",
    role: "Department Head",
    department: "Power Department",
    trustScore: 100,
    resolutionAccuracy: 100,
    citizenSatisfaction: 100,
    falseClosures: 0
  },
  {
    name: "Vijay Dev",
    username: "depthead_water",
    password: "password",
    role: "Department Head",
    department: "Water Department",
    trustScore: 100,
    resolutionAccuracy: 100,
    citizenSatisfaction: 100,
    falseClosures: 0
  },
  {
    name: "Inspector Rajesh Kumar",
    username: "officer_power",
    password: "password",
    role: "Officer",
    department: "Power Department",
    district: "North Delhi",
    trustScore: 92,
    resolutionAccuracy: 88,
    citizenSatisfaction: 85,
    falseClosures: 1
  },
  {
    name: "Sanjay Sharma",
    username: "officer_water",
    password: "password",
    role: "Officer",
    department: "Water Department",
    district: "East Delhi",
    trustScore: 68,
    resolutionAccuracy: 70,
    citizenSatisfaction: 62,
    falseClosures: 4
  },
  {
    name: "Meenakshi Dey",
    username: "officer_sanitation",
    password: "password",
    role: "Officer",
    department: "Sanitation Department",
    district: "South Delhi",
    trustScore: 98,
    resolutionAccuracy: 96,
    citizenSatisfaction: 94,
    falseClosures: 0
  },
  {
    name: "Gourav Kumar",
    username: "citizen",
    password: "password",
    role: "Citizen",
    trustScore: 100,
    resolutionAccuracy: 100,
    citizenSatisfaction: 100,
    falseClosures: 0
  }
];

const seedGrievances = (now: Date): IGrievance[] => [
  {
    title: "Exposed live wires and broken streetlight near Sector 15",
    description: "Streetlight failure with exposed electrical wires causing immediate safety hazard to children playing nearby. High risk of shock in the monsoon season.",
    citizen: {
      name: "Amit Patel",
      phone: "9876543210",
      email: "amit.patel@gmail.com",
      address: "Pocket 4, Sector 15",
      district: "North Delhi",
      pinCode: "110085"
    },
    location: { lat: 28.7247, lng: 77.1205 }, // Rohini Sector 15
    status: "Resolved",
    priority: "High",
    category: "Electricity",
    department: "Power Department",
    severity: "High",
    anonymous: false,
    images: [],
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    aiAnalysis: {
      category: "Electricity",
      department: "Power Department",
      priority: "High",
      sentiment: "Negative / Dangerous",
      summary: "Streetlight failure with exposed electrical wires causing safety hazard.",
      keywords: ["streetlight", "wires", "exposed", "safety"],
      urgencyScore: 91
    },
    assignedOfficer: {
      id: "officer_power",
      name: "Inspector Rajesh Kumar",
      trustScore: 92
    },
    resolution: {
      remarks: "Replaced the damaged streetlight fixture and safely taped and insulated the exposed cables inside the pole junction box. Tested and verified working.",
      images: [],
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    },
    falseClosureCount: 0,
    isDuplicate: false,
    supportingCount: 0,
    isCriticalAlert: true,
    emergencyScore: 91
  },
  {
    title: "Contaminated muddy water supply in Dwarka Sector 12",
    description: "The tap water supplied for the last 48 hours is dark brown, smelling foul, and muddy. We cannot use it for cooking or bathing. Multiple households affected.",
    citizen: {
      name: "Preeti Sharma",
      phone: "9911223344",
      email: "preeti.sharma@yahoo.com",
      address: "Delhi Apartments, Sector 12",
      district: "West Delhi",
      pinCode: "110075"
    },
    location: { lat: 28.5921, lng: 77.0460 }, // Dwarka
    status: "Pending",
    priority: "Urgent",
    category: "Water",
    department: "Water Department",
    severity: "High",
    anonymous: false,
    images: [],
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    aiAnalysis: {
      category: "Water",
      department: "Water Department",
      priority: "Urgent",
      sentiment: "Negative / Health Hazard",
      summary: "Muddy and foul-smelling tap water supply affecting multiple households in Dwarka Sector 12.",
      keywords: ["water supply", "muddy", "contaminated", "foul smell"],
      urgencyScore: 89
    },
    assignedOfficer: {
      id: "officer_water",
      name: "Sanjay Sharma",
      trustScore: 68
    },
    falseClosureCount: 0,
    isDuplicate: false,
    supportingCount: 0,
    isCriticalAlert: true,
    emergencyScore: 89
  },
  {
    title: "Potholes on Ring Road near Lajpat Nagar Metro Station",
    description: "Large potholes have developed on the main flyover exit, causing cars to brake suddenly and creating massive traffic jams during peak office hours.",
    citizen: {
      name: "Rajesh Malhotra",
      phone: "9810054321",
      email: "rajesh.m@gmail.com",
      address: "K-Block, Lajpat Nagar II",
      district: "South Delhi",
      pinCode: "110024"
    },
    location: { lat: 28.5708, lng: 77.2372 }, // Lajpat Nagar
    status: "In Progress",
    priority: "High",
    category: "Road",
    department: "Public Works Department",
    severity: "Medium",
    anonymous: true,
    images: [],
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    aiAnalysis: {
      category: "Road",
      department: "Public Works Department",
      priority: "High",
      sentiment: "Frustrated",
      summary: "Large potholes near Lajpat Nagar flyover causing traffic jams and vehicle hazards.",
      keywords: ["potholes", "road damage", "traffic", "lajpat nagar"],
      urgencyScore: 72
    },
    assignedOfficer: {
      id: "officer_sanitation", // Handled by standard officer
      name: "Meenakshi Dey",
      trustScore: 98
    },
    falseClosureCount: 0,
    isDuplicate: false,
    supportingCount: 0,
    isCriticalAlert: false,
    emergencyScore: 0
  },
  {
    title: "Garbage piled up near Mayur Vihar Phase 1 market",
    description: "The garbage bin in Mayur Vihar Phase 1 block pocket 2 market is overflowing. It has not been cleared for 7 days. Stray dogs are scattering trash, smelling extremely bad.",
    citizen: {
      name: "Karan Singh",
      phone: "9560112233",
      email: "karan.singh@gmail.com",
      address: "Pocket 2, Mayur Vihar Phase 1",
      district: "East Delhi",
      pinCode: "110091"
    },
    location: { lat: 28.6095, lng: 77.2912 }, // Mayur Vihar
    status: "Reopened",
    priority: "Medium",
    category: "Sanitation",
    department: "Sanitation Department",
    severity: "Medium",
    anonymous: false,
    images: [],
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    aiAnalysis: {
      category: "Sanitation",
      department: "Sanitation Department",
      priority: "Medium",
      sentiment: "Unhappy",
      summary: "Overflowing garbage dump site not cleared for a week causing hygiene concerns.",
      keywords: ["garbage", "trash", "overflowing", "hygiene"],
      urgencyScore: 54
    },
    assignedOfficer: {
      id: "officer_water", // Assigned to Sanjay Sharma (poorly performing)
      name: "Sanjay Sharma",
      trustScore: 68
    },
    resolution: {
      remarks: "Sent garbage truck, bin cleared. (Resolved but citizen disputed)",
      images: [],
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    },
    falseClosureCount: 1,
    isDuplicate: false,
    supportingCount: 0,
    isCriticalAlert: false,
    emergencyScore: 0
  }
];

// JSON Database Helper
let mockDbMemory: {
  users: IUser[];
  grievances: IGrievance[];
  auditLogs: IAuditLog[];
} | null = null;

const loadMockDb = () => {
  if (mockDbMemory) return mockDbMemory;
  
  ensureDataDir();
  if (fs.existsSync(DB_JSON_PATH)) {
    try {
      const data = fs.readFileSync(DB_JSON_PATH, 'utf-8');
      mockDbMemory = JSON.parse(data);
      return mockDbMemory!;
    } catch (e) {
      console.error("Failed to read JSON DB, reinitializing...", e);
    }
  }

  // Initialize with seed data
  const now = new Date();
  mockDbMemory = {
    users: [...seedUsers],
    grievances: seedGrievances(now),
    auditLogs: [
      {
        action: "System Initialized",
        performedBy: "System Administrator",
        role: "Chief Minister",
        details: "NAGRIK Governance Platform initialized with seed database.",
        timestamp: now
      }
    ]
  };
  saveMockDb();
  return mockDbMemory!;
};

const saveMockDb = () => {
  if (!mockDbMemory) return;
  ensureDataDir();
  fs.writeFileSync(DB_JSON_PATH, JSON.stringify(mockDbMemory, null, 2), 'utf-8');
};

// Database Connection Manager
let isConnected = false;
let useMock = false;

export async function dbConnect() {
  if (isConnected) return { isConnected, useMock };

  if (!MONGODB_URI) {
    console.log("No MONGODB_URI found in environment variables. Falling back to local JSON database.");
    useMock = true;
    loadMockDb();
    return { isConnected: true, useMock: true };
  }

  try {
    const opts = { bufferCommands: false };
    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    useMock = false;
    console.log("Successfully connected to MongoDB.");
    
    // Seed MongoDB if empty
    const count = await User.countDocuments();
    if (count === 0) {
      await User.insertMany(seedUsers);
      await Grievance.insertMany(seedGrievances(new Date()));
      await AuditLog.create({
        action: "System Initialized",
        performedBy: "System Administrator",
        role: "Chief Minister",
        details: "NAGRIK Governance MongoDB initialized with seed data.",
        timestamp: new Date()
      });
      console.log("MongoDB seeded successfully.");
    }
    return { isConnected: true, useMock: false };
  } catch (error) {
    console.error("MongoDB connection failed. Falling back to local JSON database.", error);
    useMock = true;
    loadMockDb();
    return { isConnected: true, useMock: true };
  }
}

// Database Operations Layer (Direct Services)
export const dbService = {
  // --- USERS ---
  async getUsers(): Promise<IUser[]> {
    await dbConnect();
    if (useMock) {
      return loadMockDb().users;
    }
    return await User.find({}).lean();
  },

  async getUserByUsername(username: string): Promise<IUser | null> {
    await dbConnect();
    if (useMock) {
      const db = loadMockDb();
      const user = db.users.find(u => u.username === username);
      return user || null;
    }
    return await User.findOne({ username }).lean();
  },

  async createUser(userData: IUser): Promise<IUser> {
    await dbConnect();
    if (useMock) {
      const db = loadMockDb();
      // Check duplicate
      const exists = db.users.some(u => u.username === userData.username);
      if (exists) throw new Error("User already exists");
      db.users.push(userData);
      saveMockDb();
      return userData;
    }
    const newUser = await User.create(userData);
    return newUser.toObject();
  },

  async updateUser(username: string, updateData: Partial<IUser>): Promise<IUser | null> {
    await dbConnect();
    if (useMock) {
      const db = loadMockDb();
      const idx = db.users.findIndex(u => u.username === username);
      if (idx === -1) return null;
      db.users[idx] = { ...db.users[idx], ...updateData };
      saveMockDb();
      return db.users[idx];
    }
    const updated = await User.findOneAndUpdate({ username }, updateData, { new: true }).lean();
    return updated;
  },

  // --- GRIEVANCES ---
  async getGrievances(filter: any = {}): Promise<IGrievance[]> {
    await dbConnect();
    if (useMock) {
      const db = loadMockDb();
      let list = [...db.grievances];
      
      // Basic mock filters
      if (filter.status) {
        list = list.filter(g => g.status === filter.status);
      }
      if (filter.category) {
        list = list.filter(g => g.category === filter.category);
      }
      if (filter.department) {
        list = list.filter(g => g.department === filter.department);
      }
      if (filter.district) {
        list = list.filter(g => g.citizen.district === filter.district);
      }
      if (filter['assignedOfficer.id']) {
        list = list.filter(g => g.assignedOfficer?.id === filter['assignedOfficer.id']);
      }
      if (filter.isCriticalAlert !== undefined) {
        list = list.filter(g => g.isCriticalAlert === filter.isCriticalAlert);
      }
      if (filter.isDuplicate !== undefined) {
        list = list.filter(g => g.isDuplicate === filter.isDuplicate);
      }
      
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }
    
    // MongoDB filter conversions
    const mongoFilter: any = {};
    if (filter.status) mongoFilter.status = filter.status;
    if (filter.category) mongoFilter.category = filter.category;
    if (filter.department) mongoFilter.department = filter.department;
    if (filter.district) mongoFilter['citizen.district'] = filter.district;
    if (filter['assignedOfficer.id']) mongoFilter['assignedOfficer.id'] = filter['assignedOfficer.id'];
    if (filter.isCriticalAlert !== undefined) mongoFilter.isCriticalAlert = filter.isCriticalAlert;
    if (filter.isDuplicate !== undefined) mongoFilter.isDuplicate = filter.isDuplicate;

    return await Grievance.find(mongoFilter).sort({ createdAt: -1 }).lean();
  },

  async getGrievanceById(id: string): Promise<IGrievance | null> {
    await dbConnect();
    if (useMock) {
      const db = loadMockDb();
      // Try finding by id or _id string representation
      const g = db.grievances.find(item => item.id === id || (item._id && String(item._id) === id));
      return g || null;
    }
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Grievance.findById(id).lean();
  },

  async createGrievance(grievanceData: Omit<IGrievance, 'createdAt' | 'updatedAt'>): Promise<IGrievance> {
    await dbConnect();
    const now = new Date();
    const fullData: IGrievance = {
      ...grievanceData,
      id: useMock ? `g_${Math.random().toString(36).substr(2, 9)}` : undefined,
      createdAt: now,
      updatedAt: now,
      falseClosureCount: grievanceData.falseClosureCount || 0,
      supportingCount: grievanceData.supportingCount || 0,
      isDuplicate: grievanceData.isDuplicate || false,
      isCriticalAlert: grievanceData.isCriticalAlert || false,
      emergencyScore: grievanceData.emergencyScore || 0
    };

    if (useMock) {
      const db = loadMockDb();
      db.grievances.unshift(fullData);
      saveMockDb();
      return fullData;
    }

    const doc = await Grievance.create(fullData);
    return doc.toObject();
  },

  async updateGrievance(id: string, updateData: Partial<IGrievance>): Promise<IGrievance | null> {
    await dbConnect();
    const now = new Date();
    if (useMock) {
      const db = loadMockDb();
      const idx = db.grievances.findIndex(item => item.id === id || (item._id && String(item._id) === id));
      if (idx === -1) return null;
      db.grievances[idx] = { 
        ...db.grievances[idx], 
        ...updateData, 
        updatedAt: now 
      };
      saveMockDb();
      return db.grievances[idx];
    }
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updated = await Grievance.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: now },
      { new: true }
    ).lean();
    return updated;
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<IAuditLog[]> {
    await dbConnect();
    if (useMock) {
      const db = loadMockDb();
      return [...db.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return await AuditLog.find({}).sort({ timestamp: -1 }).lean();
  },

  async createAuditLog(log: Omit<IAuditLog, 'timestamp'>): Promise<IAuditLog> {
    await dbConnect();
    const fullLog: IAuditLog = {
      ...log,
      timestamp: new Date()
    };
    if (useMock) {
      const db = loadMockDb();
      db.auditLogs.unshift(fullLog);
      saveMockDb();
      return fullLog;
    }
    const doc = await AuditLog.create(fullLog);
    return doc.toObject();
  }
};
