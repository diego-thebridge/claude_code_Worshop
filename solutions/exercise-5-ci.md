# Solution: Exercise 5 - CI/CD Automation

## npm Scripts for Pre-commit Hooks

Add to `ecommerce-api/package.json`:

```json
{
  "scripts": {
    "pre-commit": "claude -p 'Review staged changes for security issues and code style. Be concise. Output: PASS or FAIL with critical issues only.'",
    "pre-push": "npm test && claude -p 'Verify all tests passed. If any failed, explain which ones and block push.'",
    "lint:claude": "claude -p 'Analyze codebase for code style issues. Output findings as JSON: {\"files\": [{\"path\": \"\", \"issues\": []}]}'",
    "security:audit": "claude -p 'Use the security-auditor agent to scan for vulnerabilities. Report critical issues only.'",
    "translate": "claude -p 'Find new keys in src/locales/en.json not in es.json, fr.json. Translate and update files. Preserve JSON formatting.'"
  }
}
```

## Usage Examples

### Pre-commit Check

```bash
# Make changes
git add src/auth.controller.js

# Run pre-commit check
npm run pre-commit

# If PASS, commit
git commit -m "feat: improve auth security"

# If FAIL, fix issues first
```

### Pre-push Check

```bash
# Before pushing
npm run pre-push

# Runs tests + Claude verification
# Only allows push if everything passes
```

### Security Audit

```bash
# Weekly security scan
npm run security:audit

# Review critical issues
# Create tickets for fixes
```

## GitHub Actions Integration

