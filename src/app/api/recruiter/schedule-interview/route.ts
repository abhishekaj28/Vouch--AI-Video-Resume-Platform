import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { applicationId, candidateId, recruiterId, scheduledAt, meetingLink, notes } = await request.json()

    if (!applicationId || !candidateId || !scheduledAt) {
      return NextResponse.json({ error: 'applicationId, candidateId, and scheduledAt are required' }, { status: 400 })
    }

    // 1. Insert the interview booking row
    const { data: interview, error: insertError } = await supabaseAdmin
      .from('interviews')
      .insert({
        application_id: applicationId,
        candidate_id: candidateId,
        recruiter_id: recruiterId || null,
        scheduled_at: scheduledAt,
        meeting_link: meetingLink || 'https://meet.google.com/abc-defg-hij',
        notes: notes || 'Vouch AI Technical Interview Session'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert interview error:', insertError)
      throw insertError
    }

    // 2. Automatically update application status to 'interview'
    const { error: updateError } = await supabaseAdmin
      .from('applications')
      .update({ stage: 'interview' })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Update application stage error:', updateError)
    }

    return NextResponse.json({ success: true, interview })

  } catch (error: any) {
    console.error('Schedule interview API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
