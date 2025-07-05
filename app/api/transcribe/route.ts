import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Received audio file:", file.name, file.size, "bytes, type:", file.type)

    // Check file size (Whisper has a 25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 25MB." }, { status: 400 })
    }

    // Check if file has content
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty audio file" }, { status: 400 })
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en",
      response_format: "json",
      temperature: 0.2, // Lower temperature for more consistent results
    })

    console.log("Transcription result:", transcription.text)

    // Return the transcribed text
    return NextResponse.json({
      text: transcription.text || "",
      duration: transcription.duration || 0,
    })
  } catch (error: any) {
    console.error("Transcription error:", error)

    // Handle specific OpenAI API errors
    if (error.code === "invalid_request_error") {
      return NextResponse.json(
        {
          error: "Invalid audio format. Please try again.",
        },
        { status: 400 },
      )
    }

    if (error.code === "rate_limit_exceeded") {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait a moment and try again.",
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to transcribe audio. Please try again.",
      },
      { status: 500 },
    )
  }
}
