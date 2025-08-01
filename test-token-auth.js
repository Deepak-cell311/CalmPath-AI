// Test script for token-based authentication
const API_BASE_URL = 'https://calmpath-ai-backend.onrender.com'

async function testTokenAuth() {
  console.log('🧪 Testing Token-Based Authentication...\n')

  try {
    // 1. Test login with token
    console.log('1. Testing login with token...')
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'a1@gmail.com',
        password: 'your_password_here', // Replace with actual password
        accountType: 'Facility Staff'
      })
    })

    const loginData = await loginResponse.json()
    console.log('Login response:', loginData)

    if (!loginData.success || !loginData.token) {
      console.error('❌ Login failed')
      return
    }

    const token = loginData.token
    console.log('✅ Login successful, token received\n')

    // 2. Test getting user with token
    console.log('2. Testing user retrieval with token...')
    const userResponse = await fetch(`${API_BASE_URL}/api/auth/user-token`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const userData = await userResponse.json()
    console.log('User data:', userData)

    if (userData.id) {
      console.log('✅ User retrieval successful\n')
    } else {
      console.error('❌ User retrieval failed')
    }

    // 3. Test current user endpoint
    console.log('3. Testing current user endpoint...')
    const currentUserResponse = await fetch(`${API_BASE_URL}/api/auth/currentUser-token`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const currentUserData = await currentUserResponse.json()
    console.log('Current user data:', currentUserData)

    if (currentUserData.id) {
      console.log('✅ Current user endpoint successful\n')
    } else {
      console.error('❌ Current user endpoint failed')
    }

    console.log('🎉 All tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testTokenAuth() 