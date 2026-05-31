import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, skills } = await request.json()

    if (!jobDescription) {
      return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an elite, warm, and product-focused Vouch AI Interview Coach.
A candidate wants to record a 90-second elevator video pitch for a role with the following Job Description (JD):
"${jobDescription}"

Candidate's current skills catalog: ${skills && skills.length > 0 ? JSON.stringify(skills) : '["React", "TypeScript", "UI Engineering"]'}.

Analyze the Job Description and candidate skills to construct a supportive coaching blueprint.
You MUST return ONLY a valid JSON object with the following fields:
{
  "tips": [
    "<Focus tip 1: 1 sentence explaining the critical technical/functional skill they must mention from the JD>",
    "<Focus tip 2: 1 sentence explaining the core communication or teamwork soft skill required in the JD>"
  ],
  "talkingPoints": [
    "<Talking point 1: A structured anchor focusing on their technical modularity (STAR method structure) customized to this JD>",
    "<Talking point 2: A structured anchor focusing on optimizing render or layout speed custom to this JD>",
    "<Talking point 3: An anchor focusing on team collaboration, visual fidelity, or clean architecture>"
  ],
  "warnings": [
    "<Speaking warning 1: Pacing caution customized to the complexity of the role (e.g. speak at 130 WPM to articulate clearly)>",
    "<Speaking warning 2: Avoid common repetitive speaking filler tags (like 'um', 'like', 'matlab', 'so')>"
  ],
  "teleprompterOutline": "<A highly optimized, 40-word concise outline formatted with clear bullet points that the candidate can load straight into their teleprompter screen to guide their eyes during the live recording. Focus on: Introduction, STAR performance story, key skill match, and closing. Keep it under 6 lines total. Use newline separators (\\n) inside the string.>"
}

Do NOT wrap the JSON inside markdown backticks or triple backticks. Return the raw JSON string directly.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON object found in response: ' + responseText)
    }

    const coachBlueprint = JSON.parse(jsonMatch[0])
    return NextResponse.json(coachBlueprint)

  } catch (error: any) {
    console.error('AI Pitch Coach API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
