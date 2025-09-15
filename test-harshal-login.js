const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'hbaviskar777@gmail.com',
      password: 'Harshal123!@#'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('User ID:', response.data.user.id);
    console.log('User Name:', response.data.user.firstName, response.data.user.lastName);
    console.log('User Email:', response.data.user.email);
    console.log('User Role:', response.data.user.role);
    console.log('Token (first 20 chars):', response.data.accessToken.substring(0, 20) + '...');
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testLogin();