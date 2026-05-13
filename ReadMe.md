# BlogApp - Authentication Layer Documentation

## Overview

The BlogApp authentication system implements a secure, industry-standard JWT-based authentication flow with refresh token rotation and session management. The system uses a dual-token approach (Access Token + Refresh Token) stored in cookies and headers for maximum security and reliability.

---

## 🏗️ Architecture

### Components

```
Authentication Layer
├── Routes (auth.routes.js)
├── Controllers (auth.controller.js)
├── Services (auth.service.js)
├── Repositories
│   ├── auth.repository.js (User queries)
│   └── session.repository.js (Session management)
├── Middleware
│   ├── auth.middleware.js (Token verification)
│   ├── validate.middleware.js (Input validation)
│   └── error.middleware.js (Error handling)
└── Utilities
    ├── jwt.js (Token generation/verification)
    └── hash.js (Token hashing)
```

### Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Sessions Table:**
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Authentication Flow

### 1. Signup Process

**Endpoint:** `POST /api/v1/auth/signup`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Flow:**
1. Validation middleware checks input constraints:
   - Username: min 3 characters
   - Email: valid email format
   - Password: min 6 characters

2. Service layer verifies user doesn't already exist by querying email

3. Password is hashed using bcrypt with salt rounds = 10
   ```javascript
   const passwordHash = await bcrypt.hash(password, 10);
   ```

4. New user record is created in database with hashed password

5. User object is returned (without password hash)

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 2. Login Process

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Detailed Flow:**

#### Step 1: Credential Verification
```javascript
const user = await authRepository.findUserByEmail(email);
if (!user) throw new Error("Invalid credentials");

const isPasswordMatched = await bcrypt.compare(password, user.password_hash);
if (!isPasswordMatched) throw new Error("Invalid credentials");
```

#### Step 2: Token Generation

**Access Token (Short-lived)**
```javascript
const accessToken = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN } // Typically 15-30 minutes
);
```

**Refresh Token (Long-lived)**
```javascript
const refreshToken = jwt.sign(
  { id: user.id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } // Typically 7 days
);
```

#### Step 3: Session Creation & Token Hashing

The refresh token is **hashed** before storage for security:
```javascript
const refreshTokenHash = hashToken(refreshToken);
// Uses SHA-256: crypto.createHash("sha256").update(token).digest("hex")
```

A session record is created in the database:
```javascript
await sessionRepository.createSession(
  user.id,
  refreshTokenHash,        // Hashed token (never store plaintext)
  req.headers["user-agent"],
  req.ip,
  expiresAt                // 7 days from now
);
```

**Why hash the token?**
- If database is compromised, attackers can't use the hashed tokens
- Similar to password hashing - one-way function
- Only the plain token sent to client can be verified

#### Step 4: Cookie Setting

The refresh token is sent as an **HTTP-only cookie**:
```javascript
res.cookie("refreshToken", result.refreshToken, {
  httpOnly: true,      // Not accessible via JavaScript (XSS protection)
  secure: false,       // Set to true in production (HTTPS only)
  sameSite: "strict",  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
});
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

### 3. Token Usage & Protected Routes

**Endpoint:** `GET /api/v1/posts` (requires authentication)

**How to make authenticated requests:**

Include the access token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

**Example with curl:**
```bash
curl -X GET "http://localhost:3000/api/v1/posts" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example with fetch:**
```javascript
fetch('http://localhost:3000/api/v1/posts', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

**Auth Middleware Processing:**
```javascript
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];  // Extract token after "Bearer "

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = decoded;  // Attach decoded payload to request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
```

---

### 4. Refresh Token Flow (Token Rotation)

**Why Refresh Tokens?**
- Access tokens are short-lived (15-30 min) for security
- If access token is stolen, window of damage is limited
- Refresh tokens are long-lived (7 days) but kept secure in HTTP-only cookies
- When access token expires, client uses refresh token to get new tokens

**Endpoint:** `POST /api/v1/auth/refresh`

**No request body needed** - refresh token is automatically sent from cookies

**Detailed Flow:**

#### Step 1: Extract & Validate Refresh Token
```javascript
const refreshToken = req.cookies.refreshToken;

if (!refreshToken) {
  throw new Error("Refresh token missing");
}

// Verify JWT signature and expiration
const decoded = verifyRefreshToken(refreshToken);
// {
//   id: 1,
//   iat: 1234567890,
//   exp: 1234989890
// }
```

#### Step 2: Session Validation
```javascript
// Hash the incoming refresh token
const refreshTokenHash = hashToken(refreshToken);

// Find session by hashed token
const session = await sessionRepository.findSessionByToken(refreshTokenHash);

if (!session) {
  throw new Error("Invalid session");
}

// Check if session is revoked
// (Session query includes: WHERE is_revoked = FALSE)

// Check if session has expired
if (new Date(session.expires_at) < new Date()) {
  throw new Error("Session expired");
}
```

#### Step 3: User Verification
```javascript
const user = await authRepository.findUserById(decoded.id);

