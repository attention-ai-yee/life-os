import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT_SET',
      hasAnonKey: hasKey,
    }
  })
}
