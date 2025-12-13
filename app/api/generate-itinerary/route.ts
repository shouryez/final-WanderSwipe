import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL_ID = "llama-3.3-70b-versatile"

type ItineraryRequest = {
  placeName: string
  budget: "Low" | "Mid" | "High"
  numDays: number
  travelStyle: "Adventure" | "Relaxation" | "Heritage" | "Food" | "Shopping"
  companion: "Solo" | "Couple" | "Friends" | "Family"
  travelMonth?: string
  placeId: string
}

export async function POST(req: Request) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "Server misconfigured: GROQ_API_KEY is missing" }, { status: 500 })
    }

    const body: ItineraryRequest = await req.json()
    const { placeName, budget, numDays, travelStyle, companion, travelMonth, placeId } = body

    // Validate input
    if (!placeName || !budget || !numDays || !travelStyle || !companion) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (numDays < 1 || numDays > 30) {
      return NextResponse.json({ error: "Number of days must be between 1 and 30" }, { status: 400 })
    }

    const systemPrompt = `You are an expert travel planner specializing in India. Create detailed, practical, and exciting day-by-day itineraries.

Format your response as a structured itinerary with:
- A compelling summary explaining why this place is perfect for the traveler
- Day-by-day breakdown with Morning, Afternoon, and Evening activities
- Practical tips and local insights
- Budget-appropriate recommendations

Be specific with place names, timings, and realistic travel times. Include local food recommendations and hidden gems.`

    const userPrompt = `Create a ${numDays}-day itinerary for ${placeName}.

Traveler Profile:
- Budget: ${budget}
- Travel Style: ${travelStyle}
- Traveling: ${companion}
${travelMonth ? `- Travel Month: ${travelMonth}` : ""}

Budget Guidelines:
- Low: Budget accommodations, street food, public transport, free/cheap activities
- Mid: Comfortable hotels, mix of local and restaurant meals, occasional taxis, popular attractions
- High: Premium stays, fine dining, private transport, exclusive experiences

Travel Style Focus:
- Adventure: Trekking, water sports, outdoor activities, adrenaline experiences
- Relaxation: Spas, beaches, leisurely walks, calm environments
- Heritage: Forts, temples, museums, historical sites, cultural experiences
- Food: Local cuisine, food tours, cooking classes, street food adventures  
- Shopping: Local markets, handicrafts, souvenirs, artisan workshops

Format your response EXACTLY like this:

**Why ${placeName} is Perfect for You**
[2-3 sentences about why this destination matches their preferences]

**Day 1**
• Morning: [Activity with timing and location]
• Afternoon: [Activity with timing and location]
• Evening: [Activity with timing and location]
• Local Tip: [Insider advice or recommendation]

**Day 2**
• Morning: [Activity]
• Afternoon: [Activity]
• Evening: [Activity]
• Local Tip: [Insider advice]

[Continue for all ${numDays} days]

**Essential Tips**
• [Practical tip 1]
• [Practical tip 2]
• [Practical tip 3]

**Estimated Daily Budget**: ₹[amount] (${budget} budget)

Be specific, practical, and exciting. Include actual place names and realistic timings.`

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Groq API error:", errorText)
      return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 })
    }

    const data = await response.json()
    const itineraryText = data.choices?.[0]?.message?.content

    if (!itineraryText) {
      return NextResponse.json({ error: "No itinerary generated" }, { status: 500 })
    }

    // Parse the itinerary into structured format
    const days = []
    const dayRegex = /\*\*Day (\d+)\*\*\n([\s\S]*?)(?=\*\*Day \d+\*\*|\*\*Essential Tips\*\*|$)/g
    let match

    while ((match = dayRegex.exec(itineraryText)) !== null) {
      const dayNum = Number.parseInt(match[1])
      const content = match[2].trim()

      const morning = content.match(/• Morning: (.*?)(?=\n|$)/)?.[1] || ""
      const afternoon = content.match(/• Afternoon: (.*?)(?=\n|$)/)?.[1] || ""
      const evening = content.match(/• Evening: (.*?)(?=\n|$)/)?.[1] || ""
      const tip = content.match(/• Local Tip: (.*?)(?=\n|$)/)?.[1] || ""

      days.push({
        day: dayNum,
        morning,
        afternoon,
        evening,
        tips: tip,
      })
    }

    const summaryMatch = itineraryText.match(/\*\*Why.*?\*\*\n([\s\S]*?)(?=\n\*\*Day|$)/)
    const summary =
      summaryMatch?.[1]?.trim() || `${placeName} offers amazing experiences for ${companion.toLowerCase()} travelers!`

    // Save to database if user is authenticated
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("itineraries").insert({
          user_id: user.id,
          place_id: placeId,
          place_name: placeName,
          budget,
          num_days: numDays,
          travel_style: travelStyle,
          companion,
          travel_month: travelMonth || null,
          itinerary_data: {
            days,
            summary,
            fullText: itineraryText,
          },
        })
      }
    } catch (dbError) {
      console.error("Failed to save itinerary to database:", dbError)
      // Continue anyway - we still return the itinerary
    }

    return NextResponse.json({
      place: placeName,
      days,
      summary,
      fullText: itineraryText,
    })
  } catch (error: any) {
    console.error("Error in /api/generate-itinerary:", error)
    return NextResponse.json({ error: error.message || "Failed to generate itinerary" }, { status: 500 })
  }
}
