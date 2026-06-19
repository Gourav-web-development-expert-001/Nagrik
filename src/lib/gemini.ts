import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize Gemini Client if key is available
let aiClient: any = null;
if (API_KEY) {
  try {
    aiClient = new GoogleGenerativeAI(API_KEY);
  } catch (err) {
    console.error("Failed to initialize GoogleGenerativeAI client:", err);
  }
}

// Interfaces
export interface IAiAnalysisResult {
  category: string;
  department: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  sentiment: string;
  summary: string;
  keywords: string[];
  urgencyScore: number;
  isCriticalAlert: boolean;
}

// Department mapping
const getDeptForCategory = (cat: string): string => {
  switch (cat) {
    case 'Water': return 'Water Department';
    case 'Electricity': return 'Power Department';
    case 'Road': return 'Public Works Department';
    case 'Sanitation': return 'Sanitation Department';
    case 'Transport': return 'Delhi Transport Corporation';
    case 'Crime': return 'Delhi Police';
    default: return 'General Administration';
  }
};

// Mock AI analysis for fallback
const getMockAnalysis = (title: string, desc: string): IAiAnalysisResult => {
  const combined = `${title} ${desc}`.toLowerCase();
  
  let category = 'General';
  let priority: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium';
  let urgencyScore = 50;
  let isCriticalAlert = false;
  let sentiment = 'Frustrated';
  let keywords: string[] = [];

  // Categorization Logic
  if (combined.includes('water') || combined.includes('sewer') || combined.includes('contamination') || combined.includes('dirty')) {
    category = 'Water';
    keywords.push('water supply', 'contamination');
    if (combined.includes('dirty') || combined.includes('smell') || combined.includes('muddy')) {
      priority = 'High';
      urgencyScore = 80;
      sentiment = 'Upset / Urgent';
    }
  } else if (combined.includes('electricity') || combined.includes('power') || combined.includes('wires') || combined.includes('light') || combined.includes('shock')) {
    category = 'Electricity';
    keywords.push('electrical', 'power cut');
    if (combined.includes('wires') || combined.includes('spark') || combined.includes('exposed') || combined.includes('shock')) {
      priority = 'Urgent';
      urgencyScore = 95;
      isCriticalAlert = true;
      sentiment = 'Dangerous / Alarmist';
      keywords.push('hazard', 'live wires');
    }
  } else if (combined.includes('road') || combined.includes('pothole') || combined.includes('cracks') || combined.includes('pavement')) {
    category = 'Road';
    keywords.push('road damage', 'infrastructure');
    if (combined.includes('pothole') || combined.includes('accident')) {
      priority = 'High';
      urgencyScore = 75;
      keywords.push('pothole', 'traffic danger');
    }
  } else if (combined.includes('garbage') || combined.includes('trash') || combined.includes('sewage') || combined.includes('dirt') || combined.includes('dump')) {
    category = 'Sanitation';
    keywords.push('sanitation', 'cleanliness');
    if (combined.includes('dumping') || combined.includes('stink') || combined.includes('days')) {
      priority = 'Medium';
      urgencyScore = 60;
      keywords.push('garbage dump', 'hygiene');
    }
  } else if (combined.includes('bus') || combined.includes('metro') || combined.includes('traffic') || combined.includes('parking')) {
    category = 'Transport';
    keywords.push('transportation', 'transit');
    priority = 'Medium';
    urgencyScore = 55;
  } else if (combined.includes('robbery') || combined.includes('theft') || combined.includes('safety') || combined.includes('harassment') || combined.includes('crime') || combined.includes('police')) {
    category = 'Crime';
    keywords.push('law and order', 'public safety');
    priority = 'High';
    urgencyScore = 85;
    if (combined.includes('weapon') || combined.includes('assault')) {
      priority = 'Urgent';
      urgencyScore = 98;
      isCriticalAlert = true;
      sentiment = 'Fearful / Severe Danger';
    }
  }

  // Critical alert check based on emergency keywords
  const emergencyKeywords = ['gas leak', 'fire', 'electric shock', 'building collapse', 'flood', 'water contamination', 'crime hotspot'];
  for (const keyword of emergencyKeywords) {
    if (combined.includes(keyword)) {
      isCriticalAlert = true;
      priority = 'Urgent';
      urgencyScore = Math.max(urgencyScore, 90);
      keywords.push('critical alert', keyword);
    }
  }

  // Extract other general keywords
  const words = title.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(w => w.length > 4);
  keywords = Array.from(new Set([...keywords, ...words.slice(0, 3)]));

  const department = getDeptForCategory(category);
  const summary = title.length > 10 ? title : `Grievance relating to ${category.toLowerCase()} reported in Delhi.`;

  return {
    category,
    department,
    priority,
    sentiment,
    summary,
    keywords,
    urgencyScore,
    isCriticalAlert
  };
};

