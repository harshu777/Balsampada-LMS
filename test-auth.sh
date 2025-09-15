#!/bin/bash

API_URL="http://localhost:3001/api"

echo "=== Testing Authentication Flow ==="
echo ""

# 1. Test Login
echo "1. Testing Login (Admin)..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tuitionlms.com","password":"admin123"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo "✅ Login successful - Token received"
else
  echo "❌ Login failed"
  exit 1
fi

# 2. Test Protected Route (Dashboard)
echo ""
echo "2. Testing Protected Route (Dashboard)..."
DASHBOARD_RESPONSE=$(curl -s -X GET "${API_URL}/analytics/dashboard" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$DASHBOARD_RESPONSE" | grep -q "totalStudents\|totalUsers"; then
  echo "✅ Dashboard data fetched successfully"
else
  echo "❌ Failed to fetch dashboard data"
  echo "Response: $DASHBOARD_RESPONSE"
fi

# 3. Test Profile
echo ""
echo "3. Testing Profile Endpoint..."
PROFILE_RESPONSE=$(curl -s -X GET "${API_URL}/auth/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$PROFILE_RESPONSE" | grep -q "email"; then
  echo "✅ Profile fetched successfully"
else
  echo "❌ Failed to fetch profile"
fi

# 4. Test Logout
echo ""
echo "4. Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "${API_URL}/auth/logout" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")
echo "✅ Logout called"

# 5. Test accessing protected route after logout (should fail)
echo ""
echo "5. Testing Protected Route After Logout..."
AFTER_LOGOUT_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "${API_URL}/analytics/dashboard" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$AFTER_LOGOUT_RESPONSE" | grep -q "HTTP_CODE:401"; then
  echo "✅ Correctly denied access after logout"
else
  echo "⚠️  Still able to access protected route after logout"
fi

echo ""
echo "=== Test Complete ===""