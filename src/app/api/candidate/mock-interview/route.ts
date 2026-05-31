import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { domain, question, userAnswer, history } = await request.json()

    if (!domain || !question || !userAnswer) {
      return NextResponse.json({ error: 'domain, question, and userAnswer are required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a supportive, warm, but technically rigorous AI Technical Interviewer for Vouch.
The candidate is undergoing a mock interview in the "${domain}" domain.

Evaluate their answer to this question:
Question: "${question}"
Candidate's Answer: "${userAnswer}"

${history && history.length > 0 ? `Here is the conversational history of this session:
${JSON.stringify(history)}` : ''}

Analyze their answer and return ONLY a valid JSON object with the following fields:
{
  "score": <number 0-100 representing answer accuracy and depth>,
  "feedback": "<2-3 sentences of positive reinforcement + highly constructive feedback explaining what they got right and what key technical vocabulary or concepts they could include to make it perfect>",
  "nextQuestion": "<The next natural, conversational technical interview question in this domain, designed to build on the discussion or explore a new sub-skill>"
}

Do NOT include markdown wrapping or backticks. Return the raw JSON string directly.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON object found in response: ' + responseText)
    }

    const evaluation = JSON.parse(jsonMatch[0])
    return NextResponse.json(evaluation)

  } catch (error: any) {
    console.error('Mock interview API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