export async function analyzeGrievance(title: string, description: string): Promise<IAiAnalysisResult> {
  if (!aiClient) {
    // Fallback to local rule engine
    return getMockAnalysis(title, description);
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an AI grievance intelligence classification engine for the Delhi Government's NAGRIK system.
      Analyze the following complaint title and description and output a JSON object containing the classification details.
      
      Grievance Title: "${title}"
      Grievance Description: "${description}"
      
      Available Categories and Departments:
      1. Water -> Department: Water Department
      2. Electricity -> Department: Power Department
      3. Road -> Department: Public Works Department
      4. Sanitation -> Department: Sanitation Department
      5. Transport -> Department: Delhi Transport Corporation
      6. Crime -> Department: Delhi Police
      7. Other -> Department: General Administration
      
      Classify the priority: "Low", "Medium", "High", or "Urgent".
      Determine an urgencyScore between 0 (not urgent) and 100 (extreme danger / threat to life / safety).
      Check if it triggers a Critical Alert (isCriticalAlert: true/false). It triggers critical if keywords like "Gas Leak", "Fire", "Electric Shock", "Building Collapse", "Flood", "Water Contamination", "Crime Hotspot" or equivalents are present, representing immediate threats.
      
      Output MUST be valid JSON format only, matching this structure:
      {
        "category": "Water" | "Electricity" | "Road" | "Sanitation" | "Transport" | "Crime" | "Other",
        "department": "Department Name",
        "priority": "Low" | "Medium" | "High" | "Urgent",
        "sentiment": "Short description of user sentiment",
        "summary": "1-sentence summary of the core issue",
        "keywords": ["array", "of", "3-4", "keywords"],
        "urgencyScore": 85,
        "isCriticalAlert": true | false
      }
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    
    // Parse JSON safely
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);
    return {
      category: result.category || 'Other',
      department: result.department || getDeptForCategory(result.category),
      priority: result.priority || 'Medium',
      sentiment: result.sentiment || 'Frustrated',
      summary: result.summary || title,
      keywords: result.keywords || [],
      urgencyScore: result.urgencyScore || 50,
      isCriticalAlert: !!result.isCriticalAlert
    };
  } catch (error) {
    console.error("Gemini AI API analysis failed. Falling back to mock analysis.", error);
    return getMockAnalysis(title, description);
  }
}

