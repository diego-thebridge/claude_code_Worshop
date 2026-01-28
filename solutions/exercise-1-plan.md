# Solution: Exercise 1 - Plan Mode Challenge

## Task
Use Plan Mode to analyze the current JWT authentication system and create a detailed plan to migrate to OAuth2.

## Solution Approach

### Step 1: Enter Plan Mode
```bash
cd ecommerce-api
claude --permission-mode plan
```

Or press `Shift+Tab` until you see `⏸ plan mode on`.

### Step 2: Initial Analysis Prompt

```
Analyze the current authentication system in this codebase. I need to migrate from JWT to OAuth2 with authorization code flow.

Please:
1. Identify all files related to authentication
2. Document the current authentication flow
3. List security issues with the current approach
4. Create a detailed migration plan to OAuth2 with authorization code flow
5. Consider backward compatibility for existing users
6. Specify database schema changes needed
7. Outline testing strategy
```

### Step 3: Expected Claude Exploration

Claude should explore these files:
- `src/controllers/auth.controller.js` - Login/register endpoints
- `src/middleware/auth.middleware.js` - JWT verification
- `src/services/auth.service.js` - Authentication business logic
- `src/models/schema.prisma` - Database schema (users table)
- `src/config/` - Configuration files
- `tests/unit/auth.test.js` - Existing tests

### Step 4: Detailed Plan Output

## Example Plan Document

---

# OAuth2 Migration Plan for E-Commerce API

## Current State Analysis

### Files Involved in Authentication
1. **src/controllers/auth.controller.js** (78 lines)
   - POST `/api/auth/register` - User registration
   - POST `/api/auth/login` - Login with JWT generation
   - POST `/api/auth/logout` - Token invalidation (currently ineffective)

2. **src/middleware/auth.middleware.js** (45 lines)
   - `authenticate` - Verifies JWT from Authorization header
   - `requireAdmin` - Checks user role

3. **src/services/auth.service.js** (120 lines)
   - `createUser(email, password)` - Registration logic
   - `validateCredentials(email, password)` - Login validation
   - `generateToken(user)` - JWT creation
   - `verifyToken(token)` - JWT validation

4. **src/models/schema.prisma**
   - `users` table with id, email, password_hash, role, created_at, updated_at

5. **src/config/jwt.config.js**
   - JWT_SECRET configuration
   - Token expiration settings (currently: 7 days or never)

### Current Authentication Flow

```
Client                    Server
  |                         |
  |---POST /auth/login---->|
  |   {email, password}    |
  |                        |
  |                        |--Validate credentials
  |                        |--Generate JWT
  |                        |
  |<---JWT token-----------|
  |                        |
  |                        |
  |---API request-------->|
  |  Header: Bearer JWT   |
  |                       |
  |                       |--Verify JWT signature
  |                       |--Extract user from payload
  |                       |
  |<---Response-----------|
```

### Security Issues Identified

1. **No token expiration**: JWT tokens configured with 7 days or no expiration
   - **Risk**: Stolen tokens valid indefinitely
   - **CVSS**: 6.5 (Medium)

2. **No refresh tokens**: Once JWT expires, user must re-authenticate
   - **Risk**: Poor UX, no token rotation
   - **CVSS**: 3.0 (Low)

3. **Logout is ineffective**: JWT tokens can't be revoked server-side
   - **Risk**: Logout doesn't actually invalidate the token
   - **CVSS**: 5.5 (Medium)

4. **JWT secret management**: Secret in `.env` file, no rotation mechanism
   - **Risk**: If leaked, all tokens compromised
   - **CVSS**: 7.2 (High)

5. **No PKCE**: Current flow doesn't protect against authorization code interception
   - **Risk**: Vulnerable to authorization code interception
   - **CVSS**: 6.0 (Medium)

## OAuth2 Migration Plan

### Target Architecture: OAuth2 with Authorization Code Flow + PKCE

```
Client                    Auth Server              Resource Server
  |                           |                         |
  |--1. Authorization req---->|                        |
  |   + code_challenge        |                        |
  |                           |                        |
  |<--2. Authorization code---|                        |
  |                           |                        |
  |--3. Token request-------->|                        |
  |   + code + code_verifier  |                        |
  |                           |                        |
  |<--4. Access + Refresh-----|                        |
  |        tokens             |                        |
  |                           |                        |
  |--5. API request---------------------------------->|
  |   Bearer access_token                            |
  |                                                  |
  |<--6. Response------------------------------------|
  |                                                  |
  |                           |                      |
  |--7. Refresh token-------->|                      |
  |                           |                      |
  |<--8. New access token-----|                      |
```

### Phase 1: Database Schema Changes

#### New Tables

