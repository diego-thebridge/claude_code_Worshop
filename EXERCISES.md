# Ejercicios Prácticos - Claude Code Workshop

Este documento contiene 5 ejercicios prácticos diseñados para dominar las capacidades avanzadas de Claude Code.

**Tiempo total estimado**: 45-55 minutos
**Prerequisitos**: Haber completado el setup en README.md

## 📋 Índice de Ejercicios

1. [Ejercicio 1: Plan Mode Challenge](#ejercicio-1-plan-mode-challenge) (10 min)
2. [Ejercicio 2: MCP Integration](#ejercicio-2-mcp-integration) (10 min)
3. [Ejercicio 3: Custom Security Agent](#ejercicio-3-custom-security-agent) (10 min)
4. [Ejercicio 4: Team Code Review Skill](#ejercicio-4-team-code-review-skill) (8 min)
5. [Ejercicio 5: CI/CD Automation](#ejercicio-5-cicd-automation) (5-7 min)

---

## Ejercicio 1: Plan Mode Challenge

**Tiempo**: 10 minutos
**Dificultad**: ⭐⭐⭐
**Objetivo**: Dominar el workflow de exploración-plan-implementación usando Plan Mode

### Contexto

El proyecto `ecommerce-api` actualmente usa JWT básico para autenticación. Esto tiene varias limitaciones:
- No hay refresh tokens
- Los tokens nunca expiran (o expiración muy larga)
- No hay logout efectivo (el token sigue siendo válido)
- No es compatible con OAuth2 flows

Tu tarea es usar Plan Mode para analizar la situación actual y crear un plan detallado para migrar a OAuth2.

### Instrucciones Paso a Paso

#### Paso 1: Iniciar Claude Code en Plan Mode

Navega al directorio del proyecto:
```bash
cd ecommerce-api
```

Inicia Claude Code en Plan Mode:
```bash
claude --permission-mode plan
```

O si ya estás en una sesión, presiona `Shift+Tab` hasta ver `⏸ plan mode on`.

#### Paso 2: Solicitar Análisis

Escribe el siguiente prompt:
```
Analyze the current authentication system in this codebase. I need to migrate from JWT to OAuth2.

Please:
1. Identify all files related to authentication
2. Document the current authentication flow
3. List security issues with the current approach
4. Create a detailed migration plan to OAuth2 with authorization code flow
5. Consider backward compatibility for existing users
```

#### Paso 3: Observar el Proceso de Claude

Claude debería:
1. Explorar archivos relevantes (`src/controllers/auth.controller.js`, `src/middleware/auth.middleware.js`, etc.)
2. Leer el código actual
3. Posiblemente hacer preguntas de clarificación (responde según tu caso de uso)
4. Generar un plan detallado

#### Paso 4: Refinar el Plan

Si el plan no es suficientemente específico, haz preguntas de follow-up:
```
> What about database schema changes? Will we need new tables?
> How should we handle the migration of existing JWT tokens?
> Should we support both JWT and OAuth2 during a transition period?
```

#### Paso 5: Revisar y Aprobar (NO ejecutar aún)

El objetivo de este ejercicio es llegar a un **plan aprobado**, NO ejecutarlo. Revisa el plan y asegúrate de que incluye:

### Criterios de Éxito

Tu plan debe incluir:

- [ ] **Lista completa de archivos** a modificar (mínimo 5-7 archivos)
- [ ] **Flujo de OAuth2** descrito claramente (authorization code flow)
- [ ] **Cambios en la base de datos** (nuevas tablas para refresh tokens, clients, etc.)
- [ ] **Estrategia de migración** para usuarios existentes
- [ ] **Testing approach** (qué tests agregar/modificar)
- [ ] **Backward compatibility** considerada (período de transición)
- [ ] **Security considerations** (token storage, rotation, revocation)

### Resultado Esperado

Al finalizar este ejercicio, deberías tener un documento/plan que podría usar cualquier developer del equipo para implementar la migración. El plan debe ser lo suficientemente detallado que no queden ambigüedades grandes.

**Comparar con solución**: Ver `solutions/exercise-1-plan.md`

### Tips y Trucos

- **Preguntas específicas funcionan mejor**: En lugar de "create a plan", especifica exactamente qué necesitas
- **Iteración es clave**: No esperes el plan perfecto en el primer intento
- **Usa follow-ups**: "What about X?" es tu mejor amigo
- **Context awareness**: Claude puede ver todo el codebase, aprovéchalo

### Troubleshooting

**Problema**: Claude empieza a hacer modificaciones en vez de solo planear
**Solución**: Asegúrate de estar en Plan Mode (`⏸` visible). Si no, presiona `Shift+Tab`.

**Problema**: El plan es muy genérico o superficial
**Solución**: Pide más detalles: "Can you expand on step 3 with specific code examples?" o "Which exact files need to be modified?"

**Problema**: Claude no encuentra los archivos de autenticación
**Solución**: Dale una pista: "Check src/controllers/auth.controller.js and src/middleware/auth.middleware.js"

---

## Ejercicio 2: MCP Integration

**Tiempo**: 10 minutos
**Dificultad**: ⭐⭐⭐⭐
**Objetivo**: Conectar Claude Code con external tools usando MCP servers

### Contexto

Necesitas generar un reporte de productos con problemas de inventario. El reporte debe:
1. Consultar la base de datos PostgreSQL para encontrar productos con stock bajo (<5 unidades)
2. Crear un GitHub issue con la lista de estos productos
3. Agregar labels "inventory" y "urgent" al issue

### Prerequisitos

- Base de datos PostgreSQL corriendo (Docker Compose)
- GitHub personal access token con scope `repo`

### Instrucciones Paso a Paso

#### Paso 1: Configurar MCP Server para PostgreSQL

Primero, configura el MCP server para tu base de datos:

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://admin:password123@localhost:5432/ecommerce"
```

**Verificar la conexión**:
```bash
claude
> /mcp
```

Deberías ver el server "db" listado. Selecciónalo y verifica que se conecta correctamente.

#### Paso 2: Configurar MCP Server para GitHub

Agrega el GitHub MCP server:

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

**Autenticar** (si es necesario):
```bash
claude
> /mcp
# Selecciona "github" y sigue el flow de autenticación
```

#### Paso 3: Verificar Ambos Servers

Lista los MCP servers configurados:
```bash
claude mcp list
```

Deberías ver:
```
db (stdio) - Connected
github (http) - Connected
```

#### Paso 4: Ejecutar la Tarea Integrativa

Inicia Claude Code (modo normal, NO plan mode):
```bash
cd ecommerce-api
claude
```

Escribe el prompt:
```
Using the MCP servers:

1. Query the database to find all products where stock < 5
2. Create a detailed report with: product ID, name, current stock, price
3. Create a GitHub issue in this repository titled "Low Inventory Alert - [Date]"
4. In the issue body, include:
   - Summary of how many products are affected
   - Table with product details
   - Suggested action items
5. Add labels "inventory" and "urgent" to the issue

After creating the issue, share the URL with me.
```

#### Paso 5: Observar el Workflow Multi-MCP

Claude debería:
1. Conectarse al database MCP server
2. Ejecutar la query SQL
3. Procesar los resultados
4. Conectarse al GitHub MCP server
5. Crear el issue con el formato especificado
6. Agregar los labels
7. Devolverte el URL del issue creado

### Criterios de Éxito

- [ ] **Database query ejecutada** correctamente con resultados precisos
- [ ] **GitHub issue creado** con título apropiado
- [ ] **Issue body contiene**:
  - [ ] Summary count de productos afectados
  - [ ] Tabla markdown con product details (ID, name, stock, price)
  - [ ] Action items sugeridos
- [ ] **Labels aplicados**: "inventory" y "urgent"
- [ ] **URL compartido** para verificar el issue

### Resultado Esperado

Deberías poder abrir el URL del GitHub issue y ver un reporte profesional y bien formateado con toda la información de inventario.

**Comparar con solución**: Ver `solutions/exercise-2-mcp.sh` para scripts de setup

### Variaciones (Si terminas rápido)

**Variación A**: Agrega Slack notification
```bash
claude mcp add --transport http slack https://mcp.slack.com/
```

Luego:
```
Additionally, send a Slack message to #inventory-alerts channel with a summary
```

**Variación B**: Automated re-stocking
```
For products with stock < 5, also:
1. Check if there are pending orders (orders table)
2. Suggest automatic re-stock quantity based on average sales (last 30 days)
3. Update the GitHub issue with re-stock recommendations
```

### Tips y Trucos

- **@ mentions**: Puedes referenciar recursos MCP: `@db:table://products`
- **Error handling**: Si un MCP server falla, Claude debería informarte claramente
- **Permissions**: Algunos MCP servers requieren authentication - usa `/mcp` para verificar
- **Debugging**: Si algo falla, pide a Claude que muestre las queries exactas que está ejecutando

### Troubleshooting

**Problema**: "Cannot connect to database"
**Solución**:
```bash
# Verifica que Docker está corriendo
docker ps | grep postgres

# Si no está, inicia:
cd ecommerce-api
docker-compose up -d
```

**Problema**: "GitHub authentication failed"
**Solución**:
```bash
# Verifica tu token
echo $GITHUB_TOKEN

# Re-configura el MCP server con header
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer $GITHUB_TOKEN"
```

**Problema**: Claude crea el issue pero no agrega labels
**Solución**: Explícitamente menciona: "IMPORTANT: After creating the issue, add the labels in a separate API call"

---

## Ejercicio 3: Custom Security Agent

**Tiempo**: 10 minutos
**Dificultad**: ⭐⭐⭐⭐
**Objetivo**: Crear un custom agent especializado en security auditing

### Contexto

El proyecto `ecommerce-api` tiene varios security issues intencionales (ver PROJECT.md). Tu tarea es crear un custom agent que automáticamente detecte estos problemas siguiendo OWASP Top 10.

### Instrucciones Paso a Paso

#### Paso 1: Crear la Estructura del Agent

```bash
mkdir -p .claude/agents
touch .claude/agents/security-auditor.md
```

#### Paso 2: Definir el Agent Configuration

Abre `.claude/agents/security-auditor.md` y agrega el frontmatter:

```yaml
---
name: security-auditor
description: Security audit specialist for OWASP Top 10 vulnerabilities. Use proactively after code changes touching auth, payments, or user data.
tools: Read, Grep, Glob, Bash
model: opus
permissionMode: plan
---

[System prompt va aquí]
```

#### Paso 3: Escribir el System Prompt

Después del frontmatter, escribe las instrucciones del agent:

```markdown
You are a senior security auditor specializing in web application security and the OWASP Top 10.

## Your Mission

Analyze the codebase for security vulnerabilities and provide actionable, specific findings.

## Audit Checklist

Scan for the following vulnerabilities:

### 1. Injection (SQL, NoSQL, Command)
- Raw SQL queries with string concatenation
- Unparameterized database queries
- Command execution with user input
- Template injection

### 2. Broken Authentication
- Weak password policies
- JWT without expiration
- Missing refresh token rotation
- Session fixation vulnerabilities

### 3. Sensitive Data Exposure
- Hardcoded secrets (API keys, passwords, tokens)
- Credentials in environment files committed to git
- Unencrypted sensitive data in database
- Missing HTTPS enforcement

### 4. XML External Entities (XXE)
- XML parsing without disabling external entities
- File upload without validation

### 5. Broken Access Control
- Missing authorization checks
- Insecure direct object references (IDOR)
- Path traversal vulnerabilities
- CORS misconfiguration

### 6. Security Misconfiguration
- Default credentials
- Unnecessary features enabled
- Missing security headers
- Verbose error messages revealing internals

### 7. Cross-Site Scripting (XSS)
- Unescaped user input in templates
- innerHTML usage with user data
- Missing Content Security Policy

### 8. Insecure Deserialization
- Unvalidated deserialization
- Pickle/marshal usage with untrusted data

### 9. Using Components with Known Vulnerabilities
- Outdated dependencies
- Unpatched libraries

### 10. Insufficient Logging & Monitoring
- Missing audit logs for sensitive operations
- No rate limiting
- Lack of intrusion detection

## Output Format

Report findings organized by severity:

### Critical (Immediate fix required)
- **[Vulnerability Type]**: Description
  - **File**: `path/to/file.js:line`
  - **Issue**: What's wrong
  - **Impact**: What could happen
  - **Fix**: How to remediate

### High (Fix soon)
[Same format]

### Medium (Should fix)
[Same format]

### Low (Consider improving)
[Same format]

## Analysis Rules

1. **Be specific**: Always include file path and line number
2. **Show the code**: Quote the vulnerable code snippet
3. **Explain impact**: Describe the real-world attack scenario
4. **Provide fixes**: Give concrete code examples of how to fix
5. **Prioritize correctly**: Critical = exploitable now, High = soon, Medium = defense-in-depth, Low = hardening

## Example Finding

### Critical
- **SQL Injection**: Raw string concatenation in database query
  - **File**: `src/services/products.service.js:45`
  - **Code**:
    ```javascript
    const sql = `SELECT * FROM products WHERE name LIKE '%${query}%'`;
    ```
  - **Impact**: Attacker can execute arbitrary SQL, dump entire database, or modify data
  - **Fix**: Use parameterized queries:
    ```javascript
    const results = await db.query(
      'SELECT * FROM products WHERE name LIKE $1',
      [`%${query}%`]
    );
    ```

Start your audit now. Be thorough but focus on exploitable vulnerabilities first.
```

#### Paso 4: Usar el Agent

Inicia Claude Code:
```bash
cd ecommerce-api
claude
```

Invoca el agent:
```
> Use the security-auditor agent to analyze this codebase for vulnerabilities
```

O, ya que el agent tiene `description` que matches "security" tasks:
```
> Perform a security audit of this codebase focusing on OWASP Top 10
```

Claude debería automáticamente invocar tu custom agent.

#### Paso 5: Revisar los Findings

El agent debería identificar al menos estos problemas intencionales:

1. **SQL Injection** en `src/services/products.service.js:45`
2. **Exposed Secrets** en `.env` file
3. **Missing Input Validation** en `src/controllers/users.controller.js:78`
4. **Broken Access Control** en `src/middleware/auth.middleware.js:34`
5. **No Rate Limiting** en todos los endpoints
6. **Missing Inventory Checks** en `src/services/orders.service.js:56`

### Criterios de Éxito

- [ ] **Agent creado** con configuration válida
- [ ] **Frontmatter correcto**: name, description, tools, model, permissionMode
- [ ] **System prompt completo** con OWASP Top 10 checklist
- [ ] **Agent se invoca** exitosamente cuando usas prompts relacionados con security
- [ ] **Findings reportados** con:
  - [ ] Severity levels (Critical, High, Medium, Low)
  - [ ] File paths y line numbers específicos
  - [ ] Code snippets del problema
  - [ ] Impact explanation
  - [ ] Fix recommendations con código
- [ ] **Mínimo 4 de los 6 problemas intencionales** detectados

### Resultado Esperado

Un reporte de security audit estructurado, profesional, y actionable que cualquier developer podría usar para fix vulnerabilities.

**Comparar con solución**: Ver `solutions/exercise-3-agent.md`

### Variaciones (Si terminas rápido)

**Variación A**: Agent que auto-fixa issues
Cambia `permissionMode: plan` a `permissionMode: acceptEdits` y agrega Write, Edit a tools. Luego:
```
> Use security-auditor to find and fix critical vulnerabilities automatically
```

**Variación B**: Agent con custom rules
Agrega sección en el system prompt:
```markdown
## Custom Security Rules for This Project

1. All API endpoints must have rate limiting (max 100 req/min)
2. All user inputs must be validated with Joi schemas
3. All database queries must use Prisma ORM (no raw SQL)
4. All passwords must be hashed with bcrypt (min 12 rounds)
```

### Tips y Trucos

- **Permission mode**: `plan` hace que el agent sea read-only (seguro para auditing)
- **Tools restriction**: Solo dar las tools mínimas necesarias
- **Model selection**: `opus` para análisis complejos, `haiku` para quick scans
- **Description matters**: Es lo que Claude usa para decidir cuándo invocar el agent
- **Test iteratively**: Prueba el agent varias veces y refina el system prompt

### Troubleshooting

**Problema**: Agent no se invoca automáticamente
**Solución**: Verifica el `description` field. Debe incluir keywords relacionados con tu prompt. O invoca explícitamente: "Use the security-auditor agent..."

**Problema**: Agent no encuentra los vulnerabilities
**Solución**: Agrega hints en el prompt: "Check src/services/products.service.js for SQL injection patterns"

**Problema**: Agent intenta modificar archivos en plan mode
**Solución**: Verifica que `permissionMode: plan` está en el frontmatter y que Write/Edit NO están en tools list

---

## Ejercicio 4: Team Code Review Skill

**Tiempo**: 8 minutos
**Dificultad**: ⭐⭐⭐
**Objetivo**: Crear un skill que encapsule los code review standards del equipo

### Contexto

Tu equipo tiene standards específicos para code reviews. Quieres crear un skill que automáticamente revise código según estos standards y se invoque cuando alguien pide un code review.

### Standards del Equipo (Para este ejercicio)

**Style Guide**:
- Functional components only (no class components in React-style code)
- Prefer `const` over `let`
- Max function length: 50 lines
- Max file length: 300 lines
- Consistent naming: camelCase for variables/functions, PascalCase for classes

**Security**:
- No hardcoded secrets
- All user input must be validated
- SQL queries must be parameterized
- CORS properly configured

**Testing**:
- Minimum 80% code coverage
- Unit tests for all business logic
- Integration tests for all API endpoints
- Tests for edge cases and error handling

**Documentation**:
- JSDoc comments for all exported functions
- README in each module directory
- API documentation for all endpoints

### Instrucciones Paso a Paso

#### Paso 1: Crear la Estructura del Skill

```bash
mkdir -p .claude/skills/code-review
touch .claude/skills/code-review/SKILL.md
```

#### Paso 2: Definir el Skill Configuration

Abre `.claude/skills/code-review/SKILL.md`:

```yaml
---
name: code-review
description: Review code using team standards. Use when reviewing PRs, code changes, or when user asks for code review.
allowed-tools: Read, Grep, Glob
model: inherit
---

You are a senior code reviewer ensuring high standards across the codebase.

## Team Standards

### Style Guide
- **Functions**: Max 50 lines, clear single responsibility
- **Files**: Max 300 lines, split if larger
- **Naming**:
  - camelCase for variables and functions
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants
- **Syntax**:
  - Prefer `const` over `let`
  - No `var` declarations
  - Use arrow functions for callbacks
  - Template literals over string concatenation

### Security Requirements
- ❌ No hardcoded secrets (API keys, passwords, tokens)
- ✅ All user input validated before use
- ✅ Database queries parameterized (no string concat)
- ✅ Proper error handling (don't expose internals)
- ✅ Authentication checks on protected routes
- ✅ CORS configured with explicit origins

### Testing Requirements
- Minimum 80% code coverage for new code
- Unit tests for business logic functions
- Integration tests for API endpoints
- Edge case testing (null, undefined, empty, invalid inputs)
- Error path testing (what happens when things fail)

### Documentation Requirements
- JSDoc for all exported functions with @param and @returns
- README.md in each module explaining purpose
- API endpoints documented (request/response examples)
- Complex logic has inline comments explaining "why"

## Review Process

1. **Read relevant files**: Focus on changed files if this is a PR review
2. **Check each standard category**: Style, Security, Testing, Documentation
3. **Note specific issues**: File path, line number, what's wrong
4. **Suggest fixes**: Provide code examples when possible
5. **Highlight good practices**: Positive feedback for well-written code

## Output Format

Structure your review as:

### ✅ Passes
- [List things that meet standards well]
- [Compliment good practices]

### ⚠️ Warnings (Should Fix)
- **[Category - File:Line]**: Issue description
  - Current code: `code snippet`
  - Suggestion: `improved code` or explanation
  - Priority: Medium

### ❌ Must Fix (Blocking Issues)
- **[Category - File:Line]**: Issue description
  - Current code: `code snippet`
  - Fix: `corrected code` or clear instructions
  - Priority: High/Critical

### 📊 Summary
- **Total issues**: X warnings, Y must-fix
- **Test coverage**: X% (target: 80%+)
- **Recommendation**: Approve / Request Changes / Needs Discussion

## Examples

### Good Finding
❌ **Security - auth.controller.js:45**: Hardcoded JWT secret
- Current: `const secret = "my-secret-key-123"`
- Fix: `const secret = process.env.JWT_SECRET`
- Priority: Critical

⚠️ **Style - users.service.js:120**: Function too long (75 lines)
- Suggestion: Extract validation logic into separate function
- Priority: Medium

✅ **Good Practice**: Comprehensive error handling in `products.controller.js`

Be thorough, specific, and constructive in your feedback.
```

#### Paso 3: Probar el Skill

Inicia Claude Code:
```bash
cd ecommerce-api
claude
```

Invoca el skill implícitamente:
```
> Review the authentication code for our team standards
```

O explícitamente:
```
> Use the code-review skill to analyze src/controllers/auth.controller.js
```

#### Paso 4: Verificar el Output

El skill debería revisar el código y dar feedback estructurado según el formato definido.

### Criterios de Éxito

- [ ] **Skill creado** con configuration válida
- [ ] **Frontmatter completo**: name, description, allowed-tools
- [ ] **Standards documentados** claramente (Style, Security, Testing, Docs)
- [ ] **Review process** defined
- [ ] **Output format** estructurado (Passes, Warnings, Must Fix, Summary)
- [ ] **Skill se invoca** cuando mencionas "code review" o similar
- [ ] **Review output incluye**:
  - [ ] Categorización por severity
  - [ ] File paths y line numbers
  - [ ] Code snippets del problema
  - [ ] Sugerencias de fix concretas
  - [ ] Summary con statistics

### Resultado Esperado

Un code review automático que se siente como feedback de un senior developer del equipo.

**Comparar con solución**: Ver `solutions/exercise-4-skill.md`

### Variaciones (Si terminas rápido)

**Variación A**: Progressive disclosure
Crea archivos adicionales:
```
.claude/skills/code-review/
├── SKILL.md           # Overview
├── STYLE_GUIDE.md     # Detailed style guide
├── SECURITY.md        # Security checklist
└── examples/          # Good/bad examples
    ├── good-auth.js
    └── bad-auth.js
```

En SKILL.md, referencia estos archivos: "For detailed style guide, see STYLE_GUIDE.md"

**Variación B**: Team-specific rules
Agrega sección custom para tu tech stack:
```markdown
## Express.js Specific Rules
- Always use async/await (no callbacks)
- Error middleware at the end of middleware chain
- Input validation middleware before controllers
- Use helmet for security headers
```

**Variación C**: Auto-fix skill
Cambia allowed-tools a include Write, Edit:
```yaml
allowed-tools: Read, Grep, Glob, Write, Edit
```

Luego agrega al system prompt:
```markdown
After identifying issues, ask user: "Should I fix these automatically?"
If yes, make the changes and explain what you fixed.
```

### Tips y Trucos

- **Specificity**: Cuanto más específicos los standards, mejor el review
- **Examples**: Incluir good/bad code examples ayuda mucho
- **Tool restrictions**: allowed-tools hace el skill read-only (seguro)
- **Auto-invocation**: El description field debe incluir keywords que matches common prompts
- **Iteration**: Refina el skill basándote en feedback real de reviews

### Troubleshooting

**Problema**: Skill da feedback muy genérico
**Solución**: Agrega más ejemplos específicos y patterns a detectar en el system prompt

**Problema**: Skill no encuentra issues que existen
**Solución**: Asegúrate que allowed-tools incluye Grep (para buscar patterns) y Read (para examinar archivos)

**Problema**: Skill se invoca cuando no debería
**Solución**: Haz el description más específico. En lugar de "Review code", usa "Review code using team standards when explicitly requested"

---

## Ejercicio 5: CI/CD Automation (Bonus)

**Tiempo**: 5-7 minutos
**Dificultad**: ⭐⭐
**Objetivo**: Automatizar code reviews y checks en CI/CD pipeline

### Contexto

Quieres integrar Claude Code en tu CI/CD pipeline para automation tasks como:
- Pre-commit hooks para catch issues early
- PR reviews automáticas
- Translation de strings nuevos

### Instrucciones Paso a Paso

#### Paso 1: Pre-commit Hook (npm script)

Edita `ecommerce-api/package.json` y agrega:

```json
{
  "scripts": {
    "pre-commit": "claude -p 'Review staged changes for security issues and code style. Be concise and focus on critical issues only.'",
    "pre-push": "claude -p 'Run all tests and verify they pass. If any fail, block the push and explain what failed.'",
    "lint:claude": "claude -p 'Analyze the codebase for code style issues following .eslintrc rules. Output as JSON for parsing.'"
  }
}
```

**Probar**:
```bash
# Stage some changes
git add src/controllers/auth.controller.js

# Run pre-commit check
npm run pre-commit
```

#### Paso 2: GitHub Actions PR Review

Crea `.github/workflows/claude-review.yml`:

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for diff

      - name: Setup Claude Code
        run: |
          curl -fsSL https://claude.ai/install.sh | bash
          echo "$HOME/.claude/bin" >> $GITHUB_PATH

      - name: Authenticate Claude
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude config set apiKey $ANTHROPIC_API_KEY

      - name: Review PR
        id: review
        run: |
          REVIEW=$(claude -p "Review the changes in this PR vs the base branch. Focus on:
          1. Security issues
          2. Code style violations
          3. Missing tests
          4. Performance concerns

          Output as markdown for GitHub comment." --output-format text)

          echo "review<<EOF" >> $GITHUB_OUTPUT
          echo "$REVIEW" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## Claude Code Review\n\n${{ steps.review.outputs.review }}'
            })
```

#### Paso 3: Automated Translation Script

Crea `scripts/auto-translate.sh`:

```bash
#!/bin/bash

# Find new strings in English locale that don't exist in other locales
claude -p "
Compare src/locales/en.json with:
- src/locales/es.json
- src/locales/fr.json
- src/locales/de.json

For any keys that exist in en.json but not in other files:
1. Translate the string appropriately
2. Add it to the respective locale file
3. Maintain the JSON structure
4. Commit the changes with message 'chore: auto-translate missing locale strings'

Be careful to preserve existing keys and formatting.
"
```

Hacer el script ejecutable:
```bash
chmod +x scripts/auto-translate.sh
```

#### Paso 4: Log Monitoring Script

Crea `scripts/monitor-logs.sh`:

```bash
#!/bin/bash

# Monitor application logs for anomalies
tail -f logs/app.log | claude -p "
Monitor this log stream for:
- Error patterns (repeated errors, unusual errors)
- Performance issues (slow response times)
- Security concerns (failed auth attempts, suspicious IPs)
- Anomalies (unusual traffic patterns)

When you detect an issue:
1. Alert me with a summary
2. Suggest investigation steps
3. Recommend remediation

Be vigilant but avoid false positives on normal operations.
"
```

#### Paso 5: Probar las Automations

**Pre-commit**:
```bash
# Make a change with intentional issues
echo "const password = '12345';" >> src/config/secrets.js
git add src/config/secrets.js
npm run pre-commit
```

**Translation** (si tienes locale files):
```bash
./scripts/auto-translate.sh
```

**Log monitoring** (simulado):
```bash
# En una terminal
cd ecommerce-api
npm run dev

# En otra terminal
./scripts/monitor-logs.sh
```

### Criterios de Éxito

- [ ] **npm scripts agregados** para pre-commit, pre-push, lint
- [ ] **GitHub Actions workflow** creado para PR reviews
- [ ] **Scripts de automation** creados y executable
- [ ] **Al menos 1 script probado** exitosamente
- [ ] **Documentation** de cómo usar cada automation

### Resultado Esperado

Automation pipeline que integra Claude Code en tu development workflow, catching issues early y automatizando tareas repetitivas.

**Comparar con solución**: Ver `solutions/exercise-5-ci.md`

### Variaciones (Si terminas rápido)

**Variación A**: Husky integration
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run pre-commit"
```

**Variación B**: Release notes generator
```bash
claude -p "Generate release notes for version $(cat package.json | grep version | cut -d '"' -f 4) based on git commits since last tag. Format as markdown with categories: Features, Bug Fixes, Performance, Breaking Changes."
```

**Variación C**: Dependency audit
```json
{
  "scripts": {
    "audit:claude": "npm audit --json | claude -p 'Analyze this npm audit output. Prioritize vulnerabilities by severity and impact. Suggest which ones to fix immediately vs can wait.'"
  }
}
```

### Tips y Trucos

- **Unix philosophy**: Claude Code se integra bien con pipes (`|`)
- **Output formats**: Usa `--output-format json` para parseable output
- **API keys**: En CI, usa secrets/environment variables
- **Cost management**: Set thinking budget en CI: `export MAX_THINKING_TOKENS=5000`
- **Error handling**: Wrap Claude commands en scripts con proper error handling

### Troubleshooting

**Problema**: API key not found en CI
**Solución**: Asegúrate que el secret ANTHROPIC_API_KEY está configurado en GitHub repo settings

**Problema**: Command hangs en CI
**Solución**: Agrega timeout: `timeout 300 claude -p "..."`

**Problema**: Output muy verbose para CI logs
**Solución**: Usa `--output-format json` y parse solo lo necesario

---

## 🎉 ¡Completaste todos los ejercicios!

### Próximos Pasos

1. **Revisar soluciones**: Compara tus implementaciones con las soluciones en `solutions/`
2. **Profundizar**: Lee las guías en `guides/` para best practices
3. **Experimentar**: Modifica los agents/skills para tus necesidades específicas
4. **Integrar**: Implementa estas técnicas en tus proyectos reales

### Recursos Adicionales

- [Claude Code Documentation](https://code.claude.com/docs/)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
- [Community Examples](https://github.com/anthropics/claude-code-examples)

### Feedback

¿Cómo fue tu experiencia con estos ejercicios?
- ¿Qué ejercicio fue más útil?
- ¿Qué fue más desafiante?
- ¿Qué te gustaría ver en futuros workshops?

[Link a formulario de feedback]

---

**¡Gracias por participar en el Claude Code Workshop!** 🚀
