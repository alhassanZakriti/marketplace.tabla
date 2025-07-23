// Quick test script to check the liked restaurants API
const API_BASE_URL = "https://api.dev.tabla.ma"

async function testLikedRestaurantsAPI() {
  console.log('🧪 Testing liked restaurants API...')
  
  try {
    const url = `${API_BASE_URL}/api/v1/mp/liked-restaurants/`
    console.log('🌐 Making request to:', url)
    
    // First, test without authentication
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', [...response.headers.entries()])
    
    if (response.status === 401) {
      console.log('🔒 API requires authentication (401 Unauthorized)')
      console.log('💡 This is expected - user needs to be logged in to see liked restaurants')
    } else if (response.status === 200) {
      const data = await response.json()
      console.log('✅ API Response (200 OK):', data)
    } else {
      const text = await response.text()
      console.log(`❌ Unexpected response (${response.status}):`, text)
    }
    
  } catch (error) {
    console.error('💥 Error testing API:', error)
  }
}

testLikedRestaurantsAPI()
