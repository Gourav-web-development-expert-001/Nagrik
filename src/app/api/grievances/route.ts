import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { analyzeGrievance } from '@/lib/gemini';
import { IGrievance } from '@/lib/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter: any = {};
    
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const department = searchParams.get('department');
    const district = searchParams.get('district');
    const officerId = searchParams.get('officerId');
    const isCritical = searchParams.get('isCriticalAlert');
    const isDuplicate = searchParams.get('isDuplicate');

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (district) filter.district = district;
    if (officerId) filter['assignedOfficer.id'] = officerId;
    if (isCritical) filter.isCriticalAlert = isCritical === 'true';
    if (isDuplicate) filter.isDuplicate = isDuplicate === 'true';

    const grievances = await dbService.getGrievances(filter);
    return NextResponse.json(grievances);
  } catch (error: any) {
    console.error("Fetch grievances API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch grievances" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, citizen, location, anonymous, images, severity } = body;

    if (!title || !description || !citizen || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Run AI Grievance Analysis (Gemini API with local fallback)
    const aiAnalysis = await analyzeGrievance(title, description);

    // Determine final category and department from AI analysis
    const category = aiAnalysis.category;
    const department = aiAnalysis.department;
    const priority = aiAnalysis.priority;
    const isCriticalAlert = aiAnalysis.isCriticalAlert;
    const emergencyScore = aiAnalysis.isCriticalAlert ? aiAnalysis.urgencyScore : 0;

    // 2. Duplicate Complaint Detection (Embeddings/Coordinate similarity check)
    // Find open grievances in the same category within ~100 meters (approx 0.001 lat/lng degrees)
    const allGrievances = await dbService.getGrievances({ category });
    const distanceThreshold = 0.001; // roughly 100-110m
    
    let isDuplicate = false;
    let masterGrievanceId = "";

    const nearbyGrievance = allGrievances.find(g => {
      if (g.status === 'Resolved' || g.isDuplicate) return false;
      const latDiff = Math.abs(g.location.lat - location.lat);
      const lngDiff = Math.abs(g.location.lng - location.lng);
      return latDiff < distanceThreshold && lngDiff < distanceThreshold;
    });

    if (nearbyGrievance) {
      isDuplicate = true;
      masterGrievanceId = String(nearbyGrievance.id || nearbyGrievance._id);
      
      // Update master grievance to increase supporting complaints count
      await dbService.updateGrievance(masterGrievanceId, {
        supportingCount: (nearbyGrievance.supportingCount || 0) + 1
      });

      // Audit Log for duplicate merge
      await dbService.createAuditLog({
        action: "Duplicate Complaint Merged",
        performedBy: "System AI Router",
        role: "Chief Minister",
        targetId: masterGrievanceId,
        details: `Merged new complaint "${title}" into Master Issue: "${nearbyGrievance.title}" based on proximity and category match.`
      });
    }

    // 3. Assign an Officer from the department and district
    // Fetch users list to match an officer
    const users = await dbService.getUsers();
    const districtOfficers = users.filter(u => 
      u.role === 'Officer' && 
      u.department === department && 
      (!u.district || u.district === citizen.district)
    );

    // Fallback: pick any officer from department, or general officer if none
    const selectedOfficer = districtOfficers.sort((a, b) => b.trustScore - a.trustScore)[0] || 
                            users.find(u => u.role === 'Officer' && u.department === department) || 
                            users.find(u => u.role === 'Officer');

    const assignedOfficer = selectedOfficer ? {
      id: selectedOfficer.username,
      name: selectedOfficer.name,
      trustScore: selectedOfficer.trustScore
    } : undefined;

    // 4. Save grievance
    const newGrievance = await dbService.createGrievance({
      title,
      description,
      citizen,
      location,
      status: 'Pending',
      priority,
      category,
      department,
      severity: severity || 'Medium',
      anonymous: !!anonymous,
      images: images || [],
      aiAnalysis,
      assignedOfficer,
      falseClosureCount: 0,
      isDuplicate,
      masterGrievanceId: isDuplicate ? masterGrievanceId : undefined,
      supportingCount: 0,
      isCriticalAlert,
      emergencyScore
    });

    // 5. Create Audit Log
    await dbService.createAuditLog({
      action: "Grievance Registered",
      performedBy: anonymous ? "Anonymous Citizen" : citizen.name,
      role: "Citizen",
      targetId: String(newGrievance.id || newGrievance._id),
      details: `Grievance registered. Category auto-assigned to ${category} (${department}). Assigned to officer: ${assignedOfficer?.name || 'Unassigned'}.`
    });

    return NextResponse.json(newGrievance, { status: 201 });
  } catch (error: any) {
    console.error("Register grievance API error:", error);
    return NextResponse.json({ error: error.message || "Failed to register grievance" }, { status: 500 });
  }
}
