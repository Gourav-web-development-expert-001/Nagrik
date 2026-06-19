import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { feedback } = body; // 'YES' or 'NO'

    const grievance = await dbService.getGrievanceById(id);
    if (!grievance) {
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 });
    }

    if (feedback === 'YES') {
      // Citizen confirmed resolution, update satisfaction scores if necessary, but keep resolved
      await dbService.createAuditLog({
        action: "Grievance Closure Verified",
        performedBy: grievance.citizen.name,
        role: "Citizen",
        targetId: id,
        details: "Citizen verified that the issue has been successfully resolved."
      });
      return NextResponse.json({ message: "Grievance closure verified successfully." });
    }

    // Citizen disputed resolution -> Reopen grievance
    const newFalseClosureCount = (grievance.falseClosureCount || 0) + 1;
    
    // Update grievance status and false closure count
    const updatedGrievance = await dbService.updateGrievance(id, {
      status: 'Reopened',
      falseClosureCount: newFalseClosureCount
    });

    // Update Officer Performance Metrics if officer is assigned
    if (grievance.assignedOfficer?.id) {
      const officerUsername = grievance.assignedOfficer.id;
      const officer = await dbService.getUserByUsername(officerUsername);

      if (officer) {
        const falseClosures = (officer.falseClosures || 0) + 1;
        // Mock math for decreasing officer stats
        const trustScore = Math.max(20, 100 - (falseClosures * 8));
        const resolutionAccuracy = Math.max(30, 95 - (falseClosures * 7));
        const citizenSatisfaction = Math.max(25, 90 - (falseClosures * 9));

        await dbService.updateUser(officerUsername, {
          falseClosures,
          trustScore,
          resolutionAccuracy,
          citizenSatisfaction
        });
      }
    }

    // Create Audit Log
    await dbService.createAuditLog({
      action: "Grievance Reopened (False Closure)",
      performedBy: grievance.citizen.name,
      role: "Citizen",
      targetId: id,
      details: `Citizen disputed the resolution. Grievance status reverted to "Reopened". False Closure count set to ${newFalseClosureCount}. Officer metrics recalculated.`
    });

    return NextResponse.json(updatedGrievance);
  } catch (error: any) {
    console.error("Dispute closure API error:", error);
    return NextResponse.json({ error: error.message || "Failed to reopen grievance" }, { status: 500 });
  }
}