**oauth_clients** (OAuth2 clients/applications):
```prisma
model OAuthClient {
  id            String   @id @default(uuid())
  client_id     String   @unique
  client_secret String   // hashed
  name          String
  redirect_uris String[] // Array of allowed redirect URIs
  grant_types   String[] // ["authorization_code", "refresh_token"]
  scopes        String[] // ["read", "write", "admin"]
  is_trusted    Boolean  @default(false)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}
```

**oauth_authorization_codes** (Temporary authorization codes):
```prisma
model OAuthAuthorizationCode {
  id                  String   @id @default(uuid())
  code                String   @unique
  client_id           String
  user_id             String
  redirect_uri        String
  code_challenge      String?  // For PKCE
  code_challenge_method String? // "S256" or "plain"
  scopes              String[]
  expires_at          DateTime
  used                Boolean  @default(false)
  created_at          DateTime @default(now())

  @@index([code, client_id])
  @@index([expires_at])
}
```

**oauth_access_tokens** (Access tokens with tracking):
```prisma
model OAuthAccessToken {
  id            String   @id @default(uuid())
  token         String   @unique // hashed
  client_id     String
  user_id       String
  scopes        String[]
  expires_at    DateTime
  revoked       Boolean  @default(false)
  revoked_at    DateTime?
  created_at    DateTime @default(now())

  @@index([token, revoked])
  @@index([user_id, revoked])
  @@index([expires_at])
}
```

**oauth_refresh_tokens** (Long-lived refresh tokens):
```prisma
model OAuthRefreshToken {
  id                String   @id @default(uuid())
  token             String   @unique // hashed
  access_token_id   String
  client_id         String
  user_id           String
  scopes            String[]
  expires_at        DateTime // e.g., 30 days
  revoked           Boolean  @default(false)
  revoked_at        DateTime?
  created_at        DateTime @default(now())

  @@index([token, revoked])
  @@index([user_id, revoked])
}
```

#### Migration Strategy

```sql
-- migrations/YYYYMMDDHHMMSS_add_oauth2_tables.sql

-- Step 1: Create new tables
CREATE TABLE oauth_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(255) UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  redirect_uris TEXT[] NOT NULL,
  grant_types TEXT[] NOT NULL,
  scopes TEXT[] NOT NULL,
  is_trusted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE oauth_authorization_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  redirect_uri TEXT NOT NULL,
  code_challenge TEXT,
  code_challenge_method VARCHAR(10),
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auth_codes_code_client ON oauth_authorization_codes(code, client_id);
CREATE INDEX idx_auth_codes_expires ON oauth_authorization_codes(expires_at);

CREATE TABLE oauth_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_access_tokens_token_revoked ON oauth_access_tokens(token, revoked);
CREATE INDEX idx_access_tokens_user_revoked ON oauth_access_tokens(user_id, revoked);
CREATE INDEX idx_access_tokens_expires ON oauth_access_tokens(expires_at);

CREATE TABLE oauth_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  access_token_id UUID REFERENCES oauth_access_tokens(id),
  client_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token_revoked ON oauth_refresh_tokens(token, revoked);
CREATE INDEX idx_refresh_tokens_user_revoked ON oauth_refresh_tokens(user_id, revoked);

-- Step 2: Seed default OAuth client for existing web app
INSERT INTO oauth_clients (client_id, client_secret, name, redirect_uris, grant_types, scopes, is_trusted)
VALUES (
  'web-app-default',
  '$2b$12$...', -- hashed secret
  'Default Web Application',
  ARRAY['http://localhost:3000/callback', 'https://app.example.com/callback'],
  ARRAY['authorization_code', 'refresh_token'],
  ARRAY['read', 'write'],
  TRUE
);
```

### Phase 2: Implementation

#### New Files to Create

1. **src/controllers/oauth.controller.js** (NEW)
   - GET `/oauth/authorize` - Authorization page
   - POST `/oauth/authorize` - User grants access
   - POST `/oauth/token` - Exchange code for tokens
   - POST `/oauth/revoke` - Revoke tokens

2. **src/services/oauth.service.js** (NEW)
   - `generateAuthorizationCode(clientId, userId, redirectUri, scopes, codeChallenge)`
   - `validateAuthorizationCode(code, clientId, redirectUri, codeVerifier)`
   - `generateAccessToken(userId, clientId, scopes)`
   - `generateRefreshToken(accessTokenId, userId, clientId, scopes)`
   - `validateAccessToken(token)`
   - `refreshAccessToken(refreshToken)`
   - `revokeToken(token)`

3. **src/services/pkce.service.js** (NEW)
   - `generateCodeChallenge(codeVerifier)` - SHA256 hash
   - `verifyCodeChallenge(codeVerifier, codeChallenge)`

