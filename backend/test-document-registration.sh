#!/bin/bash

# Test student registration with document upload

echo "Testing student registration with document upload..."

# Generate unique email
EMAIL="student_$(date +%s)@example.com"

# 1. Register a student
echo -e "\n1. Registering student with email: $EMAIL"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "Student",
    "phone": "1234567890",
    "address": "Test Address",
    "role": "STUDENT"
  }')

echo "Registration response:"
echo "$RESPONSE" | jq '.'

# Extract access token
ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')
USER_ID=$(echo "$RESPONSE" | jq -r '.user.id')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "Error: No access token received"
  exit 1
fi

echo -e "\nAccess token received: ${ACCESS_TOKEN:0:20}..."
echo "User ID: $USER_ID"

# 2. Create a test PDF file
echo -e "\n2. Creating test PDF file..."
cat > /tmp/test-document.pdf << 'EOF'
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000229 00000 n
0000000317 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
410
%%EOF
EOF

echo "PDF file created at /tmp/test-document.pdf"

# 3. Upload document
echo -e "\n3. Uploading document..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3001/api/documents/upload \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@/tmp/test-document.pdf" \
  -F "type=id_proof" \
  -F "description=Test ID proof document")

echo "Upload response:"
echo "$UPLOAD_RESPONSE" | jq '.'

# Check if upload was successful
if echo "$UPLOAD_RESPONSE" | grep -q '"id"'; then
  echo -e "\n✅ SUCCESS: Document uploaded successfully!"
  
  # 4. Verify document in filesystem
  echo -e "\n4. Checking filesystem..."
  if ls -la uploads/documents/ | grep -q "pdf"; then
    echo "✅ Document found in filesystem:"
    ls -la uploads/documents/*.pdf | tail -1
  else
    echo "⚠️ Warning: Document not found in filesystem"
  fi
  
  # 5. Get user's documents
  echo -e "\n5. Fetching user's documents..."
  DOCS_RESPONSE=$(curl -s -X GET http://localhost:3001/api/documents/my-documents \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  echo "User's documents:"
  echo "$DOCS_RESPONSE" | jq '.'
  
else
  echo -e "\n❌ FAILED: Document upload failed"
  echo "Error details:"
  echo "$UPLOAD_RESPONSE"
fi

# Clean up
rm -f /tmp/test-document.pdf

echo -e "\n✅ Test complete!"