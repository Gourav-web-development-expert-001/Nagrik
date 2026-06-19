import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const user = await dbService.getUserByUsername(username);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Return user details with a mock token for frontend consumption
    return NextResponse.json({
      token: "mock-jwt-token-nagrik-auth",
      user: {
        name: user.name,
        username: user.username,
        role: user.role,
        department: user.department,
        district: user.district,
        trustScore: user.trustScore,
        resolutionAccuracy: user.resolutionAccuracy,
        citizenSatisfaction: user.citizenSatisfaction
      }
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
