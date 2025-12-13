import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        {
          error: "AI service not configured. Please add GEMINI_API_KEY to your environment variables.",
          answer:
            "I'm sorry, but the AI assistant is not configured yet. Please contact the administrator to set up the GEMINI_API_KEY.",
        },
        { status: 200 },
      )
    }

    const { placeName, question, history } = await request.json()

    if (!placeName || !question) {
      return NextResponse.json({ error: "Place name and question are required" }, { status: 400 })
    }

    const systemPrompt = `You are a knowledgeable travel assistant specializing in ${placeName}, India. 
Answer questions about this destination concisely and helpfully. Include practical tips, local insights, 
and cultural information. Keep responses under 150 words unless more detail is requested.`

    let conversationHistory = ""
    if (history && Array.isArray(history)) {
      conversationHistory = history.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")
    }

    const prompt = `${systemPrompt}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ""}User question: ${question}`

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const answer = response.text() || "I couldn't find an answer to that question."

    return NextResponse.json({ answer })
  } catch (error: any) {
    console.error("[place-chat] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get response",
        answer: `I'm having trouble connecting to the AI service right now. Error: ${error.message || "Unknown error"}. Please try again in a moment.`,
      },
      { status: 200 },
    )
  }
}
