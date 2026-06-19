import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { generateVisitIntelligence } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { location } = await request.json();

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    // Fetch grievances for analysis
    const grievances = await dbService.getGrievances();

    // Generate Visit Briefing
    const intelligence = await generateVisitIntelligence(location, grievances);
    
    return NextResponse.json(intelligence);
  } catch (error: any) {
    console.error("AI Visit Intelligence API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate visit briefing" }, { status: 500 });
  }
}