Create `.github/workflows/claude-review.yml`:

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for diff analysis

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Claude Code
        run: |
          curl -fsSL https://claude.ai/install.sh | bash
          echo "$HOME/.claude/bin" >> $GITHUB_PATH

      - name: Configure Claude
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude config set apiKey $ANTHROPIC_API_KEY

      - name: Review PR Changes
        id: review
        run: |
          REVIEW=$(claude -p "Review the changes in this PR compared to the base branch.

          Focus on:
          1. Security issues (SQL injection, XSS, secrets)
          2. Code style violations
          3. Missing tests for new functions
          4. Performance concerns

          Output as markdown with sections:
          - 🔴 Critical Issues (blocking)
          - 🟡 Warnings (should fix)
          - 🟢 Good Practices (praise)

          Be concise and actionable." --output-format text)

          echo "review<<EOF" >> $GITHUB_OUTPUT
          echo "$REVIEW" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Check for Critical Issues
        run: |
          if echo "${{ steps.review.outputs.review }}" | grep -q "🔴 Critical"; then
            echo "::error::Critical issues found in PR"
            exit 1
          fi

      - name: Comment on PR
        uses: actions/github-script@v7
        if: always()
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Claude Code Review\n\n${{ steps.review.outputs.review }}\n\n---\n*Review by Claude Code - [Configure](.github/workflows/claude-review.yml)*`
            })
```

## Advanced: Block PR on Critical Issues

```yaml
- name: Security Scan
  id: security
  run: |
    SCAN=$(claude -p "Run security audit. Output JSON: {\"status\": \"pass|fail\", \"critical\": [], \"high\": []}" --output-format json)
    echo "scan=$SCAN" >> $GITHUB_OUTPUT

- name: Block if Critical
  run: |
    STATUS=$(echo '${{ steps.security.outputs.scan }}' | jq -r '.status')
    if [ "$STATUS" = "fail" ]; then
      echo "::error::Critical security issues found"
      CRITICAL=$(echo '${{ steps.security.outputs.scan }}' | jq -r '.critical[]')
      echo "Issues: $CRITICAL"
      exit 1
    fi
```

## Husky Pre-commit Hook

Install Husky:
```bash
npm install --save-dev husky
npx husky install
```

Create `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running Claude Code pre-commit checks..."

# Quick security check on staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts)$')

if [ -n "$STAGED_FILES" ]; then
  claude -p "Review these staged files for critical security issues only: $STAGED_FILES. Output: PASS or FAIL with reason." > /tmp/claude-check.txt

  if grep -q "FAIL" /tmp/claude-check.txt; then
    cat /tmp/claude-check.txt
    echo "\n❌ Pre-commit check failed. Fix critical issues before committing."
    exit 1
  fi

  echo "✅ Pre-commit check passed"
fi
```

Make executable:
```bash
chmod +x .husky/pre-commit
```

## Automated Translation Workflow

`.github/workflows/auto-translate.yml`:

```yaml
name: Auto-translate Locale Strings

on:
  push:
    paths:
      - 'src/locales/en.json'
    branches:
      - main

jobs:
  translate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Claude Code
        run: |
          curl -fsSL https://claude.ai/install.sh | bash
          echo "$HOME/.claude/bin" >> $GITHUB_PATH

      - name: Authenticate
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude config set apiKey $ANTHROPIC_API_KEY

      - name: Translate New Strings
        run: |
          claude -p "Compare src/locales/en.json with es.json, fr.json, de.json.

          For any keys in en.json missing in other files:
          1. Translate the English string accurately
          2. Add to the respective locale file
          3. Preserve JSON structure and formatting
          4. Maintain alphabetical key order

          After updating, verify JSON is valid."

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: "chore(i18n): auto-translate new locale strings"
          title: "🌍 Auto-translated new strings from en.json"
          body: |
            ## Changes

            Automatically translated new strings from `en.json` to:
            - Spanish (es.json)
            - French (fr.json)
            - German (de.json)

            ## Review Needed

            - [ ] Verify translations are accurate
            - [ ] Check for context-specific meanings
            - [ ] Confirm formatting is correct

            🤖 Generated by Claude Code
          branch: auto-translate-${{ github.sha }}
          labels: i18n, automated
```

## Log Monitoring Script

`scripts/monitor-logs.sh`:

```bash
#!/bin/bash

# Monitor application logs for anomalies
echo "Starting log monitoring with Claude Code..."

tail -f logs/app.log | while read line; do
  # Accumulate lines
  echo "$line" >> /tmp/claude-log-buffer.txt

  # Every 10 lines, analyze
  if [ $(wc -l < /tmp/claude-log-buffer.txt) -ge 10 ]; then
    ANALYSIS=$(claude -p "Analyze these log lines for:
    - Errors (repeated, unusual)
    - Performance (slow queries, high latency)
    - Security (auth failures, suspicious IPs)
    - Anomalies

    Output ONLY if issue detected: ALERT: [description]" < /tmp/claude-log-buffer.txt)

    if echo "$ANALYSIS" | grep -q "ALERT"; then
      echo "🚨 $ANALYSIS"
      # Optional: Send to Slack/PagerDuty
      # curl -X POST $SLACK_WEBHOOK -d "{\"text\": \"$ANALYSIS\"}"
    fi

    # Clear buffer
    > /tmp/claude-log-buffer.txt
  fi
done
```

Make executable and run:
```bash
chmod +x scripts/monitor-logs.sh
./scripts/monitor-logs.sh
```

## Cost Management in CI/CD

### Limit Thinking Budget

```bash
export MAX_THINKING_TOKENS=5000
claude -p "quick review"
```

### Use Haiku for Simple Checks

```yaml
- name: Quick Style Check
  run: |
    claude --model haiku -p "Check code style only. Be brief."
```

### Cache Common Prompts

```yaml
- name: Cache Claude Responses
  uses: actions/cache@v3
  with:
    path: .claude-cache
    key: claude-${{ hashFiles('**/*.js') }}
```

## Success Criteria

✅ Pre-commit script blocks commits with critical issues
✅ GitHub Actions review PRs automatically
✅ Critical security issues block PR merge
✅ Translation workflow creates PRs for new strings
✅ Log monitoring detects and alerts on anomalies
✅ Cost optimized (Haiku for simple tasks, thinking limits)

## Testing

### Test Pre-commit Hook

```bash
# Add vulnerable code
echo "const password = 'hardcoded123';" >> src/config.js
git add src/config.js

# Try to commit (should fail)
npm run pre-commit
# Should output: FAIL - Hardcoded secret detected

# Fix and retry
git reset HEAD src/config.js
```

### Test GitHub Actions Locally

Use [act](https://github.com/nektos/act):
```bash
# Install act
brew install act

# Run workflow locally
act pull_request -s ANTHROPIC_API_KEY=your-key
```

## Troubleshooting

**Problem**: API rate limits in CI
**Solution**: Use caching, limit thinking tokens, use Haiku

**Problem**: CI runs too long
**Solution**: Run Claude checks only on changed files, not entire codebase

**Problem**: False positives blocking commits
**Solution**: Refine prompts to only flag critical issues, allow warnings

**Problem**: Cost too high
**Solution**:
- Use Haiku for simple checks
- Cache results based on file hashes
- Only run full review on main PRs, not drafts
