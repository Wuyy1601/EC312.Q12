# API Testing Guide - Authentication Endpoints

## Base URL
```
http://localhost:5001
```

## 1. Health Check
```bash
curl http://localhost:5001/health
```

## 2. Register New User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "password": "123456",
    "phone": "0901234567"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "_id": "...",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 3. Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nguyenvana@example.com",
    "password": "123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "_id": "...",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 4. Get Profile (Protected Route)
**Note:** Replace `YOUR_TOKEN_HERE` with the token from login/register response

```bash
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "role": "customer",
    "phone": "0901234567",
    "avatar": "https://via.placeholder.com/150",
    "isActive": true,
    "createdAt": "2025-11-09T...",
    "updatedAt": "2025-11-09T..."
  }
}
```

## 5. Update Profile (Protected Route)
```bash
curl -X PUT http://localhost:5001/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Nguyen Van A Updated",
    "phone": "0987654321",
    "address": {
      "street": "123 Nguyen Hue",
      "city": "Ho Chi Minh",
      "district": "District 1",
      "ward": "Ben Nghe"
    }
  }'
```

## 6. Logout (Protected Route)
```bash
curl -X POST http://localhost:5001/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Error Cases

### 1. Register with existing email
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "nguyenvana@example.com",
    "password": "123456"
  }'
```
Response: `400 - Email đã được sử dụng`

### 2. Login with wrong password
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nguyenvana@example.com",
    "password": "wrongpassword"
  }'
```
Response: `401 - Email hoặc mật khẩu không đúng`

### 3. Access protected route without token
```bash
curl -X GET http://localhost:5001/api/auth/profile
```
Response: `401 - Vui lòng đăng nhập để truy cập`

### 4. Access with invalid token
```bash
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer invalid_token_here"
```
Response: `401 - Token không hợp lệ hoặc đã hết hạn`

---

## Testing with Postman

1. **Import Collection**: Create a new collection "Gift Shop API"
2. **Set Environment Variable**: 
   - `base_url`: `http://localhost:5001`
   - `token`: (will be set after login)
3. **Test Register**: POST `{{base_url}}/api/auth/register`
4. **Test Login**: POST `{{base_url}}/api/auth/login`
   - In Tests tab, add: `pm.environment.set("token", pm.response.json().data.token);`
5. **Test Profile**: GET `{{base_url}}/api/auth/profile`
   - In Authorization tab, select "Bearer Token" and use `{{token}}`

---

## Quick Test Script (Copy & Paste)

Save this as `test-auth.sh` and run with `bash test-auth.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5001"

echo "=== Testing Authentication API ==="
echo ""

# 1. Health Check
echo "1. Health Check..."
curl -s $BASE_URL/health | json_pp
echo ""

# 2. Register
echo "2. Register new user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "123456",
    "phone": "0901234567"
  }')
echo $REGISTER_RESPONSE | json_pp
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""

# 3. Get Profile
echo "3. Get profile with token..."
curl -s -X GET $BASE_URL/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""

# 4. Update Profile
echo "4. Update profile..."
curl -s -X PUT $BASE_URL/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test User Updated",
    "phone": "0987654321"
  }' | json_pp
echo ""

echo "=== Test completed ==="
```