export async function generateVisitIntelligence(location: string, grievances: any[]): Promise<any> {
  const localGrievances = grievances.filter(g => 
    g.citizen?.district?.toLowerCase().includes(location.toLowerCase()) ||
    g.citizen?.address?.toLowerCase().includes(location.toLowerCase()) ||
    g.title?.toLowerCase().includes(location.toLowerCase()) ||
    g.description?.toLowerCase().includes(location.toLowerCase())
  );

  const unresolvedCount = localGrievances.filter(g => g.status !== 'Resolved').length;
  const criticalCount = localGrievances.filter(g => g.isCriticalAlert && g.status !== 'Resolved').length;
  
  const categoriesCount: Record<string, number> = {};
  localGrievances.forEach(g => {
    categoriesCount[g.category] = (categoriesCount[g.category] || 0) + 1;
  });

  const topCategory = Object.entries(categoriesCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  if (!aiClient) {
    // Return mock visit intelligence response
    return {
      location,
      unresolvedCount,
      criticalCount,
      topCategory,
      summary: `CM Visit Intelligence analysis for ${location}. Unresolved grievances stand at ${unresolvedCount}, with ${criticalCount} critical alerts. Primary grievance category observed is "${topCategory}".`,
      issues: localGrievances.slice(0, 3).map(g => ({
        id: g.id || g._id,
        title: g.title,
        status: g.status,
        priority: g.priority,
        department: g.department,
        urgencyScore: g.aiAnalysis?.urgencyScore || 50
      })),
      recommendations: [
        `Direct immediate inspection of unresolved ${topCategory} grievances.`,
        `Summon the respective Executive Engineer of ${getDeptForCategory(topCategory)} for laxity.`,
        criticalCount > 0 ? "Deploy disaster response / senior officers to investigate exposed hazard zones." : "Set up a localized grievance sub-kendra to review residential water/waste complaints."
      ]
    };
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are the Chief Minister's Senior Governance Analyst.
      Provide a visit briefing report for a scheduled CM visit to the location: "${location}".
      Here are the active and recent grievances in this area:
      ${JSON.stringify(localGrievances.map(g => ({
        title: g.title,
        description: g.description,
        status: g.status,
        priority: g.priority,
        department: g.department,
        district: g.citizen.district
      })), null, 2)}
      
      Please compile:
      1. A professional summary of local performance and citizen mood.
      2. Identify the top 3 most critical issues that require the CM's personal intervention during the spot check.
      3. Provide 3 specific directives/recommendations the CM should issue to the local administration during the visit.
      
      Respond only with a JSON object in this format:
      {
        "location": "${location}",
        "unresolvedCount": ${unresolvedCount},
        "criticalCount": ${criticalCount},
        "topCategory": "${topCategory}",
        "summary": "Brief overall performance analysis",
        "issues": [
          { "title": "Issue Title", "department": "Dept", "priority": "Priority", "status": "Status" }
        ],
        "recommendations": [
          "Directive 1",
          "Directive 2",
          "Directive 3"
        ]
      }
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.error("Gemini AI Visit Intelligence failed. Falling back to local briefing.", error);
    return {
      location,
      unresolvedCount,
      criticalCount,
      topCategory,
      summary: `Briefing for CM Visit in ${location}. Unresolved grievances are active. Respective departments have been alerted to compile reports prior to arrival.`,
      issues: localGrievances.slice(0, 3).map(g => ({
        id: g.id || g._id,
        title: g.title,
        status: g.status,
        priority: g.priority,
        department: g.department,
        urgencyScore: g.aiAnalysis?.urgencyScore || 50
      })),
      recommendations: [
        `Request action reports from the officers assigned to ${topCategory} complaints.`,
        "Instruct District Magistrate to audit infrastructure nodes in the neighborhood.",
        "Assess municipal sanitation bins and direct clearing schedule audit."
      ]
    };
  }
}

export async function chatAssistant(message: string, history: any[], grievances: any[], users: any[]): Promise<string> {
  // Simple Mock Chatbot for fallback
  const mockChatbot = (msg: string): string => {
    const m = msg.toLowerCase();
    
    // Count stats
    const total = grievances.length;
    const pending = grievances.filter(g => g.status === 'Pending').length;
    const resolved = grievances.filter(g => g.status === 'Resolved').length;
    const critical = grievances.filter(g => g.isCriticalAlert && g.status !== 'Resolved').length;
    
    // Department breakdowns
    const deptStats: Record<string, { total: number, resolved: number, falseClosures: number }> = {};
    grievances.forEach(g => {
      if (!deptStats[g.department]) {
        deptStats[g.department] = { total: 0, resolved: 0, falseClosures: 0 };
      }
      deptStats[g.department].total += 1;
      if (g.status === 'Resolved') {
        deptStats[g.department].resolved += 1;
      }
      if (g.falseClosureCount > 0) {
        deptStats[g.department].falseClosures += g.falseClosureCount;
      }
    });

    if (m.includes('critical') || m.includes('alert') || m.includes('emergency')) {
      const list = grievances.filter(g => g.isCriticalAlert && g.status !== 'Resolved');
      if (list.length === 0) return "Sir, there are currently **no active critical alerts** across Delhi's districts.";
      return `Sir, there are currently **${list.length} active critical alerts**:\n\n` + 
        list.map((g, idx) => `${idx + 1}. **${g.title}** (${g.citizen.district}) - Priority: **${g.priority}**, Department: **${g.department}** (Urgency: **${g.aiAnalysis?.urgencyScore || 90}**)`).join('\n') +
        `\n\nI have flagged these for the respective District Magistrates and Department Heads.`;
    }

    if (m.includes('poorly') || m.includes('worst') || m.includes('performance') || m.includes('department')) {
      // Find department with lowest resolution rate or highest false closures
      let worstDept = "Water Department";
      let worstRate = 1.0;
      Object.entries(deptStats).forEach(([name, stat]) => {
        const rate = stat.resolved / stat.total;
        if (rate < worstRate) {
          worstRate = rate;
          worstDept = name;
        }
      });
      
      const worstOfficer = users
        .filter(u => u.role === 'Officer')
        .sort((a, b) => a.trustScore - b.trustScore)[0];

      return `Based on live metrics, the **${worstDept}** is performing poorly with a resolution rate of only **${Math.round(worstRate * 100)}%**. Additionally, **${worstOfficer?.name || 'Sanjay Sharma'}** has the lowest Trust Score (**${worstOfficer?.trustScore || 68}%**) due to a high false-closure count of **${worstOfficer?.falseClosures || 4}** cases. I recommend initiating a department review.`;
    }

    if (m.includes('south delhi')) {
      const south = grievances.filter(g => g.citizen.district === 'South Delhi');
      const openSouth = south.filter(g => g.status !== 'Resolved').length;
      return `In **South Delhi**, there are **${south.length}** total complaints registered, of which **${openSouth}** are still active. The primary concern is in **Road Maintenance** and **Sanitation** near Lajpat Nagar.`;
    }

    if (m.includes('false closure') || m.includes('corruption') || m.includes('accuracy')) {
      const worstOfficers = users
        .filter(u => u.role === 'Officer' && u.falseClosures > 0)
        .sort((a, b) => b.falseClosures - a.falseClosures);

      if (worstOfficers.length === 0) return "Sir, all officers currently maintain a 100% resolution accuracy score, and zero false-closures have been reported.";
      
      return `The officer with the highest false-closures is **${worstOfficers[0].name}** of the **${worstOfficers[0].department}** in **${worstOfficers[0].district}** with **${worstOfficers[0].falseClosures}** disputed closures. This has dropped their Resolution Accuracy to **${worstOfficers[0].resolutionAccuracy}%**.`;
    }

    return `Greeting CM. I am your AI Governance Assistant. Here is the current status:
    
- **Total Grievances Registered**: ${total}
- **Pending/Open Resolution**: ${pending}
- **Successfully Resolved**: ${resolved}
- **Active Critical Emergency Alerts**: ${critical}

You can ask me to:
1. *"Show top critical complaints."*
2. *"Which department is performing poorly?"*
3. *"List complaints in South Delhi."*
4. *"Who is the highest false closure officer?"*`;
  };

  if (!aiClient) {
    return mockChatbot(message);
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are the CM's AI Governance Assistant named "NAGRIK-AI". You provide succinct, official, intelligent briefings and insights to the Chief Minister of Delhi.
      You are speaking directly to the CM. Be respectful, objective, clear, and highly professional.
      
      Here is the current system state context:
      - Total Grievances: ${grievances.length}
      - Pending: ${grievances.filter(g => g.status === 'Pending').length}
      - In Progress: ${grievances.filter(g => g.status === 'In Progress').length}
      - Resolved: ${grievances.filter(g => g.status === 'Resolved').length}
      - Reopened (False Closures): ${grievances.filter(g => g.status === 'Reopened').length}
      - Critical Alerts Active: ${grievances.filter(g => g.isCriticalAlert && g.status !== 'Resolved').length}
      
      Full Grievances List:
      ${JSON.stringify(grievances.map(g => ({
        id: g.id || g._id,
        title: g.title,
        status: g.status,
        priority: g.priority,
        category: g.category,
        department: g.department,
        district: g.citizen.district,
        falseClosureCount: g.falseClosureCount,
        assignedOfficer: g.assignedOfficer?.name
      })), null, 2)}

      Officer Roster Performance:
      ${JSON.stringify(users.filter(u => u.role === 'Officer').map(u => ({
        name: u.name,
        department: u.department,
        district: u.district,
        trustScore: u.trustScore,
        resolutionAccuracy: u.resolutionAccuracy,
        falseClosures: u.falseClosures
      })), null, 2)}
      
      Chat History:
      ${JSON.stringify(history.slice(-5))}
      
      CM Message: "${message}"
      
      Formulate a concise, clear briefing that answers the CM's query using the data context above. Highlight metrics, departments, and specific actions required. Use bullet points and clean formatting.
    `;

    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("Gemini AI Chatbot failed. Falling back to rules engine.", error);
    return mockChatbot(message);
  }
}
