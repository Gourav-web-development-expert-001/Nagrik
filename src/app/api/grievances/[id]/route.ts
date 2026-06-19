import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, resolution, assignedOfficer } = body;

    // Fetch existing grievance
    const existing = await dbService.getGrievanceById(id);
    if (!existing) {
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 });
    }

    const update: any = {};
    if (status) update.status = status;
    if (assignedOfficer) update.assignedOfficer = assignedOfficer;
    
    if (resolution) {
      update.resolution = {
        remarks: resolution.remarks,
        images: resolution.images || [],
        video: resolution.video || "",
        location: resolution.location || existing.location,
        timestamp: new Date()
      };
      // Once resolution is provided, we set status to Resolved
      update.status = 'Resolved';
    }

    const updatedGrievance = await dbService.updateGrievance(id, update);

    // Create Audit Log
    const performedBy = assignedOfficer?.name || existing.assignedOfficer?.name || "System Officer";
    await dbService.createAuditLog({
      action: status === 'Resolved' || resolution ? "Grievance Resolved" : `Status Updated to ${status}`,
      performedBy,
      role: "Officer",
      targetId: id,
      details: status === 'Resolved' || resolution
        ? `Grievance resolved with remarks: "${resolution?.remarks?.substring(0, 50)}...".`
        : `Grievance status updated to "${status}".`
    });

    return NextResponse.json(updatedGrievance);
  } catch (error: any) {
    console.error("Update grievance API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update grievance" }, { status: 500 });
  }
}
