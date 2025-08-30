// Simple test script to verify authentication
const testAuth = async () => {
  try {
    console.log('Testing authentication endpoints...');
    
    // Test login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success && loginData.data.accessToken) {
      console.log('✅ Login successful, token received');
      
      // Test NGO dashboard with token
      const dashboardResponse = await fetch('http://localhost:5000/api/ngo/dashboard', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard response:', dashboardData);
      
      if (dashboardResponse.ok) {
        console.log('✅ NGO dashboard access successful');
      } else {
        console.log('❌ NGO dashboard access failed:', dashboardData.message);
      }
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run test
testAuth();
