import { NextResponse } from 'next/server';
import { analyzeGrievance } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const analysis = await analyzeGrievance(title, description);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Manual AI Analysis API error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze grievance" }, { status: 500 });
  }
}
