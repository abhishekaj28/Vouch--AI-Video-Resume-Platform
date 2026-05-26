import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, userId } = await request.json()

    const { data: videoRecord, error: insertError } = await supabaseAdmin
      .from('video_resumes')
      .insert({
        candidate_id: userId,
        video_url: videoUrl,
        status: 'processing'
      })
      .select()
      .single()

    if (insertError) throw insertError

    const videoResponse = await fetch(videoUrl)
    const videoBuffer = await videoResponse.arrayBuffer()
    const videoFile = new File([videoBuffer], 'video.webm', { type: 'video/webm' })

    const transcription = await groq.audio.transcriptions.create({
      file: videoFile,
      model: 'whisper-large-v3',
    })

    const transcript = transcription.text

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an expert HR analyst. Analyze this video resume transcript and provide scores.

Transcript: "${transcript}"

Return ONLY a valid JSON object with these exact fields:
{
  "communication_score": <number 0-100>,
  "confidence_score": <number 0-100>,
  "clarity_score": <number 0-100>,
  "technical_score": <number 0-100>,
  "overall_score": <number 0-100>,
  "ai_summary": "<2-3 sentence summary of the candidate>",
  "skills": ["skill1", "skill2", "skill3"]
}`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const scores = JSON.parse(jsonMatch[0])

    await supabaseAdmin
      .from('video_resumes')
      .update({
        transcript,
        communication_score: scores.communication_score,
        confidence_score: scores.confidence_score,
        clarity_score: scores.clarity_score,
        technical_score: scores.technical_score,
        overall_score: scores.overall_score,
        ai_summary: scores.ai_summary,
        skills: scores.skills,
        status: 'completed'
      })
      .eq('id', videoRecord.id)

    return NextResponse.json(scores)

  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}