4. **src/middleware/oauth.middleware.js** (NEW)
   - `validateClient` - Verify client_id and client_secret
   - `authenticateOAuth` - Verify access token (replaces JWT middleware)
   - `requireScope(scope)` - Check token has required scope

#### Files to Modify

1. **src/controllers/auth.controller.js**
   - Keep login/register for now (backward compatibility)
   - Add deprecation warnings
   - Update to also create OAuth tokens for new registrations

2. **src/middleware/auth.middleware.js**
   - Update `authenticate` to accept both JWT (legacy) and OAuth tokens
   - Add deprecation check: if JWT, log warning

3. **src/routes/index.js**
   - Add new OAuth routes
   - Keep existing auth routes (backward compatibility)

4. **src/config/oauth.config.js** (NEW)
   - Token expiration times (access: 1h, refresh: 30d)
   - Supported grant types
   - Supported scopes

#### Implementation Order

**Week 1: Core OAuth Infrastructure**
1. Create database migrations
2. Implement `oauth.service.js` (token generation/validation)
3. Implement `pkce.service.js` (code challenge)
4. Write unit tests for services

**Week 2: OAuth Endpoints**
1. Create `oauth.controller.js` with all endpoints
2. Add authorization page UI (consent screen)
3. Implement `oauth.middleware.js`
4. Write integration tests for OAuth flow

**Week 3: Backward Compatibility**
1. Update `auth.middleware.js` to support both JWT and OAuth
2. Add migration script for existing users
3. Add deprecation warnings to JWT endpoints
4. Update API documentation

**Week 4: Testing & Rollout**
1. End-to-end testing
2. Performance testing
3. Security audit
4. Gradual rollout (feature flag)

### Phase 3: Backward Compatibility Strategy

#### Dual-Token Support (Transition Period)

Update `src/middleware/auth.middleware.js`:

