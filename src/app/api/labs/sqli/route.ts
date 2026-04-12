import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // VULNERABLE: Direct string interpolation of user input
    const query = `SELECT * FROM VulnUser WHERE username='${username}' AND password='${password}'`;

    let results = [];
    try {
      results = await prisma.$queryRawUnsafe<any[]>(query);
    } catch (dbError: any) {
      // Catch SQL syntax errors to return realistically
      return NextResponse.json({
        success: false,
        error: true,
        message: 'Database syntax error or constrained violation',
        dbError: dbError.message,
        executedQuery: query
      }, { status: 500 });
    }

    if (results && (results as any[]).length > 0) {
      // Login successful (could be bypass or auth success)
      return NextResponse.json({
        success: true,
        message: 'Login authenticated successfully',
        data: results,
        executedQuery: query
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
        executedQuery: query
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
