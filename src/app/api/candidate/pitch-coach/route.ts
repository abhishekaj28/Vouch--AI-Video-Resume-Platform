import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, skills, candidateName } = await request.json()

    if (!jobDescription) {
      return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 })
    }

    const nameToUse = candidateName || 'Abhishek'
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an elite, warm, and product-focused Vouch AI Interview Coach.
A candidate named "${nameToUse}" wants to record a 90-second elevator video pitch for a role with the following Job Description (JD):
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
  "teleprompterOutline": "<A complete, highly engaging 90-second verbatim pitch script (approx. 150-180 words) that seamlessly weaves in the candidate's name (${nameToUse}), the target company, all the suggested technical talking points, and specific action hooks. It must sound natural, professional, and ready to be read verbatim on the teleprompter. Do NOT use bracketed placeholders like [Your Name] or [Company Name]; pre-populate them using the provided candidate name and the real company name from the JD if available (else assume a general premium tech startup). Use double newlines (\\n\\n) for paragraphs.>"
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
