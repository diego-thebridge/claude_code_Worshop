# Solution: Exercise 3 - Custom Security Agent

## Solution File

The security-auditor agent is already provided in:
`.claude/agents/security-auditor.md`

## How to Use

### Step 1: Verify Agent Exists

```bash
ls .claude/agents/security-auditor.md
```

If it doesn't exist, copy from the workshop materials.

### Step 2: Start Claude Code

```bash
cd ecommerce-api
claude
```

### Step 3: Invoke the Agent

**Option A: Explicit invocation**:
```
> Use the security-auditor agent to analyze this codebase for vulnerabilities
```

**Option B: Implicit invocation** (Claude decides based on description):
```
> Perform a comprehensive security audit of this codebase focusing on OWASP Top 10
```

### Expected Output

The agent should detect these intentional vulnerabilities:

#### Critical Issues

1. **SQL Injection - src/services/products.service.js:45**
   ```javascript
   // Vulnerable code
   const sql = `SELECT * FROM products WHERE name LIKE '%${query}%'`;
   ```
   - Fix: Use parameterized queries

2. **Hardcoded Secret - .env (committed to git)**
   ```
   JWT_SECRET=super-secret-key-12345
   DATABASE_URL=postgresql://admin:password123@localhost:5432/ecommerce
   ```
   - Fix: Use environment variables, add .env to .gitignore

#### High Issues

3. **Broken Access Control - src/middleware/auth.middleware.js:34**
   ```javascript
   function requireAdmin(req, res, next) {
     if (req.user && req.user.role === 'admin') {
       return next();
     }
     // Role from JWT without server-side verification
   }
   ```
   - Fix: Verify role from database, not just JWT

4. **Missing Input Validation - src/controllers/users.controller.js:78**
   ```javascript
   async function updateProfile(req, res) {
     const { email, name, phone } = req.body;
     await userService.update(req.user.id, { email, name, phone });
     // No validation!
   }
   ```
   - Fix: Add validation middleware

#### Medium Issues

5. **No Rate Limiting - All endpoints**
   - No express-rate-limit middleware
   - Fix: Add rate limiting

6. **Missing Inventory Validation - src/services/orders.service.js:56**
   ```javascript
   async function createOrder(userId, items) {
     const order = await db.order.create({
       data: { userId, items }
     });
     // No stock check!
   }
   ```
   - Fix: Check stock before creating order

## Success Criteria

✅ Agent created with correct frontmatter
✅ System prompt includes OWASP Top 10 checklist
✅ Agent uses only read-only tools (Read, Grep, Glob, Bash)
✅ Agent in plan mode (permissionMode: plan)
✅ Agent detects at least 4 of 6 intentional vulnerabilities
✅ Output includes:
  - Severity levels (Critical, High, Medium, Low)
  - File paths and line numbers
  - Code snippets
  - Impact descriptions
  - Fix recommendations

## Validation

Compare agent output against this checklist:

- [ ] SQL injection detected (products.service.js)
- [ ] Hardcoded secrets detected (.env)
- [ ] Input validation issues detected (users.controller.js)
- [ ] Broken access control detected (auth.middleware.js)
- [ ] No rate limiting detected
- [ ] Missing inventory checks detected (orders.service.js)

If the agent misses any, refine the system prompt with more specific patterns.

## Advanced: Auto-Fix Version

To create a version that can fix issues automatically:

`.claude/agents/security-fixer.md`:
```yaml
---
name: security-fixer
description: Automatically fix common security issues after security-auditor finds them.
tools: Read, Edit, Write, Grep, Glob
model: sonnet
permissionMode: acceptEdits
---

You automatically fix security issues found by the security-auditor.

Only fix these safe categories:
1. Input validation (add Joi schemas)
2. Rate limiting (add express-rate-limit)
3. Security headers (add helmet)

DO NOT auto-fix:
- SQL injection (too risky, needs manual review)
- Access control (business logic dependent)
- Hardcoded secrets (need to know where to get them from)

After fixing, create a commit with detailed message.
```

Usage:
```
> Use security-auditor to find issues, then use security-fixer to fix the safe ones
```

## Troubleshooting

**Problem**: Agent not invoked automatically
**Solution**: Check the `description` field - it should include keywords like "security", "audit", "vulnerabilities", "OWASP"

**Problem**: Agent tries to modify files in plan mode
**Solution**: Verify `permissionMode: plan` is in frontmatter

**Problem**: Agent doesn't find known vulnerabilities
**Solution**:
- Make sure agent has access to Read, Grep, Glob tools
- Add more specific patterns to the system prompt
- Give hints: "Check src/services/products.service.js for SQL patterns"

**Problem**: Agent output is too verbose
**Solution**: Add to system prompt: "Be concise. Only report confirmed vulnerabilities with high confidence."
