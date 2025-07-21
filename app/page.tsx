"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Heart,
  Mic,
  Volume2,
  Music,
  Wind,
  Camera,
  Waves,
  User,
  MicOff,
  VolumeX,
  Shield,
  LogIn,
  Type,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  photos?: MemoryPhoto[]
}

interface MemoryPhoto {
  id: number
  name: string
  description: string
  url: string
  context: string
  tags: string[]
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function PatientInterface() {
  const [volume, setVolume] = useState([100])
  const [isListening, setIsListening] = useState(false)
  const [caregiverMode, setCaregiverMode] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "exhale">("inhale")
  const [microphoneTest, setMicrophoneTest] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [speechTest, setSpeechTest] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [isProcessing, setIsProcessing] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const transcriptRef = useRef("");
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [peacefulImages, setPeacefulImages] = useState([
    "/placeholder.svg?height=400&width=600&text=Peaceful+Beach",
    "/placeholder.svg?height=400&width=600&text=Mountain+Lake",
    "/placeholder.svg?height=400&width=600&text=Forest+Path",
    "/placeholder.svg?height=400&width=600&text=Sunset+Garden",
    "/placeholder.svg?height=400&width=600&text=Calm+River",
  ])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showingMemoryPhotos, setShowingMemoryPhotos] = useState<MemoryPhoto[]>([])
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0)

  const recognitionRef = useRef<any>(null)
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const comfortActivities = [
    { name: "Peaceful Music", icon: Music },
    { name: "Breathing", icon: Wind },
    { name: "Memories", icon: Camera },
    { name: "Peaceful Scene", icon: Waves },
  ]

  // Check for Speech Recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      initializeSpeechRecognition()
    } else {
      setSpeechSupported(false)
      console.log("Speech Recognition not supported")
    }
  }, [])

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setAvailableVoices(voices)

      // Try to select a pleasant default voice
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Samantha") ||
          voice.name.includes("Karen") ||
          voice.name.includes("Moira") ||
          voice.name.includes("Female") ||
          voice.lang.startsWith("en"),
      )

      if (preferredVoice && !selectedVoice) {
        setSelectedVoice(preferredVoice)
      }
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [selectedVoice])

  // Auto-change peaceful scene images
  useEffect(() => {
    if (currentActivity === "peaceful scene") {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % peacefulImages.length)
      }, 4000) // Change every 4 seconds

      return () => clearInterval(interval)
    }
  }, [currentActivity, peacefulImages.length])

  // Update transcriptRef whenever currentTranscript changes
  useEffect(() => {
    transcriptRef.current = currentTranscript;
  }, [currentTranscript]);

  // Initialize Speech Recognition with better permission handling
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = "en-US"
    recognitionRef.current.maxAlternatives = 1

    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started")
      setIsListening(true)
      setCurrentTranscript("")
      transcriptRef.current = ""
    }

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const transcriptToShow = interimTranscript || finalTranscript;
      setCurrentTranscript(transcriptToShow);
      transcriptRef.current = transcriptToShow;
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
      setCurrentTranscript("")
      transcriptRef.current = ""

      let errorMessage = "I'm having trouble hearing you. "
      switch (event.error) {
        case "no-speech":
          errorMessage += "I didn't hear anything. Please try speaking again."
          break
        case "audio-capture":
          errorMessage += "Please check your microphone connection."
          break
        case "not-allowed":
          errorMessage += "Please allow microphone access and try again."
          break
        case "network":
          errorMessage += "Please check your internet connection."
          break
        default:
          errorMessage += "Please try again in a moment."
      }

      addErrorMessage(errorMessage)
    }

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended")
      const finalText = transcriptRef.current.trim()
      console.log("Final transcript on end:", finalText);
      if (finalText && finalText.length > 1) {
        // Process the complete speech when recognition ends
        handleSpeechResult(finalText)
      }
      setIsListening(false)
      setCurrentTranscript("")
      transcriptRef.current = ""
    }
  }

  // Improved breathing exercise animation with smoother transitions
  useEffect(() => {
    if (isBreathing) {
      const startTime = Date.now()
      const cycleDuration = 8000 // 8 seconds total cycle (4 in, 4 out)

      const updateBreathing = () => {
        const elapsed = (Date.now() - startTime) % cycleDuration
        const progress = elapsed / cycleDuration

        if (progress < 0.5) {
          setBreathingPhase("inhale")
        } else {
          setBreathingPhase("exhale")
        }

        if (isBreathing) {
          requestAnimationFrame(updateBreathing)
        }
      }

      updateBreathing()
    }

    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current)
      }
    }
  }, [isBreathing])

  // Test microphone functionality
  const testMicrophone = async () => {
    setMicrophoneTest("testing")
    try {
      if (!speechSupported) {
        throw new Error("Speech recognition not supported")
      }

      // Test by starting a brief recognition session
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const testRecognition = new SpeechRecognition()
      testRecognition.continuous = false
      testRecognition.interimResults = false

      testRecognition.onstart = () => {
        setTimeout(() => {
          testRecognition.stop()
        }, 2000)
      }

      testRecognition.onend = () => {
        setMicrophoneTest("success")
        setTimeout(() => setMicrophoneTest("idle"), 2000)
      }

      testRecognition.onerror = () => {
        setMicrophoneTest("error")
        setTimeout(() => setMicrophoneTest("idle"), 2000)
      }

      testRecognition.start()
    } catch (error) {
      console.error("Microphone test failed:", error)
      setMicrophoneTest("error")
      setTimeout(() => setMicrophoneTest("idle"), 2000)
    }
  }

  // Test simple speech functionality
  const testSimpleSpeech = () => {
    setSpeechTest("testing")
    const utterance = new SpeechSynthesisUtterance("Hello, I'm here to help you feel calm and peaceful.")
    utterance.volume = volume[0] / 100
    utterance.rate = 0.9
    utterance.pitch = 1.0

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onend = () => {
      setSpeechTest("success")
      setTimeout(() => setSpeechTest("idle"), 2000)
    }

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event)
      setSpeechTest("error")
      setTimeout(() => setSpeechTest("idle"), 2000)
    }

    speechSynthesis.speak(utterance)
  }

  // Start speech recognition with explicit permission request
  const startListening = async () => {
    if (!speechSupported) {
      addErrorMessage("Speech recognition is not supported in your browser. Please try typing your message instead.")
      setShowTextInput(true)
      return
    }

    try {
      // Request microphone permission explicitly for iOS/iPhone
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    } catch (error: any) {
      console.error("Error starting speech recognition:", error)
      if (error.name === "NotAllowedError") {
        addErrorMessage(
          "Microphone access denied. Please allow microphone access in your browser settings and try again.",
        )
      } else {
        addErrorMessage("Unable to start listening. Please try again or use text input.")
      }
      setShowTextInput(true)
    }
  }

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Handle speech recognition result
  const handleSpeechResult = async (transcript: string) => {
    console.log("handleSpeechResult called with:", transcript);
    if (!transcript || transcript.length < 2) {
      return // Ignore very short or empty results
    }

    setCurrentTranscript("")
    setIsProcessing(true)

    try {
      // Add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: transcript,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])

      // Get AI response
      const aiResponse = await getAIResponse(transcript)

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse.response,
        timestamp: new Date(),
        photos: aiResponse.photos,
      }
      setMessages((prev) => [...prev, aiMsg])

      // If photos are returned, show them
      if (aiResponse.photos && aiResponse.photos.length > 0) {
        setShowingMemoryPhotos(aiResponse.photos)
        setCurrentMemoryIndex(0)
      }

      // Speak the response
      speakResponse(aiResponse.response)
    } catch (error) {
      console.error("Error processing speech:", error)
      addErrorMessage("I'm having trouble understanding right now. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle text input submission
  const handleTextSubmit = async () => {
    if (!textInput.trim()) return

    const userMessage = textInput.trim()
    setTextInput("")
    setIsProcessing(true)

    try {
      // Add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: userMessage,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])

      // Get AI response
      const aiResponse = await getAIResponse(userMessage)

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse.response,
        timestamp: new Date(),
        photos: aiResponse.photos,
      }
      setMessages((prev) => [...prev, aiMsg])

      // If photos are returned, show them
      if (aiResponse.photos && aiResponse.photos.length > 0) {
        setShowingMemoryPhotos(aiResponse.photos)
        setCurrentMemoryIndex(0)
      }

      // Speak the response
      speakResponse(aiResponse.response)
    } catch (error) {
      console.error("Error processing text:", error)
      addErrorMessage("I'm having trouble understanding right now. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Get AI response using OpenAI API
  const getAIResponse = async (message: string): Promise<{ response: string; photos?: MemoryPhoto[] }> => {
    console.log("getAIResponse called with:", message);
    try {
      console.log("Sending message to AI:", message)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
        }),
      })

      console.log("API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error:", errorText)
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("AI response received:", data.response)
      console.log("Photos received:", data.photos?.length || 0)

      if (!data.response) {
        throw new Error("No response from AI")
      }

      // Force photo display for certain keywords even if AI doesn't trigger it
      let photosToShow = data.photos
      if (!photosToShow || photosToShow.length === 0) {
        const messageLower = message.toLowerCase()
        if (
          messageLower.includes("home") ||
          messageLower.includes("house") ||
          (messageLower.includes("miss") && messageLower.includes("home")) ||
          messageLower.includes("wish i could see")
        ) {
          // Manually fetch home photos
          try {
            const photoResponse = await fetch(`/api/photos?query=home house family`)
            const photoData = await photoResponse.json()
            photosToShow = photoData.photos || []
            console.log("Manually fetched home photos:", photosToShow.length)
          } catch (error) {
            console.error("Error fetching photos manually:", error)
          }
        }
      }

      return {
        response: data.response,
        photos: photosToShow,
      }
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Even in fallback, try to show relevant photos
      const messageLower = message.toLowerCase()
      let fallbackPhotos = undefined

      if (messageLower.includes("home") || messageLower.includes("house")) {
        try {
          const photoResponse = await fetch(`/api/photos?query=home`)
          const photoData = await photoResponse.json()
          fallbackPhotos = photoData.photos || []
        } catch (error) {
          console.error("Error fetching fallback photos:", error)
        }
      }

      return {
        response: getPersonalizedFallback(message),
        photos: fallbackPhotos,
      }
    }
  }

  // When returning from photo view, maintain conversation context
  const handleContinueConversation = () => {
    setShowingMemoryPhotos([])
    // Don't reset conversation - keep the context flowing
  }

  // Improved fallback responses that are more personalized
  const getPersonalizedFallback = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("birthday") || lowerMessage.includes("celebration")) {
      return "That sounds like such a special birthday, Sid! Tell me more about your 75th birthday celebration. Who was there with you? What made it so memorable?"
    }

    if (lowerMessage.includes("75th") || lowerMessage.includes("last year")) {
      return "Your 75th birthday must have been wonderful, Sid. I'd love to hear more about that celebration. What was your favorite part of the day?"
    }

    if (lowerMessage.includes("home") || lowerMessage.includes("house")) {
      return "I can hear how much your home means to you, Sid. What's your favorite memory from your home? Maybe a special room or activity you enjoyed there?"
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return `Hello ${lowerMessage.includes("sid") ? "Sid" : "there"}! I'm so glad you're here. How are you feeling today?`
    }

    if (lowerMessage.includes("anxious") || lowerMessage.includes("anxiety")) {
      return "I understand you're feeling anxious, Sid. That's completely normal. Let's try some deep breathing together. Breathe in slowly for 4 counts, hold for 4, then breathe out for 4. You're safe here with me."
    }

    if (lowerMessage.includes("sleep") || lowerMessage.includes("tired")) {
      return "Having trouble sleeping can be really difficult, Sid. Let's try some calming techniques. Would you like to try the breathing exercise or look at some peaceful scenes? Sometimes gentle relaxation can help prepare your mind for rest."
    }

    if (
      lowerMessage.includes("sad") ||
      lowerMessage.includes("upset") ||
      lowerMessage.includes("not good") ||
      lowerMessage.includes("bad")
    ) {
      return "I hear that you're not feeling good right now, Sid. It's okay to have difficult feelings. Take a deep breath with me. You're safe, and I'm here to help you feel more peaceful."
    }

    if (lowerMessage.includes("mood") || lowerMessage.includes("feeling")) {
      return "I'm here to help you with your mood, Sid. Sometimes when we're feeling overwhelmed, it helps to focus on our breathing or look at something peaceful. Would you like to try one of the calming activities?"
    }

    if (lowerMessage.includes("confused") || lowerMessage.includes("lost") || lowerMessage.includes("don't know")) {
      return "It's okay to feel confused sometimes, Sid. You don't need to worry about remembering everything. Let's focus on this moment together. You're doing just fine."
    }

    // Default personalized response
    return "Thank you for sharing that with me, Sid. I'm here to listen and support you. What would help you feel more comfortable right now?"
  }

  // Speak AI response with selected voice
  const speakResponse = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.volume = volume[0] / 100
    utterance.rate = 0.8 // Slower for better comprehension
    utterance.pitch = 1.0

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    speechSynthesis.speak(utterance)
  }

  // Helper function to add error messages
  const addErrorMessage = (content: string) => {
    const errorMsg: Message = {
      id: Date.now().toString(),
      type: "ai",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, errorMsg])
  }

  // Handle microphone button click
  const handleMicrophoneClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Handle activity selection
  const handleActivityClick = (activityName: string) => {
    if (activityName === "Breathing") {
      setCurrentActivity("breathing")
      setIsBreathing(true)
    } else if (activityName === "Peaceful Scene") {
      setCurrentActivity("peaceful scene")
      setCurrentImageIndex(0)
    } else {
      setCurrentActivity(activityName.toLowerCase())
    }
  }

  // Stop breathing exercise
  const stopBreathingExercise = () => {
    setIsBreathing(false)
    setCurrentActivity(null)
  }

  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
  }

  // Navigate memory photos
  const nextMemoryPhoto = () => {
    setCurrentMemoryIndex((prev) => (prev + 1) % showingMemoryPhotos.length)
  }

  const prevMemoryPhoto = () => {
    setCurrentMemoryIndex((prev) => (prev - 1 + showingMemoryPhotos.length) % showingMemoryPhotos.length)
  }

  // Memory Photos Display
  if (showingMemoryPhotos.length > 0) {
    const currentPhoto = showingMemoryPhotos[currentMemoryIndex]

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600 text-white">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 fill-white" />
              <span className="text-xl font-semibold">CalmPath</span>
            </div>
            <div className="text-sm opacity-80">Memory Photos</div>
          </div>
        </div>

        {/* Memory Photo Content */}
        <div className="bg-gray-50 text-gray-900 rounded-t-3xl min-h-[calc(100vh-120px)] px-6 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Beautiful Memories</h2>
            <p className="text-gray-600 mb-8">Here are some wonderful photos that might bring back happy memories</p>

            {/* Photo Display */}
            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-blue-200 to-purple-200 relative">
                <img
                  src={currentPhoto.url || "/placeholder.svg"}
                  alt={currentPhoto.name}
                  className="w-full h-full object-cover"
                />

                {/* Navigation arrows */}
                {showingMemoryPhotos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800"
                      onClick={prevMemoryPhoto}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800"
                      onClick={nextMemoryPhoto}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}

                {/* Photo indicators */}
                {showingMemoryPhotos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {showingMemoryPhotos.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentMemoryIndex ? "bg-white" : "bg-white/50"
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Photo Details */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{currentPhoto.name}</h3>
              <p className="text-gray-600 mb-4">{currentPhoto.description}</p>
              {currentPhoto.context && (
                <div className="bg-blue-50 rounded-lg p-4 text-left max-w-2xl mx-auto">
                  <p className="text-gray-700 italic">"{currentPhoto.context}"</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleContinueConversation}
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                Continue Conversation
              </Button>
              {showingMemoryPhotos.length > 1 && (
                <Button onClick={nextMemoryPhoto} className="bg-purple-500 hover:bg-purple-600 text-white">
                  Next Photo
                </Button>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-center py-4 border-t mt-8">
            <div className="flex items-center gap-2">
              {volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-20" />
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Breathing exercise view with smoother animation
  if (currentActivity === "breathing") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 text-white">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 fill-white" />
              <span className="text-xl font-semibold">CalmPath</span>
            </div>
            <div className="text-sm opacity-80">9:30</div>
          </div>
        </div>

        {/* Breathing Exercise Content */}
        <div className="bg-gray-50 text-gray-900 rounded-t-3xl min-h-[calc(100vh-120px)] px-6 pt-8">
          {/* Quick Comfort Activities */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="font-medium">Quick comfort activities</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {comfortActivities.map((activity, index) => (
                <Card
                  key={index}
                  className={`p-4 text-center hover:shadow-md transition-all cursor-pointer ${activity.name === "Breathing" ? "border-2 border-blue-500 bg-blue-50" : ""
                    }`}
                  onClick={() => handleActivityClick(activity.name)}
                >
                  <activity.icon
                    className={`w-8 h-8 mx-auto mb-2 ${activity.name === "Breathing" ? "text-blue-600" : "text-blue-500"
                      }`}
                  />
                  <p className="text-sm font-medium">{activity.name}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Breathing Exercise with Smooth Animation */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-8 text-gray-800">Let's breathe together</h2>

            <div className="relative mb-8 flex items-center justify-center">
              <div
                className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg transition-all duration-[4000ms] ease-in-out ${breathingPhase === "inhale" ? "scale-125 shadow-2xl" : "scale-100 shadow-lg"
                  }`}
                style={{
                  filter: breathingPhase === "inhale" ? "brightness(1.1)" : "brightness(1)",
                }}
              />
              {/* Outer ring for additional visual effect */}
              <div
                className={`absolute w-40 h-40 rounded-full border-2 border-blue-300 opacity-30 transition-all duration-[4000ms] ease-in-out ${breathingPhase === "inhale" ? "scale-110 opacity-50" : "scale-100 opacity-30"
                  }`}
              />
            </div>

            <p className="text-lg font-medium mb-2 transition-all duration-1000">
              {breathingPhase === "inhale" ? "Breathe in..." : "Breathe out..."}
            </p>
            <p className="text-gray-600 mb-8">Follow the circle... breathe naturally...</p>

            <Button
              onClick={stopBreathingExercise}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              Stop breathing exercise
            </Button>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between py-4 border-t mt-8">
            <div className="flex items-center gap-4">
              <Mic className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2">
                {volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-20" />
                <Volume2 className="w-4 h-4" />
              </div>
            </div>
          </div>
          {/* <div className="text-center text-sm text-gray-500 pb-4">
            Caregiver mode: {caregiverMode ? "Active" : "Inactive"} • Session: 0 min
          </div> */}
        </div>
      </div>
    )
  }

  // Peaceful Scene view with auto-changing images
  if (currentActivity === "peaceful scene") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-400 via-green-500 to-green-600 text-white">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 fill-white" />
              <span className="text-xl font-semibold">CalmPath</span>
            </div>
            <div className="text-sm opacity-80">9:30</div>
          </div>
        </div>

        {/* Peaceful Scene Content */}
        <div className="bg-gray-50 text-gray-900 rounded-t-3xl min-h-[calc(100vh-120px)] px-6 pt-8">
          {/* Quick Comfort Activities */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="font-medium">Quick comfort activities</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {comfortActivities.map((activity, index) => (
                <Card
                  key={index}
                  className={`p-4 text-center hover:shadow-md transition-all cursor-pointer ${activity.name === "Peaceful Scene" ? "border-2 border-green-500 bg-green-50" : ""
                    }`}
                  onClick={() => handleActivityClick(activity.name)}
                >
                  <activity.icon
                    className={`w-8 h-8 mx-auto mb-2 ${activity.name === "Peaceful Scene" ? "text-green-600" : "text-blue-500"
                      }`}
                  />
                  <p className="text-sm font-medium">{activity.name}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Peaceful Scene with Auto-changing Images */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-8 text-gray-800">Peaceful moments</h2>

            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-blue-200 to-green-200 relative">
                <img
                  src={peacefulImages[currentImageIndex] || "/placeholder.svg"}
                  alt="Peaceful scene"
                  className="w-full h-full object-cover transition-opacity duration-1000"
                  style={{ opacity: 1 }}
                />

                {/* Image overlay with gentle gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {peacefulImages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-lg font-medium mb-2 text-gray-700">
              Take a moment to breathe and enjoy this peaceful view
            </p>
            <p className="text-gray-600 mb-8">Let your mind rest and find calm in these beautiful scenes</p>

            <Button
              onClick={() => setCurrentActivity(null)}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
            >
              Return to activities
            </Button>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between py-4 border-t mt-8">
            <div className="flex items-center gap-4">
              <Mic className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2">
                {volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-20" />
                <Volume2 className="w-4 h-4" />
              </div>
            </div>
          </div>
          {/* <div className="text-center text-sm text-gray-500 pb-4">
            Caregiver mode: {caregiverMode ? "Active" : "Inactive"} • Session: 0 min
          </div> */}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 text-white">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-white" />
            <span className="text-xl font-semibold">CalmPath</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
            <div className="text-sm opacity-80">9:30</div>
          </div>
        </div>
        <p className="text-sm opacity-90 mb-1">Your caring voice companion</p>
        <p className="text-sm opacity-90 mb-4">{"I'll check in with you every 30 seconds"}</p>
        <div className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">
          {isListening ? "Listening..." : isProcessing ? "Processing..." : "Ready to listen"}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 text-gray-900 rounded-t-3xl min-h-[calc(100vh-200px)] px-6 pt-8">
        {/* Speech Recognition Support Alert */}
        {!speechSupported && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Speech recognition not available</p>
                <p className="text-sm">
                  Your browser doesn't support speech recognition. You can still use text input to communicate.
                </p>
                <Button onClick={() => setShowTextInput(true)} size="sm" className="mt-2">
                  Use Text Input
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Volume Control */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {volume[0] === 0 ? (
              <VolumeX className="w-5 h-5 text-gray-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600" />
            )}
            <span className="text-sm font-medium">Volume</span>
            <span className="text-sm text-purple-600 font-medium">{volume[0]}%</span>
          </div>
          <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-full" />
        </div>

        {/* Voice Settings */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Volume2 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">AI Voice</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showVoiceSettings ? "Hide" : "Change Voice"}
            </Button>
          </div>

          {showVoiceSettings && (
            <div className="bg-blue-50 rounded-lg p-4 border">
              <p className="text-sm text-blue-800 mb-3">Choose your preferred AI voice:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableVoices
                  .filter((voice) => voice.lang.startsWith("en"))
                  .map((voice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`voice-${index}`}
                        name="voice"
                        checked={selectedVoice?.name === voice.name}
                        onChange={() => setSelectedVoice(voice)}
                        className="text-blue-600"
                      />
                      <label htmlFor={`voice-${index}`} className="text-sm text-gray-700 flex-1">
                        {voice.name} ({voice.lang})
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance("Hello, this is how I sound.")
                          utterance.voice = voice
                          utterance.volume = volume[0] / 100
                          speechSynthesis.speak(utterance)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Test
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Voice Interface */}
        <div className="text-center mb-8">
          <div className="relative">
            <Button
              size="lg"
              className={`w-32 h-32 rounded-full ${!speechSupported
                  ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                  : isListening
                    ? "bg-red-500 hover:bg-red-600"
                    : isProcessing
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-blue-500 hover:bg-blue-600"
                } text-white shadow-lg transition-all relative overflow-hidden`}
              onClick={handleMicrophoneClick}
              disabled={isProcessing || !speechSupported}
            >
              {!speechSupported ? (
                <Shield className="w-8 h-8 relative z-10" />
              ) : isListening ? (
                <MicOff className="w-8 h-8 relative z-10" />
              ) : (
                <Mic className="w-8 h-8 relative z-10" />
              )}
              {isListening && <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />}
            </Button>
          </div>

          <p className="mt-4 text-lg font-medium">
            {!speechSupported
              ? "Speech not supported - use text below"
              : isListening
                ? "Speaking... Tap to stop and send"
                : isProcessing
                  ? "Processing..."
                  : "Tap to start speaking"}
          </p>
          <p className="text-gray-600 mt-2">{"I'm here to help you feel calm"}</p>
        </div>

        {/* Real-time Speech Display - Always visible when listening */}
        {isListening && (
          <div className="mb-8 p-6 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-700">You're saying:</span>
              <span className="text-sm text-gray-500 ml-auto">Tap microphone to stop and send</span>
            </div>
            <div className="min-h-[60px] p-4 bg-gray-50 rounded-lg border">
              {currentTranscript ? (
                <p className="text-lg text-gray-800 leading-relaxed">{currentTranscript}</p>
              ) : (
                <p className="text-gray-400 italic">Start speaking... I'm listening for your complete message</p>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-500 text-center">
              Your complete message will be sent when you stop speaking
            </div>
          </div>
        )}

        {/* Processing indicator when speech is being processed */}
        {isProcessing && (
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-yellow-700 font-medium">Processing your message...</span>
            </div>
          </div>
        )}

        {/* Text Input Alternative */}
        {(showTextInput || !speechSupported) && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Type your message</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
                placeholder="Type what you'd like to say..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <Button onClick={handleTextSubmit} disabled={!textInput.trim() || isProcessing}>
                Send
              </Button>
            </div>
          </div>
        )}

        {/* Test Options */}
        <div className="flex gap-3 mb-6 justify-center">
          <Button
            variant="outline"
            size="sm"
            className={`${microphoneTest === "testing"
                ? "text-yellow-600 border-yellow-600"
                : microphoneTest === "success"
                  ? "text-green-600 border-green-600"
                  : microphoneTest === "error"
                    ? "text-red-600 border-red-600"
                    : "text-blue-600 border-blue-600"
              } bg-transparent`}
            onClick={testMicrophone}
            disabled={microphoneTest === "testing" || !speechSupported}
          >
            {microphoneTest === "testing"
              ? "Testing..."
              : microphoneTest === "success"
                ? "Speech OK!"
                : microphoneTest === "error"
                  ? "Speech Error"
                  : "Test Speech Recognition"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${speechTest === "testing"
                ? "text-yellow-600 border-yellow-600"
                : speechTest === "success"
                  ? "text-green-600 border-green-600"
                  : speechTest === "error"
                    ? "text-red-600 border-red-600"
                    : "text-green-600 border-green-600"
              } bg-transparent`}
            onClick={testSimpleSpeech}
            disabled={speechTest === "testing"}
          >
            {speechTest === "testing"
              ? "Speaking..."
              : speechTest === "success"
                ? "Speech OK!"
                : speechTest === "error"
                  ? "Speech Error"
                  : "Test Simple Speech"}
          </Button>
        </div>

        {/* Recent Conversations */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="font-medium">Recent conversation</span>
          </div>

          {messages.length === 0 ? (
            <div className="flex items-center gap-2 text-gray-500">
              <User className="w-4 h-4" />
              <span className="text-sm">No conversations yet</span>
            </div>
          ) : (
            <ScrollArea className="h-48 w-full border rounded-lg p-4 bg-white">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg shadow-sm ${message.type === "user"
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                    >
                      <p className="font-medium text-xs mb-2 opacity-75">
                        {message.type === "user" ? "You said:" : "CalmPath:"}
                      </p>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.photos && message.photos.length > 0 && (
                        <div className="mt-2 text-xs opacity-75">
                          📸 {message.photos.length} memory photo{message.photos.length > 1 ? "s" : ""} shared
                        </div>
                      )}
                      <p className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {messages.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Start by {speechSupported ? "tapping the microphone above" : "typing a message"}
            </p>
          )}
        </div>

        {/* Quick Comfort Activities */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="font-medium">Quick comfort activities</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {comfortActivities.map((activity, index) => (
              <Card
                key={index}
                className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleActivityClick(activity.name)}
              >
                <activity.icon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-medium">{activity.name}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between py-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTextInput(!showTextInput)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Type className="w-4 h-4" />
          </Button>
          {/* <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Caregiver mode:</span>
            <Button
              variant={caregiverMode ? "default" : "outline"}
              size="sm"
              onClick={() => setCaregiverMode(!caregiverMode)}
            >
              {caregiverMode ? "Active" : "Inactive"}
            </Button>
            <span className="text-sm text-gray-500">Session: 0 min</span>
          </div> */}
        </div>
      </div>
    </div>
  )
}