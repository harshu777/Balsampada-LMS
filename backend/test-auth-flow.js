const fetch = require('node-fetch');

async function testAuthFlow() {
  console.log('Testing authentication flow...\n');

  // 1. Login as admin
  console.log('1. Logging in as admin...');
  const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@tuitionlms.com',
      password: 'Admin@123',
    }),
  });

  if (!loginResponse.ok) {
    console.error('Login failed:', await loginResponse.text());
    return;
  }

  const loginData = await loginResponse.json();
  console.log('Login successful!');
  console.log('Access Token:', loginData.accessToken ? 'Received' : 'Not received');
  console.log('Refresh Token:', loginData.refreshToken ? 'Received' : 'Not received');
  console.log('User Role:', loginData.user?.role);

  // 2. Test fetching students
  console.log('\n2. Fetching students...');
  const studentsResponse = await fetch('http://localhost:3001/api/users/students', {
    headers: {
      'Authorization': `Bearer ${loginData.accessToken}`,
    },
  });

  if (!studentsResponse.ok) {
    console.error('Failed to fetch students:', studentsResponse.status, await studentsResponse.text());
    return;
  }

  const students = await studentsResponse.json();
  console.log(`Successfully fetched ${students.length} students`);

  // 3. Test fetching pending students
  console.log('\n3. Fetching pending students...');
  const pendingResponse = await fetch('http://localhost:3001/api/users/students?status=PENDING', {
    headers: {
      'Authorization': `Bearer ${loginData.accessToken}`,
    },
  });

  if (!pendingResponse.ok) {
    console.error('Failed to fetch pending students:', pendingResponse.status, await pendingResponse.text());
    return;
  }

  const pendingStudents = await pendingResponse.json();
  console.log(`Successfully fetched ${pendingStudents.length} pending students`);

  console.log('\n✅ All tests passed!');
}

testAuthFlow().catch(console.error);