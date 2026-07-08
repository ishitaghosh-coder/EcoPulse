import { NextResponse } from 'next/server';

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const maskedUri = uri ? uri.replace(/:([^@]+)@/, ':****@') : 'undefined';
  return NextResponse.json({
    hasUri: !!uri,
    maskedUri,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
}
export const dynamic = 'force-dynamic';
