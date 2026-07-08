import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { signToken } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req) {
  try {
    const { name, email, password, role = 'staff' } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });

    const db = await connectDB();

    // Mock mode — no real DB
    if (db?.mock) {
      const token = signToken({ id: 'demo-' + Date.now(), name, email, role });
      const res = NextResponse.json({ success: true, user: { name, email, role } });
      res.cookies.set('ep_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      return res;
    }

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    const token = signToken({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });

    const res = NextResponse.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
    res.cookies.set('ep_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
