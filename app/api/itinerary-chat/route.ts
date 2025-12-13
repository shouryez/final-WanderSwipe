import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

const SEEDED_RESPONSES: Record<string, string> = {
  "Can I modify Day 2?": `You can modify Day 2 in several ways:

1. **Change Activities**: Swap out any activity for something else that interests you more. For example, if there's a museum visit scheduled but you prefer outdoor activities, you could replace it with a nature walk or local market visit.

2. **Adjust Timing**: Shift activities to different times of day based on your preferences - morning person? Start earlier. Night owl? Sleep in and shift everything later.

3. **Add or Remove**: Feel free to add more activities if you're energetic, or remove some if you prefer a more relaxed pace.

4. **Budget Adjustments**: Switch to budget-friendly alternatives or upgrade to premium experiences depending on your spending preferences.

What specific changes would you like to make to Day 2?`,

  "Add food recommendations": `Here are some excellent food recommendations for your trip:

**Must-Try Local Dishes:**
- Start your mornings with authentic local breakfast specialties at small family-run cafes
- Try the regional street food - it's delicious, affordable, and gives you a real taste of local culture
- Don't miss the signature local dish that this destination is famous for

**Restaurant Types:**
- **Budget-Friendly**: Local dhabas and street food stalls (₹100-300 per meal)
- **Mid-Range**: Popular local restaurants with good reviews (₹500-1000 per meal)
- **Special Occasion**: Fine dining with local cuisine fusion (₹1500+ per meal)

**Food Tips:**
- Ask locals for their favorite spots - they know the hidden gems
- Try breakfast and lunch at local places, save dinner for trying different cuisines
- Always carry water and light snacks for day trips
- Check if your accommodation offers complimentary breakfast to save money

Would you like specific restaurant names or dietary-specific recommendations?`,

  "Budget tips?": `Here are smart budget tips to maximize your trip:

**Accommodation Savings:**
- Book accommodations slightly outside the main tourist area for 30-40% savings
- Look for places offering complimentary breakfast - saves ₹200-300 daily
- Consider homestays for authentic experience at lower cost

**Transportation:**
- Use local public transport or shared rides instead of private taxis
- Book transport tickets in advance for better rates
- Walk when possible - it's free and you discover hidden gems!

**Food Budget:**
- Eat at local restaurants where locals eat - authentic & affordable
- Street food for lunch can save you 50-70% compared to restaurants
- Carry a water bottle and refill instead of buying bottled water

**Activities:**
- Many temples, parks, and viewpoints are free or have minimal entry fees
- Book activities directly instead of through hotel concierges
- Look for combo tickets that cover multiple attractions

**Money-Saving Tips:**
- Withdraw cash from ATMs once to avoid multiple fees
- Negotiate prices at markets - it's expected and part of the culture
- Travel during off-season for 30-50% savings on everything

With these tips, you can easily reduce your daily expenses by ₹500-1000!`,

  "Alternative activities?": `Here are some great alternative activities to consider:

**Adventure Alternatives:**
- If trekking isn't your thing, try cycling tours or nature walks
- Swap water sports for scenic boat rides or sunset cruises
- Replace intense activities with yoga or meditation sessions

**Cultural Alternatives:**
- Museum visits can be replaced with walking heritage tours
- Instead of tourist shows, attend local cultural performances
- Visit local art galleries or craft workshops for hands-on experiences

**Relaxation Alternatives:**
- Skip crowded tourist spots for peaceful local parks or cafes
- Replace shopping malls with local markets and bazaars
- Choose spa experiences or wellness centers over packed attractions

**Unique Experiences:**
- Take a cooking class to learn local cuisine
- Join a photography walk to capture hidden spots
- Visit during local festivals or weekly markets for authentic culture

**Off-the-Beaten-Path:**
- Explore nearby villages or lesser-known neighborhoods
- Find rooftop cafes or viewpoints loved by locals
- Attend workshops (pottery, painting, music) for memorable experiences

What type of activities interest you most - adventure, culture, relaxation, or something else?`,
}

export async function POST(request: Request) {
  try {
    const { itinerary, question, history } = await request.json()

    if (!itinerary || !question) {
      return NextResponse.json({ error: "Itinerary and question are required" }, { status: 400 })
    }

    const seededAnswer = SEEDED_RESPONSES[question.trim()]
    if (seededAnswer) {
      return NextResponse.json({ answer: seededAnswer })
    }

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

    const systemPrompt = `You are a helpful travel assistant. You have access to the user's itinerary for ${itinerary.place}.
Answer questions about their trip, suggest modifications, provide additional tips, or help with any travel-related concerns.
Keep responses concise and actionable.

Current Itinerary Summary:
- Destination: ${itinerary.place}
- Days: ${itinerary.numDays || itinerary.days?.length || 0}
- Budget: ${itinerary.budget || "Not specified"}
- Style: ${itinerary.travelStyle || "Not specified"}`

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
    console.error("[itinerary-chat] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get response",
        answer: `I'm having trouble connecting to the AI service right now. Error: ${error.message || "Unknown error"}. Please try again in a moment.`,
      },
      { status: 200 },
    )
  }
}