if (!user) {
  throw new Error("User not found");
}
// User might have been deleted or deactivated
```

#### Step 4: Token Rotation (Issue New Tokens)
```javascript
// Generate NEW access token with fresh expiry
const newAccessToken = generateAccessToken(user);

// Generate NEW refresh token
const newRefreshToken = generateRefreshToken({
  id: user.id
});

// Hash the new refresh token
const newRefreshTokenHash = hashToken(newRefreshToken);

// Calculate new expiry date
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);
```

#### Step 5: Update Session in Database
```javascript
await sessionRepository.updateSessionToken(
  session.id,
  newRefreshTokenHash,  // Update with new hashed token
  expiresAt              // Update expiry to 7 days from now
);
```

**Key Point:** The old refresh token is no longer valid because:
1. Its hash is replaced in the database
2. Even if someone has the old token, its hash won't match any session

#### Step 6: Set New Cookie & Respond
```javascript
res.cookie("refreshToken", newRefreshToken, {
  httpOnly: true,
  secure: false,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

res.status(200).json({
  success: true,
  message: "Token refreshed successfully",
  data: {
    accessToken: newAccessToken
  }
});
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Client-Side Implementation (Example):**
```javascript
// Check if access token is expired
if (isAccessTokenExpired()) {
  // Call refresh endpoint
  const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include'  // Send cookies automatically
  });

  const data = await response.json();
  
  if (data.success) {
    // Store new access token
    localStorage.setItem('accessToken', data.data.accessToken);
    
    // Old refresh token is already updated in httpOnly cookie
    
    // Retry original request with new token
    retryOriginalRequest(data.data.accessToken);
  } else {
    // Refresh failed - redirect to login
    redirectToLogin();
  }
}
```

---

### 5. Logout Process

**Endpoint:** `POST /api/v1/auth/logout`

**Flow:**

#### Step 1: Extract Refresh Token
```javascript
const refreshToken = req.cookies.refreshToken;

if (!refreshToken) {
  throw new Error("Refresh token missing");
}
```

#### Step 2: Revoke Session
```javascript
// Hash the token
const refreshTokenHash = hashToken(refreshToken);

// Mark session as revoked in database
await sessionRepository.revokeSession(refreshTokenHash);
// UPDATE sessions SET is_revoked = TRUE WHERE refresh_token_hash = $1
```

**Why revoke instead of delete?**
- Audit trail: can see user's login history
- Security: can detect suspicious activity
- Can implement forced logout across all sessions

#### Step 3: Clear Cookie & Respond
```javascript
res.clearCookie("refreshToken");

res.status(200).json({
  success: true,
  message: "Logged out successfully"
});
```

---

## 🔒 Security Features

### 1. Password Security
- **Algorithm:** bcrypt with salt rounds = 10
- **Strength:** Resistant to rainbow tables, GPU attacks
- **Comparison:** Constant-time comparison prevents timing attacks

### 2. Token Security
```javascript
Access Token:
  - Short-lived (typically 15-30 minutes)
  - Contains user claims (id, email, role)
  - Sent in Authorization header (can be cached in memory)
  - Vulnerable if stolen, but limited time window

Refresh Token:
  - Long-lived (typically 7 days)
  - Minimal claims (just user id)
  - Stored in HTTP-only cookie (not accessible to JavaScript)
  - Hashed before database storage
  - Can be revoked per session or globally
```

### 3. HTTP-Only Cookies
```javascript
res.cookie("refreshToken", token, {
  httpOnly: true,      // ✅ Prevents XSS attacks (JS can't access)
  secure: false,       // ❌ Should be true in production (HTTPS only)
  sameSite: "strict"   // ✅ Prevents CSRF attacks (same-site only)
});
```

**Benefits:**
- Protected from XSS (Cross-Site Scripting)
- Automatically sent with same-origin requests
- Can't be stolen by malicious JavaScript
- Browser handles cookie lifecycle

### 4. Token Hashing
- Refresh tokens are hashed with SHA-256 before storage
- If database is breached, tokens cannot be used
- Similar principle to password hashing

### 5. Session Management
- Each session tied to:
  - User ID
  - User Agent (browser identification)
  - IP Address (basic device tracking)
  - Expiration date
- Can detect session hijacking
- Can revoke specific or all sessions

---

## 📊 User Journey Diagram

```
User Registration
├─ POST /api/v1/auth/signup
├─ Validate input (username, email, password)
├─ Hash password (bcrypt)
├─ Create user in database
└─ Return user info

User Login
├─ POST /api/v1/auth/login
├─ Verify credentials
├─ Generate Access Token (short-lived)
├─ Generate Refresh Token (long-lived)
├─ Hash refresh token
├─ Store session + hashed token in database
├─ Set HTTP-only cookie
├─ Return Access Token + User info
└─ ✅ Authenticated

Protected Route Request
├─ GET /api/v1/posts
├─ Include Authorization: Bearer {accessToken}
├─ Auth middleware verifies token
├─ Request processed with req.user data
└─ Response returned

Token Expired - Refresh Flow
├─ POST /api/v1/auth/refresh
├─ Extract refresh token from cookie
├─ Verify JWT signature
├─ Validate session exists and not revoked
├─ Generate NEW Access Token
├─ Generate NEW Refresh Token (rotation)
├─ Update session with new hashed token
├─ Set new cookie
├─ Return new Access Token
└─ ✅ Back in business

User Logout
├─ POST /api/v1/auth/logout
├─ Extract refresh token
├─ Mark session as revoked
├─ Clear cookie
└─ ✅ Logged out
```

---

## 🔄 Token Expiry & Refresh Example

**Timeline:**

```
Time 0: User logs in
├─ accessToken expires at T+30min
└─ refreshToken expires at T+7days

Time 25min: User makes API call
├─ accessToken still valid ✅
└─ Request succeeds

Time 35min: User makes API call
├─ accessToken expired ❌
├─ Frontend receives 401 error
├─ Frontend calls /refresh endpoint
├─ refreshToken still valid (6d 23.5h remaining) ✅
├─ Server issues new accessToken (expires at T+65min)
├─ Frontend retries with new token
└─ Request succeeds

Time 6 days 59 minutes: User still active
├─ accessToken just expired
├─ Frontend calls /refresh
├─ refreshToken expires in ~1 minute
├─ Server rotates: issues new tokens
│   ├─ New accessToken (fresh 30min)
│   └─ New refreshToken (fresh 7 days)
└─ User can continue

Time 7 days: User tries to refresh
├─ Old refreshToken expired
├─ Session also expired and revoked
├─ /refresh endpoint fails
├─ Frontend redirects to login
└─ User must login again
```

---

## 🛠️ Environment Variables

Create a `.env` file in project root:

```env
# JWT Configuration
JWT_ACCESS_SECRET=your_secret_key_here_access_token
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_secret_key_here_refresh_token
JWT_REFRESH_EXPIRES_IN=7d

# Database
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blogapp

# Server
PORT=3000
NODE_ENV=development
```

**Security Best Practices:**
- Use strong, unique secrets (min 32 characters)
- Use different secrets for access and refresh tokens
- Store securely in `.env` (never commit to git)
- Rotate secrets periodically in production
- Use environment-specific secrets

---

## 🧪 Testing the Auth Flow

### 1. Signup
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```
Response includes `accessToken`. Copy it for next request.

### 3. Verify Protected Route
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer <your_accessToken_here>"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Cookie: refreshToken=<your_refreshToken_from_cookie>"
```

### 5. Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Cookie: refreshToken=<your_refreshToken_from_cookie>"
```

---

## 📝 API Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/v1/auth/signup` | POST | ❌ No | Register new user |
| `/api/v1/auth/login` | POST | ❌ No | Login and get tokens |
| `/api/v1/auth/refresh` | POST | ❌ No | Refresh access token |
| `/api/v1/auth/logout` | POST | ❌ No | Revoke session |
| `/profile` | GET | ✅ Yes | Get current user profile |

---

## ⚠️ Common Issues & Solutions

### Issue: "Refresh token missing"
**Cause:** Cookie not sent by client
**Solution:** 
- Use `credentials: 'include'` in fetch
- Check `sameSite` and `secure` cookie settings
- Browser may block cookies if HTTPS not used in production

### Issue: "Invalid session"
**Cause:** Session not found in database
**Solution:**
- Check if refresh token was rotated
- Verify session hasn't been revoked
- Check if user was deleted

### Issue: "Session expired"
**Cause:** Refresh token's expiry date passed
**Solution:**
- User must login again
- Implement sliding window expiry for better UX

### Issue: Token not in request
**Cause:** Auth header format incorrect
**Solution:**
```
✅ Correct: Authorization: Bearer eyJhbGc...
❌ Wrong: Authorization: eyJhbGc...
❌ Wrong: Bearer eyJhbGc...
```

---

## 🚀 Security Checklist

- [ ] Use HTTPS in production (`secure: true` for cookies)
- [ ] Use strong JWT secrets (min 32 characters, random)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CORS restrictions
- [ ] Use helmet.js for security headers
- [ ] Implement password strength validation
- [ ] Add email verification for signups
- [ ] Implement device/location tracking for sessions
- [ ] Add suspicious login detection
- [ ] Use bcrypt salt rounds ≥ 10
- [ ] Hash refresh tokens before storage
- [ ] Set reasonable token expiry times
- [ ] Monitor session table for anomalies
- [ ] Implement token blacklisting if needed
- [ ] Add logging for auth events

---

## 📚 Related Files

- Route handlers: [auth.routes.js](src/modules/auth/auth.routes.js)
- Controller logic: [auth.controller.js](src/modules/auth/auth.controller.js)
- Business logic: [auth.service.js](src/modules/auth/auth.service.js)
- Token utilities: [jwt.js](src/utils/jwt.js)
- Auth middleware: [auth.middleware.js](src/middleware/auth.middleware.js)
- Session management: [session.repository.js](src/modules/auth/session.repository.js)

---

## 🔗 References

- [JWT (JSON Web Tokens)](https://jwt.io/)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [HTTP-Only Cookies](https://owasp.org/www-community/attacks/xss/#defense-httponly-cookie)
- [Token Rotation Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
