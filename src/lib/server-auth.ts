import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export type Role = 'candidate' | 'recruiter'

export interface AuthContext {
  userId: string
  email: string | null
  role: Role | null
}

type AuthResult = { ctx: AuthContext; error?: undefined } | { ctx?: undefined; error: NextResponse }

/**
 * Verifies the Supabase access token sent in the `Authorization: Bearer <token>` header
 * and loads the caller's role from the profiles table. The user id always comes from the
 * verified token, never from the request body or query string.
 */
export async function requireAuth(request: NextRequest, role?: Role): Promise<AuthResult> {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
      return { error: NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 }) }
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    const ctx: AuthContext = {
      userId: data.user.id,
      email: data.user.email ?? null,
      role: (profile?.role as Role | undefined) ?? null,
    }

    if (role && ctx.role !== role) {
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }
    return { ctx }
  } catch {
    return { error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 }) }
  }
}

// Best-effort in-memory rate limiter. On serverless platforms each instance keeps its own
// counters, so this slows abuse of the paid AI endpoints but is not a hard global limit.
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, max: number, windowMs: number): NextResponse | null {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }
  bucket.count += 1
  if (bucket.count > max) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }
  return null
}

export function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
