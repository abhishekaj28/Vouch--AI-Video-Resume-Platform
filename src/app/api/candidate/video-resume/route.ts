import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
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
