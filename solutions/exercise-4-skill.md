# Solution: Exercise 4 - Team Code Review Skill

## Solution File

The code-review skill is already provided in:
`.claude/skills/code-review/SKILL.md`

## How to Use

### Step 1: Verify Skill Exists

```bash
ls .claude/skills/code-review/SKILL.md
```

If it doesn't exist, copy from the workshop materials.

### Step 2: Test the Skill

Start Claude Code:
```bash
cd ecommerce-api
claude
```

### Step 3: Invoke the Skill

**Option A: Implicit invocation** (recommended):
```
> Review the authentication code for our team standards
```

Claude should automatically invoke the code-review skill based on the description.

**Option B: Explicit invocation**:
```
> Use the code-review skill to analyze src/controllers/auth.controller.js
```

### Expected Output

The skill should provide structured feedback following this format:

```
## Code Review: src/controllers/auth.controller.js

### ✅ Passes

- ✅ Consistent naming conventions (camelCase for functions)
- ✅ Proper use of async/await throughout
- ✅ Clear function names that describe purpose

### ⚠️ Warnings (Should Fix)

⚠️ **Style - auth.controller.js:45**: Function `handleLogin` is 62 lines (limit: 50)
  Current: Single function handles validation, authentication, and response
  Suggestion: Extract validation into `validateLoginInput` helper function
  Priority: Medium

⚠️ **Documentation - auth.controller.js:12**: Missing JSDoc for exported function `handleLogin`
  Add:
  ```javascript
  /**
   * Handles user login request
   * @param {Request} req - Express request with email/password in body
   * @param {Response} res - Express response
   * @returns {Promise<void>}
   */
  async function handleLogin(req, res) {
    // ...
  }
  ```
  Priority: Medium

⚠️ **Testing - tests/unit/auth.test.js**: Missing edge case tests
  Add tests for:
  - Empty email string
  - Email with spaces
  - Password with special characters
  Priority: Medium

### ❌ Must Fix (Blocking Issues)

❌ **Security - auth.controller.js:67**: No input validation before processing
  Current:
  ```javascript
  async function handleLogin(req, res) {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    // No validation!
  }
  ```
  Fix:
  ```javascript
  async function handleLogin(req, res) {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input types' });
    }

    const user = await authService.login(email, password);
    // ...
  }
  ```
  Priority: Critical

❌ **Security - auth.controller.js:23**: Hardcoded JWT secret
  Current:
  ```javascript
  const token = jwt.sign(payload, "super-secret-key");
  ```
  Fix:
  ```javascript
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  ```
  Priority: Critical

### 📊 Summary

- **Total issues**: 3 warnings, 2 critical must-fix
- **Test coverage**: 65% (target: 80%+)
- **Security concerns**: 2 critical
- **Documentation**: Needs improvement (missing JSDoc)
- **Code quality**: Good structure, but functions too long
- **Recommendation**: ❌ Request changes (critical security issues)

### 💡 Suggestions

- Consider extracting authentication logic into a separate service layer
- Add integration tests for the full login flow
- Implement rate limiting to prevent brute force attacks
```

## Success Criteria

✅ Skill created with valid frontmatter
✅ Team standards documented (Style, Security, Testing, Docs)
✅ Review process defined step-by-step
✅ Output format structured (Passes, Warnings, Must Fix, Summary)
✅ Skill auto-invokes when "code review" mentioned
✅ Findings include:
  - Category labels
  - File:line references
  - Code snippets
  - Specific suggestions
  - Priority levels

## Validation Checklist

Test the skill on various files:

### Test Case 1: File with style issues
```
> Review src/services/orders.service.js
```
Should detect:
- Long functions (>50 lines)
- Missing JSDoc
- Magic numbers

### Test Case 2: File with security issues
```
> Review src/services/products.service.js
```
Should detect:
- SQL injection vulnerability
- No input validation

### Test Case 3: File with good code
```
> Review src/utils/validators.js
```
Should give positive feedback:
- Follows standards
- Good documentation
- Proper error handling

## Advanced: Progressive Disclosure

For a more comprehensive skill with multiple files:

```
.claude/skills/code-review/
├── SKILL.md              # Overview (what Claude reads first)
├── STYLE_GUIDE.md        # Detailed style rules
├── SECURITY.md           # Security checklist (OWASP)
├── TESTING.md            # Testing standards
├── EXAMPLES.md           # Good/bad code examples
└── scripts/
    └── check-coverage.sh # Helper script
```

**SKILL.md** references other files:
```markdown
## Team Standards

For detailed standards, see:
- Style: STYLE_GUIDE.md
- Security: SECURITY.md (OWASP Top 10)
- Testing: TESTING.md

## Quick Checklist

**Style**: Functions <50 lines, files <300 lines, camelCase naming
**Security**: No secrets, input validation, parameterized queries
**Testing**: 80%+ coverage, edge cases, error paths
**Docs**: JSDoc for exports, README per module
```

## Customization

Adapt the skill for your team:

### Example: Add TypeScript Rules

```yaml
---
name: code-review-ts
description: Code review for TypeScript projects
allowed-tools: Read, Grep, Glob
---

[All previous content...]

## TypeScript-Specific Standards

**Type Safety**:
- Avoid `any` type (use `unknown` if needed)
- Define interfaces for all objects
- Use strict mode in tsconfig.json
- Prefer `type` over `interface` for unions

**Patterns to check**:
```typescript
// Bad
function process(data: any) { }

// Good
function process(data: UserData) { }

// Bad
const user = { } as User;

// Good
const user: User = { name: '', email: '' };
```
```

### Example: Add React-Specific Rules

```yaml
## React-Specific Standards

**Component Structure**:
- Functional components only (no classes)
- Max 200 lines per component
- Extract logic into custom hooks
- Props interface defined

**Hooks**:
- Follow rules of hooks (don't call in conditions)
- useEffect dependencies complete
- Memoization for expensive computations (useMemo, useCallback)
```

## Troubleshooting

**Problem**: Skill gives generic feedback
**Solution**: Add more specific examples and patterns to check in SKILL.md

**Problem**: Skill not invoked automatically
**Solution**: Update description to include common trigger phrases:
```yaml
description: Review code using team standards. Use when reviewing PRs, code changes, git diffs, or when user asks for code review.
```

**Problem**: Skill checks wrong things
**Solution**: Update team standards section to match your actual standards

**Problem**: Output too verbose
**Solution**: Add to prompt: "Be concise. Focus on most important issues. Max 20 issues."
