import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const token = cookies().get('ep_token')?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: { id: payload.id, name: payload.name, email: payload.email, role: payload.role } });
}
