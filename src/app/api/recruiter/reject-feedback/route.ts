import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json()

    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId is required' }, { status: 400 })
    }

    // 1. Fetch application details with candidate profile, video resume, and job details
    const { data: app, error: appErr } = await supabaseAdmin
      .from('applications')
      .select('*, profiles(*), video_resumes(*)')
      .eq('id', applicationId)
      .single()

    if (appErr || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // 2. Fetch the job details
    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('title, company')
      .eq('id', app.job_id)
      .maybeSingle()

    const jobTitle = job?.title || 'Frontend Developer'
    const companyName = job?.company || 'Razorpay'
    const candidateName = app.profiles?.full_name || 'Candidate'
    const scores = app.video_resumes || {}
    const transcript = scores.transcript || ''
    const skills = scores.skills || []

    // 3. Construct Gemini Prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `You are a warm, extremely supportive, and constructive technical recruiter.
Write a personalized rejection email / constructive feedback letter for an applicant named "${candidateName}" who applied for the "${jobTitle}" position at "${companyName}".

Here are the applicant's metrics from our AI assessment:
- Overall Score: ${scores.overall_score || 70}/100
- Communication: ${scores.communication_score || 70}/100
- On-Camera Confidence: ${scores.confidence_score || 70}/100
- Presentation Clarity: ${scores.clarity_score || 70}/100
- Technical Vocabulary: ${scores.technical_score || 70}/100
- Identified Skills: ${skills.join(', ') || 'General Development'}
${transcript ? `- Presentation Transcript: "${transcript}"` : ''}

Write a polite and empathetic rejection message. Your goals:
1. Express deep gratitude for their effort and application.
2. Emphasize 1 or 2 specific strengths (e.g. they showed great on-camera confidence or very clear communication skills based on their scores/transcript).
3. Provide 2-3 specific, actionable, and constructive tips to help them grow and succeed in their next application. Keep them positive and highly practical.
4. Conclude with a warm, encouraging closing signing off explicitly as "The ${companyName} Recruiting Team", wishing them the absolute best in their career journey.

Make the tone highly professional, encouraging, human, and conversational (avoid robotic or overly corporate phrasing).
Do NOT include subjects, standard header templates, or placeholders like "[Your Name]" or "[Your Name/Company Name]". Write it as a clean, complete message that can be directly read by the candidate on their dashboard.`

    const result = await model.generateContent(prompt)
    let feedback = result.response.text().trim()

    // Safety check: replace any bracketed placeholders in case the LLM ignored the instructions
    feedback = feedback.replace(/\[Your Name\/Company Name\]/gi, `The ${companyName} Team`)
    feedback = feedback.replace(/\[Company Name\]/gi, companyName)
    feedback = feedback.replace(/\[Your Name\]/gi, `The ${companyName} Recruiting Team`)
    feedback = feedback.replace(/\[Your Title\/Role\]/gi, "Recruiting Team")

    // 4. Save feedback in applications table and mark stage as rejected
    const { error: updateErr } = await supabaseAdmin
      .from('applications')
      .update({ rejection_feedback: feedback, stage: 'rejected' })
      .eq('id', applicationId)

    if (updateErr) {
      console.error('Failed to update rejection_feedback:', updateErr)
    }

    return NextResponse.json({ feedback })

  } catch (error: any) {
    console.error('Reject feedback API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
