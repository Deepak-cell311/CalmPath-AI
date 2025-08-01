import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log("Chat API called")

    const { message, conversationHistory } = await request.json()
    console.log("Received message:", message)

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Search for relevant photos based on the message - make search more aggressive
    const photoResponse = await fetch(`${request.nextUrl.origin}/api/photos?query=${encodeURIComponent(message)}`, {
      credentials: 'include'
    })
    const photoData = await photoResponse.json()
    const relevantPhotos = photoData.photos || []

    console.log(`Found ${relevantPhotos.length} relevant photos for message: "${message}"`)

    // Build conversation context for the AI therapist
    let systemPrompt = `You are CalmPath, a compassionate AI therapist designed specifically for individuals with dementia or cognitive conditions. The user's name is Sid. Your primary goals are to:

1. Always address Sid by name when appropriate
2. Ease confusion and reduce agitation
3. Foster emotional safety and comfort
4. Provide calming and validating conversation
5. Use simple, clear language
6. Be patient and understanding
7. Redirect gently during confusion or hallucinations
8. Focus on positive memories and feelings
9. Keep responses short and soothing (2-3 sentences max)
10. Be warm and personal in your responses
11. When Sid mentions anxiety, sleep issues, or feeling bad, provide specific helpful suggestions
12. Encourage use of the breathing exercises or peaceful scenes when appropriate

IMPORTANT CONVERSATION RULES:
- Never give the same generic response twice in a row
- Always provide specific, helpful, and varied responses based on what Sid is telling you
- When Sid mentions specific memories (like birthdays, celebrations, family events), engage with those memories specifically
- Ask follow-up questions about the memories he shares
- If you just showed photos, acknowledge them and ask about the memories they bring back
- Avoid generic responses like "What would help you feel more comfortable right now?" - instead engage with what Sid is actually saying

MEMORY ENGAGEMENT:
- When Sid talks about birthdays, ask about who was there, what made it special, favorite moments
- When Sid mentions home, ask about favorite rooms, activities, or memories there
- When Sid shares any memory, show genuine interest and ask gentle follow-up questions
- Help Sid elaborate on positive memories to create a therapeutic conversation`

    // Add photo context if relevant photos are found
    if (relevantPhotos.length > 0) {
      systemPrompt += `\n\nRELEVANT MEMORY PHOTOS AVAILABLE:
${relevantPhotos.map((photo: any) => `- ${photo.name}: ${photo.context} (Tags: ${photo.tags.join(", ")})`).join("\n")}

PHOTO INTERACTION RULES:
- When Sid mentions topics related to these photos, acknowledge his feelings and mention that you have beautiful photos to show him
- Say something like "I have some wonderful photos of [topic] that might bring back happy memories. Let me show them to you."
- AFTER showing photos, engage with the specific memories they represent
- Ask Sid about what he remembers from the photos
- If photos were just shown, reference them in your response: "I can see that photo of [photo name] - tell me about that special day"
- Never ignore that photos were shared - always acknowledge and engage with them`
    }

    // Check if the last AI response was generic to avoid loops
    const lastAiMessage = conversationHistory.filter((msg: any) => msg.type === "ai").pop()
    if (lastAiMessage && lastAiMessage.content.includes("What would help you feel more comfortable right now?")) {
      systemPrompt += `\n\nIMPORTANT: Your last response was generic. This time, engage specifically with what Sid is telling you about his memories. Ask follow-up questions about the specific memory he mentioned.`
    }

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      // Add conversation history
      ...conversationHistory.map((msg: any) => ({
        role: msg.type === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
      // Add current message
      {
        role: "user" as const,
        content: message,
      },
    ]

    console.log("Sending to OpenAI with", messages.length, "messages")

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      max_tokens: 150,
      temperature: 0.8, // Increased for more variety
      presence_penalty: 0.8, // Increased to encourage new topics
      frequency_penalty: 1.0, // Increased to strongly discourage repetition
    })

    const response = completion.choices[0]?.message?.content || "I'm here to listen and help you feel calm, Sid."

    console.log("OpenAI response:", response)

    // Return response with photos if relevant
    return NextResponse.json({
      response,
      photos: relevantPhotos.length > 0 ? relevantPhotos : undefined,
    })
  } catch (error: any) {
    console.error("Chat error details:", error)
    return NextResponse.json(
      {
        error: "Failed to get AI response",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
