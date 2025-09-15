#!/bin/bash

echo "Testing authentication flow..."
echo ""

# 1. Login as admin
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tuitionlms.com","password":"admin123"}')

echo "Login Response: $LOGIN_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token"
  exit 1
fi

echo "Access Token received: ${ACCESS_TOKEN:0:20}..."
echo ""

# 2. Test fetching students
echo "2. Fetching students..."
STUDENTS_RESPONSE=$(curl -s -X GET http://localhost:3001/api/users/students \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Students Response: $STUDENTS_RESPONSE"
echo ""

# 3. Test fetching pending students  
echo "3. Fetching pending students..."
PENDING_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/users/students?status=PENDING" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Pending Students Response: $PENDING_RESPONSE"
echo ""

echo "✅ Test complete!"