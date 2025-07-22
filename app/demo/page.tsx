"use client"
import { useState, useEffect, useRef } from "react"

export default function VoiceChatPage() {
  const [voiceChatMode, setVoiceChatMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [messages, setMessages] = useState<{ who: "user" | "ai", text: string }[]>([])
  const recognitionRef = useRef<any>(null)
  const transcriptRef = useRef("")
  const [speechSupported, setSpeechSupported] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const lastHeardRef = useRef(Date.now())
  const restartTimeout = useRef<NodeJS.Timeout | null>(null)

  // --- Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setCurrentTranscript("")
        transcriptRef.current = ""
        console.log('[SR] onstart')
      }

      recognitionRef.current.onresult = (event: any) => {
        lastHeardRef.current = Date.now()
        let interim = "", final = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) final += t
          else interim += t
        }
        setCurrentTranscript(interim || final)
        transcriptRef.current = interim || final
        console.log('[SR] onresult', interim || final)
      }

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false)
        setCurrentTranscript("")
        transcriptRef.current = ""
        console.error('[SR] onerror', event.error)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        const finalText = transcriptRef.current.trim()
        setCurrentTranscript("")
        transcriptRef.current = ""
        console.log('[SR] onend, transcript:', finalText)
        if (finalText && finalText.length > 1) {
          handleSpeechResult(finalText)
        } else if (voiceChatMode) {
          // Debounce next start!
          if (restartTimeout.current) clearTimeout(restartTimeout.current)
          restartTimeout.current = setTimeout(() => {
            if (voiceChatMode && !isListening && !speechSynthesis.speaking) {
              startListening()
            }
          }, 400)
        }
      }
    }
    // eslint-disable-next-line
  }, [voiceChatMode])

  // --- Auto-timeout: If no new speech in 2 seconds, stop listening and process transcript
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        if (Date.now() - lastHeardRef.current > 2000 && isListening) {
          stopListening()
        }
      }, 250)
      return () => clearInterval(interval)
    }
  }, [isListening])

  // --- Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setAvailableVoices(voices)
      if (!selectedVoice) {
        const v = voices.find((v) => v.lang.startsWith("en"))
        if (v) setSelectedVoice(v)
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [selectedVoice])

  // --- Main loop handlers
  const handleMicrophoneClick = () => {
    if (voiceChatMode) {
      stopListening()
      speechSynthesis.cancel()
      setVoiceChatMode(false)
      if (restartTimeout.current) clearTimeout(restartTimeout.current)
    } else {
      setVoiceChatMode(true)
      setTimeout(() => startListening(), 300)
    }
  }

  const startListening = async () => {
    if (!speechSupported) return
    if (speechSynthesis.speaking) {
      console.log('[SR] startListening blocked: TTS speaking')
      return
    }
    if (isListening) {
      console.log('[SR] startListening blocked: already listening')
      return
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      recognitionRef.current && recognitionRef.current.start()
      lastHeardRef.current = Date.now()
      console.log('[SR] startListening')
    } catch (e) {
      alert("Microphone access denied or unavailable.")
    }
  }

  const stopListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      console.log('[SR] stopListening')
    }
  }

  const speakResponse = (text: string, onEnd?: () => void) => {
    const utterance = new SpeechSynthesisUtterance(text)
    if (selectedVoice) utterance.voice = selectedVoice
    utterance.rate = 1
    utterance.onend = () => {
      console.log('[TTS] onend')
      setTimeout(() => {
        if (voiceChatMode) startListening()
      }, 400)
      onEnd && onEnd()
    }
    speechSynthesis.speak(utterance)
    console.log('[TTS] speak', text)
  }

  // --- Main Chat Step
  const handleSpeechResult = async (transcript: string) => {
    stopListening()
    setIsProcessing(true)
    setMessages(m => [...m, { who: "user", text: transcript }])
    try {
      const aiReply = await getAIResponse(transcript)
      setMessages(m => [...m, { who: "ai", text: aiReply }])
      speakResponse(aiReply)
    } catch (e) {
      setMessages(m => [...m, { who: "ai", text: "Sorry, I didn't catch that." }])
    } finally {
      setIsProcessing(false)
    }
  }

  // --- Connect to your OpenAI backend!
  async function getAIResponse(userText: string): Promise<string> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        conversationHistory: messages.map(m => ({
          type: m.who,
          content: m.text,
          timestamp: new Date().toISOString(),
        })).slice(-10),
      }),
    })
    if (!res.ok) throw new Error("AI API error")
    const data = await res.json()
    return data.response
  }

  // --- Render
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center pt-10">
      <div className="mb-8">
        <button
          className={`rounded-full w-24 h-24 text-4xl shadow-lg border-4
            ${voiceChatMode ? "bg-green-600 text-white border-green-900" : "bg-blue-600 text-white border-blue-900"}
            ${isListening ? "animate-pulse" : ""}
          `}
          onClick={handleMicrophoneClick}
        >
          {voiceChatMode ? "🔊" : "🎤"}
        </button>
      </div>
      <div className="mb-6 text-lg font-semibold">
        {voiceChatMode
          ? isListening
            ? "Listening… Speak now!"
            : isProcessing
              ? "Thinking…"
              : "Voice chat session active"
          : "Tap mic to start voice chat"}
      </div>
      {isListening && (
        <div className="mb-6 w-full max-w-xl px-4 py-2 bg-white rounded shadow border text-blue-800">
          <strong>You:</strong> {currentTranscript || <span className="text-gray-400">…</span>}
        </div>
      )}
      <div className="w-full max-w-xl bg-white rounded shadow border px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm">No messages yet. Start talking!</div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.who === "user" ? "text-right" : "text-left"}
          >
            <span className={`inline-block px-3 py-2 rounded-lg
              ${m.who === "user" ? "bg-blue-200 text-blue-900" : "bg-green-100 text-green-900"}`}>
              <strong>{m.who === "user" ? "You" : "AI"}:</strong> {m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-10 text-xs text-gray-400 text-center">
        One tap to start session, one tap to stop.<br />
        No need to tap between turns.<br />
        [Debug logs in console]
      </div>
    </div>
  )
}