import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { candidateName, overallScore, skills, transcript, jobTitle, companyName } = await request.json()

    if (!candidateName || !jobTitle) {
      return NextResponse.json({ error: 'candidateName and jobTitle are required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are a warm, highly professional, and technically expert Recruiter at "${companyName || 'Vouch Partner Tech'}".
You want to reach out to a high-scoring candidate named "${candidateName}" for the "${jobTitle}" position.

Here are the candidate's metrics from Vouch AI:
- Overall AI Vouch Rating: ${overallScore || 85}/100
- Verified Technical Skills: ${JSON.stringify(skills || ["React", "TypeScript"])}
- Speaking Transcript: "${transcript || ''}"

Draft a highly engaging, custom, and warm recruiter outreach email.
- Congratulate them on their impressive Vouch AI scorecard metrics and speaking delivery.
- Reference at least one specific technical focus area from their speaking transcript to show you actually reviewed their video resume pitch.
- Politely invite them to take a 15-minute quick alignment chat, and mention that you can book a technical session with them directly via their dashboard.
- Keep the tone professional, highly supportive, exciting, and clean.
- Return ONLY the raw drafted email text (including Subject line and Body). Do NOT wrap it in any markdown backticks or json brackets. Start directly with the 'Subject:' line.`

    const result = await model.generateContent(prompt)
    const emailDraft = result.response.text().trim()

    return NextResponse.json({ email: emailDraft })

  } catch (error: any) {
    console.error('AI Outreach generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
