import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth, rateLimit } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.ctx.userId

  try {
    const { searchParams } = new URL(request.url)
    const requested = searchParams.get('userId')
    if (requested && requested !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Query the database using the admin client (which bypasses RLS safely)
    const { data: videoRecord, error } = await supabaseAdmin
      .from('video_resumes')
      .select('*')
      .eq('candidate_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Database query error in secure route:', error)
      throw error
    }

    return NextResponse.json(videoRecord || null)

  } catch (error: any) {
    console.error('Secure video fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