```javascript
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.substring(7);

  // Try OAuth first
  try {
    const oauthToken = await oauthService.validateAccessToken(token);
    if (oauthToken && !oauthToken.revoked && oauthToken.expires_at > new Date()) {
      req.user = await User.findById(oauthToken.user_id);
      req.tokenType = 'oauth';
      req.scopes = oauthToken.scopes;
      return next();
    }
  } catch (err) {
    // Token not OAuth format, try JWT
  }

  // Fallback to JWT (legacy)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    req.tokenType = 'jwt';

    // Log deprecation warning
    logger.warn('JWT token used (deprecated)', {
      userId: decoded.userId,
      endpoint: req.path
    });

    // TODO: Remove JWT support after 2024-12-31
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

#### Migration Path for Existing Users

**Option 1: Transparent Migration**
- When user logs in with JWT, automatically issue OAuth tokens
- Return both in response
- Client gradually switches to OAuth tokens

**Option 2: Forced Migration**
- Set JWT expiration to 7 days
- After expiration, users must re-authenticate
- New login flow uses OAuth

**Option 3: Graceful Transition (Recommended)**
- Support both for 3 months
- During this period:
  - New logins get OAuth tokens
  - Existing JWT tokens continue working
  - Show deprecation notice in response headers: `X-Auth-Type: jwt-deprecated`
- After 3 months, JWT support removed

### Phase 4: Testing Strategy

#### Unit Tests

**oauth.service.test.js**:
```javascript
describe('OAuthService', () => {
  describe('generateAuthorizationCode', () => {
    it('should create authorization code with PKCE challenge');
    it('should set correct expiration (10 minutes)');
    it('should include requested scopes');
  });

  describe('validateAuthorizationCode', () => {
    it('should validate code with correct code_verifier');
    it('should reject used codes');
    it('should reject expired codes');
    it('should reject incorrect code_verifier');
  });

  describe('generateAccessToken', () => {
    it('should create access token with 1 hour expiration');
    it('should hash token before storing');
    it('should include user scopes');
  });

  describe('generateRefreshToken', () => {
    it('should create refresh token with 30 day expiration');
    it('should link to access token');
  });

  describe('refreshAccessToken', () => {
    it('should issue new access token with valid refresh token');
    it('should reject revoked refresh tokens');
    it('should reject expired refresh tokens');
  });
});
```

#### Integration Tests

**oauth.flow.test.js**:
```javascript
describe('OAuth2 Authorization Code Flow', () => {
  it('should complete full authorization flow with PKCE', async () => {
    // 1. Generate code challenge
    const codeVerifier = generateRandomString();
    const codeChallenge = sha256(codeVerifier);

    // 2. Request authorization code
    const authResponse = await request(app)
      .get('/oauth/authorize')
      .query({
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code',
        scope: 'read write',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

    expect(authResponse.status).toBe(302);
    const code = extractCodeFromRedirect(authResponse.headers.location);

    // 3. Exchange code for tokens
    const tokenResponse = await request(app)
      .post('/oauth/token')
      .send({
        grant_type: 'authorization_code',
        code,
        client_id: 'test-client',
        client_secret: 'test-secret',
        redirect_uri: 'http://localhost:3000/callback',
        code_verifier: codeVerifier
      });

    expect(tokenResponse.status).toBe(200);
    expect(tokenResponse.body.access_token).toBeDefined();
    expect(tokenResponse.body.refresh_token).toBeDefined();
    expect(tokenResponse.body.expires_in).toBe(3600); // 1 hour

    // 4. Use access token
    const apiResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${tokenResponse.body.access_token}`);

    expect(apiResponse.status).toBe(200);
  });

  it('should refresh access token', async () => {
    // Get initial tokens
    const { access_token, refresh_token } = await getTokens();

    // Wait for access token to expire (or mock time)
    await sleep(3601000);

    // Refresh
    const response = await request(app)
      .post('/oauth/token')
      .send({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: 'test-client',
        client_secret: 'test-secret'
      });

    expect(response.status).toBe(200);
    expect(response.body.access_token).not.toBe(access_token);
  });
});
```

#### Security Tests

**oauth.security.test.js**:
```javascript
describe('OAuth Security', () => {
  it('should reject authorization code without PKCE verifier');
  it('should reject code used twice');
  it('should reject expired authorization codes');
  it('should reject invalid redirect_uri');
  it('should revoke all refresh tokens on password change');
  it('should rate limit token endpoint');
});
```

### Phase 5: Rollout Plan

#### Week 1-2: Internal Testing
- Deploy to staging environment
- Test with internal apps
- Security audit

#### Week 3-4: Beta Rollout
- Enable for 10% of users (feature flag)
- Monitor errors and performance
- Gather feedback

#### Week 5-6: Gradual Rollout
- Increase to 50% of users
- Continue monitoring

#### Week 7-8: Full Rollout
- Enable for 100% of users
- JWT tokens still work (backward compatibility)

#### Week 9-20: Deprecation Period
- 3 months with both JWT and OAuth support
- Weekly reminders to migrate
- Track JWT usage (should decrease)

#### Week 21: JWT Removal
- Remove JWT support
- All clients must use OAuth2

### Success Metrics

- [ ] Zero data breach incidents during migration
- [ ] <1% error rate on OAuth endpoints
- [ ] <100ms latency for token validation
- [ ] 95%+ of users migrated to OAuth in 3 months
- [ ] Zero tokens stolen/leaked
- [ ] All security audit findings addressed

### Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes for clients | High | Dual-token support for 3 months |
| Performance degradation | Medium | Add database indexes, caching |
| Token leakage | Critical | Hash tokens in DB, short expiration |
| Complex migration | Medium | Gradual rollout with monitoring |
| User frustration (re-login) | Low | Transparent migration where possible |

### Documentation Updates

- [ ] API documentation (OAuth2 endpoints)
- [ ] Client integration guide (authorization flow)
- [ ] Migration guide for existing clients
- [ ] Security best practices (PKCE, token storage)
- [ ] Troubleshooting guide
- [ ] Admin documentation (token management)

---

## Questions for Product/Team

1. **Existing mobile apps**: Do they support OAuth2 authorization code flow with PKCE?
2. **Third-party integrations**: Any external apps using our API?
3. **Downtime tolerance**: Can we have 5-minute downtime for database migration?
4. **User experience**: Show consent screen even for trusted apps?
5. **Scopes**: What granular permissions do we need? (read, write, admin, or more specific?)
6. **Token lifetime**: 1h access / 30d refresh acceptable?

## Follow-up Prompts to Refine Plan

After receiving this initial plan, you might ask Claude:

```
> What about rate limiting on the OAuth endpoints to prevent brute force attacks?

> Can you add details on how to handle token rotation when a refresh token is used?

> What if we want to support multiple OAuth clients (mobile app, web app, third-party apps)?

> How do we handle token revocation when a user changes their password?

> Can you add monitoring and alerting recommendations for the OAuth system?
```

## Plan Completion Checklist

✅ All authentication files identified
✅ Current flow documented with diagram
✅ Security issues listed with severity
✅ Target OAuth2 architecture designed
✅ Database schema changes specified
✅ Migration SQL provided
✅ New files and modified files listed
✅ Implementation order defined
✅ Backward compatibility strategy outlined
✅ Testing strategy comprehensive (unit, integration, security)
✅ Rollout plan with gradual deployment
✅ Success metrics defined
✅ Risks identified with mitigation
✅ Documentation updates listed
✅ Open questions for product team

---

**Note**: This is an example of a thorough plan that Claude should generate after analyzing your codebase. The actual plan will vary based on your specific code structure and requirements.
