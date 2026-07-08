import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { signToken } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const db = await connectDB();

    // Mock mode
    if (db?.mock) {
      const role = email.includes('authority') || email.includes('auth') ? 'authority' : 'staff';
      const name = email.split('@')[0];
      const token = signToken({ id: 'demo-' + Date.now(), name, email, role });
      const res = NextResponse.json({ success: true, user: { name, email, role } });
      res.cookies.set('ep_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      return res;
    }

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ id: user._id.toString(), name: user.name, email: user.email, role: user.role });
    const res = NextResponse.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
    res.cookies.set('ep_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
