#!/bin/bash

echo "Testing document upload flow..."
echo ""

# 1. Login as admin to get token
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tuitionlms.com","password":"admin123"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token"
  exit 1
fi

echo "Access Token received: ${ACCESS_TOKEN:0:20}..."
echo ""

# 2. Create a test file
echo "2. Creating test PDF file..."
echo "%PDF-1.4
Test PDF Document" > /tmp/test-document.pdf

# 3. Upload document
echo "3. Uploading document..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3001/api/documents/upload \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@/tmp/test-document.pdf;type=application/pdf" \
  -F "type=id_proof" \
  -F "description=Test ID proof document")

echo "Upload Response: $UPLOAD_RESPONSE"
echo ""

# 4. Check uploads directory
echo "4. Checking uploads directory..."
ls -la uploads/documents/

echo ""
echo "✅ Test complete!"