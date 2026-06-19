import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { chatAssistant } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Fetch grievances and users context
    const grievances = await dbService.getGrievances();
    const users = await dbService.getUsers();

    // Call chat assistant helper
    const response = await chatAssistant(message, history || [], grievances, users);
    
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("AI Chat API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate chat response" }, { status: 500 });
  }
}
