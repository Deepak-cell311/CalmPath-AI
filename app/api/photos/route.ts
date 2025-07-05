import { type NextRequest, NextResponse } from "next/server"

// In a real app, this would be stored in a database
const memoryPhotos = [
  {
    id: 1,
    name: "Family Home",
    date: "2023-08-15",
    tags: ["home", "house", "family", "living room"],
    description: "Our beautiful family home where we spent so many happy years",
    url: "/placeholder.svg?height=300&width=400&text=Family+Home",
    context: "This is where Sid lived for 30 years. The living room where we watched TV together every evening.",
  },
  {
    id: 2,
    name: "Birthday Celebration",
    date: "2023-07-20",
    tags: ["birthday", "celebration", "family", "cake", "party"],
    description: "Sid's 75th birthday party with all the grandchildren",
    url: "/placeholder.svg?height=300&width=400&text=Birthday+Party",
    context: "Sid's favorite birthday. He was so happy to see all the grandchildren together.",
  },
  {
    id: 3,
    name: "Garden Memories",
    date: "2023-06-10",
    tags: ["garden", "flowers", "nature", "hobby", "roses"],
    description: "Sid working in his beloved rose garden",
    url: "/placeholder.svg?height=300&width=400&text=Rose+Garden",
    context: "Sid spent hours every day tending to his roses. His pride and joy.",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.toLowerCase()

    if (!query) {
      return NextResponse.json({ photos: memoryPhotos })
    }

    // Search for photos that match the query in tags, name, description, or context
    const matchingPhotos = memoryPhotos.filter((photo) => {
      const searchText = `${photo.name} ${photo.description} ${photo.context} ${photo.tags.join(" ")}`.toLowerCase()
      const queryLower = query.toLowerCase()

      // Check for direct keyword matches
      const keywords = queryLower.split(" ")
      const hasKeywordMatch = keywords.some((keyword) => {
        if (keyword.length < 2) return false // Skip very short words
        return searchText.includes(keyword)
      })

      // Check for specific home-related terms
      const homeTerms = ["home", "house", "living", "room", "family", "place", "where", "lived"]
      const hasHomeMatch = homeTerms.some((term) => queryLower.includes(term) && searchText.includes(term))

      // Check for emotional context
      const emotionalTerms = ["miss", "lonely", "remember", "wish", "want", "see"]
      const hasEmotionalContext = emotionalTerms.some((term) => queryLower.includes(term))

      // If emotional context + home terms, prioritize home photos
      if (hasEmotionalContext && (queryLower.includes("home") || queryLower.includes("house"))) {
        return photo.tags.includes("home") || photo.tags.includes("house") || photo.tags.includes("family")
      }

      return hasKeywordMatch || hasHomeMatch
    })

    console.log(`Photo search for "${query}" found ${matchingPhotos.length} matches`)
    console.log(
      `Matching photos:`,
      matchingPhotos.map((p) => p.name),
    )

    return NextResponse.json({ photos: matchingPhotos })
  } catch (error) {
    console.error("Photo search error:", error)
    return NextResponse.json({ error: "Failed to search photos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const photoData = await request.json()

    const newPhoto = {
      id: memoryPhotos.length + 1,
      ...photoData,
      date: new Date().toISOString().split("T")[0],
    }

    memoryPhotos.push(newPhoto)

    return NextResponse.json({ success: true, photo: newPhoto })
  } catch (error) {
    console.error("Photo upload error:", error)
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}
