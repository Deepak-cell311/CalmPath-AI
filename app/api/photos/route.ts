import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.toLowerCase()

    // Get auth token for backend API calls
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No auth token provided for photos API")
      return NextResponse.json({ photos: [] })
    }

    const token = authHeader.substring(7)
    
    // Get current user to fetch their photos
    let currentUserId = null
    try {
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/user-token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        currentUserId = userData.id
        console.log("Current user ID for photos:", currentUserId)
      }
    } catch (error) {
      console.error("Error fetching user data for photos:", error)
      return NextResponse.json({ photos: [] })
    }

    if (!currentUserId) {
      console.log("No current user ID found")
      return NextResponse.json({ photos: [] })
    }

    // Fetch photos from backend for the current user
    let allPhotos = []
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      console.log("DEBUG: Using backend URL:", backendUrl)
      console.log("DEBUG: NEXT_PUBLIC_API_URL env var:", process.env.NEXT_PUBLIC_API_URL)
      
      const photosResponse = await fetch(`${backendUrl}/api/family/memoryPhotos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (photosResponse.ok) {
        const photosData = await photosResponse.json()
        // Map the backend response format to frontend format
        allPhotos = (photosData.data || []).map((photo: any) => {
          // Construct the full URL for the photo and proxy it through our frontend
          let photoUrl = photo.file
          if (photoUrl && !photoUrl.startsWith('http')) {
            // If it's a relative path, construct the full URL
            photoUrl = `${backendUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`
          }
          
          // Proxy the image through our frontend API to handle authentication
          if (photoUrl) {
            const authToken = token // Use the token we already have
            photoUrl = `/api/image-proxy?url=${encodeURIComponent(photoUrl)}&token=${encodeURIComponent(authToken)}`
          }
          
          return {
            id: photo.id,
            name: photo.photoname,
            description: photo.description || '',
            url: photoUrl,
            context: photo.contextAndStory || '',
            tags: photo.tags || []
          }
        })
        console.log(`Fetched ${allPhotos.length} photos from backend`)
        console.log('Photo URLs:', allPhotos.map((p: any) => ({ name: p.name, url: p.url })))
      } else {
        console.log("Failed to fetch photos from backend")
        return NextResponse.json({ photos: [] })
      }
    } catch (error) {
      console.error("Error fetching photos from backend:", error)
      return NextResponse.json({ photos: [] })
    }

    if (!query) {
      return NextResponse.json({ photos: allPhotos })
    }

    // Search for photos that match the query in tags, name, description, or context
    const matchingPhotos = allPhotos.filter((photo: any) => {
      const searchText = `${photo.name || ''} ${photo.description || ''} ${photo.context || ''} ${(photo.tags || []).join(" ")}`.toLowerCase()
      const queryLower = query.toLowerCase()

      // Check for direct keyword matches
      const keywords = queryLower.split(" ")
      const hasKeywordMatch = keywords.some((keyword: string) => {
        if (keyword.length < 2) return false // Skip very short words
        return searchText.includes(keyword)
      })

      // Check for birthday-related terms
      const birthdayTerms = ["birthday", "birth", "celebration", "party", "cake", "gift", "present"]
      const hasBirthdayMatch = birthdayTerms.some((term) => queryLower.includes(term) && searchText.includes(term))

      // Check for specific home-related terms
      const homeTerms = ["home", "house", "living", "room", "family", "place", "where", "lived"]
      const hasHomeMatch = homeTerms.some((term) => queryLower.includes(term) && searchText.includes(term))

      // Check for emotional context
      const emotionalTerms = ["miss", "lonely", "remember", "wish", "want", "see", "picture", "photo"]
      const hasEmotionalContext = emotionalTerms.some((term) => queryLower.includes(term))

      // If emotional context + home terms, prioritize home photos
      if (hasEmotionalContext && (queryLower.includes("home") || queryLower.includes("house"))) {
        return (photo.tags || []).includes("home") || (photo.tags || []).includes("house") || (photo.tags || []).includes("family")
      }

      // If asking for birthday pictures, return any photos that might be birthday-related
      if (queryLower.includes("birthday") || queryLower.includes("birth")) {
        return hasBirthdayMatch || hasKeywordMatch
      }

      return hasKeywordMatch || hasHomeMatch || hasBirthdayMatch
    })

    console.log(`Photo search for "${query}" found ${matchingPhotos.length} matches`)
    console.log(
      `Matching photos:`,
      matchingPhotos.map((p: any) => p.name),
    )

    return NextResponse.json({ photos: matchingPhotos })
  } catch (error) {
    console.error("Photo search error:", error)
    return NextResponse.json({ error: "Failed to search photos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token for backend API calls
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "No auth token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const photoData = await request.json()

    // Upload photo to backend
          const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(photoData)
    })

    if (uploadResponse.ok) {
      const result = await uploadResponse.json()
      return NextResponse.json(result)
    } else {
      const error = await uploadResponse.text()
      console.error("Backend photo upload failed:", error)
      return NextResponse.json({ error: "Failed to upload photo to backend" }, { status: uploadResponse.status })
    }
  } catch (error) {
    console.error("Photo upload error:", error)
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get auth token for backend API calls
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "No auth token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "No id provided" }, { status: 400 });
    }

    // Delete photo from backend
          const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/photos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (deleteResponse.ok) {
      const result = await deleteResponse.json()
      return NextResponse.json(result)
    } else {
      const error = await deleteResponse.text()
      console.error("Backend photo delete failed:", error)
      return NextResponse.json({ error: "Failed to delete photo from backend" }, { status: deleteResponse.status })
    }
  } catch (error) {
    console.error("Photo delete error:", error)
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
