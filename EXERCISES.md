# Ejercicios Prácticos - Claude Code Workshop

Este documento contiene 5 ejercicios prácticos diseñados para dominar las capacidades avanzadas de Claude Code.

**Tiempo total estimado**: 45-55 minutos
**Prerequisitos**: Haber completado el setup en README.md

## Índice de Ejercicios

1. [Ejercicio 1: Plan Mode Challenge](#ejercicio-1-plan-mode-challenge) (10 min)
2. [Ejercicio 2: CLI Power Tools](#ejercicio-2-cli-power-tools) (10 min)
3. [Ejercicio 3: Custom Security Agent](#ejercicio-3-custom-security-agent) (10 min)
4. [Ejercicio 4: Team Code Review Skill](#ejercicio-4-team-code-review-skill) (8 min)
5. [Ejercicio 5: Automation con Hooks y Scripts](#ejercicio-5-automation-con-hooks-y-scripts) (7 min)

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

## Ejercicio 2: CLI Power Tools

**Tiempo**: 10 minutos
**Dificultad**: ⭐⭐⭐
**Objetivo**: Dominar `claude -p`, pipes, output formats y slash commands para automatización

### Contexto

Claude Code no es solo una herramienta interactiva — su CLI es extremadamente poderosa para automatización. En este ejercicio vas a usar `claude -p` (prompt directo), pipes de Unix, y diferentes output formats para crear workflows de análisis automatizados sin necesidad de configurar servicios externos.

### Instrucciones Paso a Paso

#### Paso 1: Análisis rápido con `claude -p`

Desde el directorio `ecommerce-api`, ejecuta un análisis directo sin entrar al modo interactivo:

```bash
cd ecommerce-api
claude -p "List all API endpoints in this project with their HTTP methods and file locations. Output as a markdown table."
```

Observa cómo Claude analiza el codebase y responde directamente en tu terminal.

#### Paso 2: Usar output formats

Ahora prueba diferentes formatos de salida:

```bash
# Output como JSON (útil para parsear programáticamente)
claude -p "Find all TODO and FIXME comments in the codebase. Return as JSON with fields: file, line, comment" --output-format json

# Output como texto plano (útil para pipes)
claude -p "Summarize the security issues in this codebase in 3 bullet points" --output-format text
```

#### Paso 3: Combinar con pipes de Unix

Usa pipes para crear workflows más potentes:

```bash
# Analizar solo los archivos modificados en git
git diff --name-only HEAD~3 | claude -p "Review these changed files for potential bugs or security issues. Be concise."

# Analizar el output de tests
npm test 2>&1 | claude -p "Analyze these test results. List which tests failed and suggest fixes."

# Revisar dependencias
cat package.json | claude -p "Review these dependencies. Flag any that are commonly known to have security issues or are deprecated."
```

#### Paso 4: Batch processing con scripts

Crea un mini-script que combine varias operaciones CLI:

```bash
# Crear un reporte de calidad del código
echo "=== Code Quality Report ===" > /tmp/quality-report.md
echo "Generated: $(date)" >> /tmp/quality-report.md
echo "" >> /tmp/quality-report.md

# Análisis de seguridad
claude -p "Scan src/ for hardcoded secrets, SQL injection, and missing input validation. List findings with file:line format." --output-format text >> /tmp/quality-report.md

echo "" >> /tmp/quality-report.md
echo "---" >> /tmp/quality-report.md

# Análisis de code style
claude -p "Check src/ for functions longer than 50 lines, files longer than 300 lines, and naming convention violations. Be concise." --output-format text >> /tmp/quality-report.md

# Ver el reporte
cat /tmp/quality-report.md
```

#### Paso 5: Usar slash commands en modo interactivo

Entra a modo interactivo y prueba los slash commands más útiles:

```bash
claude
```

Dentro de la sesión:
```
> /cost
# Ver cuánto has gastado en esta sesión

> /context
# Ver cuánto contexto queda disponible

> /memory
# Ver y editar lo que Claude recuerda del proyecto (CLAUDE.md)

> /skills
# Ver skills disponibles

> /agents
# Ver agents disponibles
```

### Criterios de Éxito

- [ ] **`claude -p` ejecutado** con éxito y respuesta directa en terminal
- [ ] **Output formats probados**: al menos `--output-format json` y `--output-format text`
- [ ] **Pipe con Unix** ejecutado: al menos un comando con `|` enviando datos a Claude
- [ ] **Script batch** creado y ejecutado generando un reporte
- [ ] **Slash commands** probados: al menos `/cost`, `/context` y uno más

### Resultado Esperado

Deberías entender cómo usar Claude Code como una herramienta CLI que se integra con tu flujo de trabajo existente — sin necesidad de configurar servicios externos, MCPs, ni APIs adicionales.

**Comparar con solución**: Ver `solutions/exercise-2-cli.md`

### Variaciones (Si terminas rápido)

**Variación A**: Crear un alias útil
```bash
# Agregar a ~/.bashrc o ~/.zshrc
alias cr='claude -p "Review the git staged changes. Focus on bugs and security. Be concise."'

# Ahora antes de cada commit:
git add .
cr
```

**Variación B**: Script de análisis de PR
```bash
# Comparar rama actual con main
git diff main...HEAD | claude -p "Review this diff as a senior developer. Categorize feedback as: Must Fix, Should Fix, Nice to Have. Be specific with file:line references."
```

**Variación C**: Generador de tests
```bash
claude -p "Read src/services/products.service.js and generate unit tests using Jest. Cover happy path, edge cases, and error scenarios." --output-format text > tests/unit/products.generated.test.js
```

### Tips y Trucos

- **`-p` es tu mejor amigo**: Convierte cualquier tarea en un one-liner
- **`--output-format json`**: Perfecto cuando necesitas parsear el resultado con `jq`
- **Pipes bidireccionales**: Puedes enviar datos A Claude y recibir datos DE Claude
- **Combina con `watch`**: `watch -n 60 'claude -p "Check if tests pass" --output-format text'`
- **Timeout**: Usa `timeout 30 claude -p "..."` para limitar el tiempo de ejecución

### Troubleshooting

**Problema**: `claude -p` no retorna nada
**Solución**: Verifica que estás autenticado con `claude auth status`. Si no, ejecuta `claude` y sigue el flujo de login.

**Problema**: Output demasiado largo en terminal
**Solución**: Usa `--output-format text` y redirige a archivo: `claude -p "..." --output-format text > output.md`

**Problema**: Pipe no envía datos correctamente
**Solución**: Asegúrate de usar `2>&1` si quieres capturar stderr también: `npm test 2>&1 | claude -p "..."`

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

### 4. Broken Access Control
- Missing authorization checks
- Insecure direct object references (IDOR)
- Path traversal vulnerabilities
- CORS misconfiguration

### 5. Security Misconfiguration
- Default credentials
- Unnecessary features enabled
- Missing security headers
- Verbose error messages revealing internals

### 6. Cross-Site Scripting (XSS)
- Unescaped user input in templates
- innerHTML usage with user data
- Missing Content Security Policy

### 7. Insufficient Logging & Monitoring
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
- [ ] **System prompt completo** con OWASP checklist
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

Tu equipo tiene standards específicos para code reviews. Quieres crear un skill que automáticamente revise código según estos standards y se invoque con `/code-review`.

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
- No hardcoded secrets (API keys, passwords, tokens)
- All user input validated before use
- Database queries parameterized (no string concat)
- Proper error handling (don't expose internals)
- Authentication checks on protected routes
- CORS configured with explicit origins

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

### Passes
- [List things that meet standards well]
- [Compliment good practices]

### Warnings (Should Fix)
- **[Category - File:Line]**: Issue description
  - Current code: `code snippet`
  - Suggestion: `improved code` or explanation
  - Priority: Medium

### Must Fix (Blocking Issues)
- **[Category - File:Line]**: Issue description
  - Current code: `code snippet`
  - Fix: `corrected code` or clear instructions
  - Priority: High/Critical

### Summary
- **Total issues**: X warnings, Y must-fix
- **Test coverage**: X% (target: 80%+)
- **Recommendation**: Approve / Request Changes / Needs Discussion

Be thorough, specific, and constructive in your feedback.
```

#### Paso 3: Probar el Skill

Inicia Claude Code:
```bash
cd ecommerce-api
claude
```

Invoca el skill con el slash command:
```
> /code-review
```

O implícitamente:
```
> Review the authentication code for our team standards
```

#### Paso 4: Verificar el Output

El skill debería revisar el código y dar feedback estructurado según el formato definido.

### Criterios de Éxito

- [ ] **Skill creado** con configuration válida
- [ ] **Frontmatter completo**: name, description, allowed-tools
- [ ] **Standards documentados** claramente (Style, Security, Testing, Docs)
- [ ] **Review process** defined
- [ ] **Output format** estructurado (Passes, Warnings, Must Fix, Summary)
- [ ] **Skill se invoca** con `/code-review` o cuando mencionas "code review"
- [ ] **Review output incluye**:
  - [ ] Categorización por severity
  - [ ] File paths y line numbers
  - [ ] Code snippets del problema
  - [ ] Sugerencias de fix concretas
  - [ ] Summary con statistics

### Resultado Esperado

Un code review automático que se siente como feedback de un senior developer del equipo, invocable con un simple `/code-review`.

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

### Tips y Trucos

- **Slash commands**: El skill se puede invocar directamente con `/code-review`
- **Specificity**: Cuanto más específicos los standards, mejor el review
- **Examples**: Incluir good/bad code examples ayuda mucho
- **Tool restrictions**: allowed-tools hace el skill read-only (seguro)
- **Iteration**: Refina el skill basándote en feedback real de reviews

### Troubleshooting

**Problema**: Skill da feedback muy genérico
**Solución**: Agrega más ejemplos específicos y patterns a detectar en el system prompt

**Problema**: Skill no encuentra issues que existen
**Solución**: Asegúrate que allowed-tools incluye Grep (para buscar patterns) y Read (para examinar archivos)

**Problema**: Skill se invoca cuando no debería
**Solución**: Haz el description más específico. En lugar de "Review code", usa "Review code using team standards when explicitly requested"

---

## Ejercicio 5: Automation con Hooks y Scripts

**Tiempo**: 7 minutos
**Dificultad**: ⭐⭐
**Objetivo**: Automatizar tareas de desarrollo usando hooks de Claude Code y scripts CLI

### Contexto

Quieres integrar Claude Code en tu workflow diario de desarrollo usando:
- **Hooks**: Acciones automáticas que se ejecutan antes/después de ciertas operaciones de Claude
- **Scripts npm**: Tareas automatizadas invocables desde terminal
- **Aliases**: Atajos para operaciones frecuentes

### Instrucciones Paso a Paso

#### Paso 1: Configurar hooks en settings.json

Edita `.claude/settings.json` para agregar hooks útiles:

```json
{
  "permissions": {
    "defaultMode": "default",
    "rules": [
      {
        "working_directory": "ecommerce-api/tests/**",
        "defaultMode": "acceptEdits"
      }
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Hook] File modified: $CLAUDE_FILE_PATH at $(date)' >> /tmp/claude-audit.log"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Session ended at $(date)]' >> /tmp/claude-audit.log"
          }
        ]
      }
    ]
  }
}
```

#### Paso 2: Scripts npm para desarrollo

Edita `ecommerce-api/package.json` y agrega scripts que usan Claude CLI:

```json
{
  "scripts": {
    "review": "claude -p 'Review the git staged changes for security issues and code style. Be concise and focus on critical issues only.' --output-format text",
    "explain": "claude -p 'Explain the architecture of this project in 5 bullet points. Focus on patterns used and key design decisions.' --output-format text",
    "audit:security": "claude -p 'Scan src/ for OWASP Top 10 vulnerabilities. Report as: SEVERITY | FILE:LINE | ISSUE | FIX. Be concise.' --output-format text",
    "audit:deps": "npm audit --json 2>/dev/null | claude -p 'Analyze this npm audit output. Prioritize by severity. Suggest which to fix now vs later.' --output-format text"
  }
}
```

**Probar**:
```bash
cd ecommerce-api

# Revisar cambios staged
git add src/controllers/auth.controller.js
npm run review

# Auditoría de seguridad rápida
npm run audit:security
```

#### Paso 3: Crear CLAUDE.md para memoria del proyecto

Crea un archivo `CLAUDE.md` en la raíz del proyecto para que Claude recuerde el contexto:

```bash
cd ecommerce-api
```

Crea `CLAUDE.md`:
```markdown
# Project Context

## Tech Stack
- Node.js 18+ with Express.js
- PostgreSQL with Prisma ORM
- Jest for testing
- ESLint for linting

## Code Standards
- Use async/await, never callbacks
- Parameterized queries only (no string concatenation in SQL)
- All endpoints must validate input
- Minimum 80% test coverage for new code

## Common Commands
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run dev` - Start dev server

## Known Issues
- SQL injection in products.service.js (intentional for workshop)
- Hardcoded secrets in .env (intentional for workshop)
- Missing input validation in users.controller.js (intentional for workshop)
```

#### Paso 4: Probar el workflow completo

Inicia Claude Code y verifica que todo funciona:

```bash
cd ecommerce-api
claude
```

Dentro de la sesión:
```
> What are the known issues in this project?
# Claude debería leer CLAUDE.md y responder con los known issues

> /code-review
# Debería invocar el skill del ejercicio 4

> Make a small change to fix the input validation in users.controller.js
# Los hooks deberían registrar el cambio en /tmp/claude-audit.log
```

Verifica los hooks:
```bash
cat /tmp/claude-audit.log
```

### Criterios de Éxito

- [ ] **Hooks configurados** en settings.json
- [ ] **npm scripts** agregados para review y audit
- [ ] **CLAUDE.md** creado con contexto del proyecto
- [ ] **Al menos 1 script probado** exitosamente
- [ ] **Hooks ejecutándose**: verificar con `cat /tmp/claude-audit.log`

### Resultado Esperado

Un workflow de desarrollo donde Claude Code se integra automáticamente en tu proceso — hooks que registran cambios, scripts rápidos para review y auditoría, y memoria persistente del proyecto.

**Comparar con solución**: Ver `solutions/exercise-5-automation.md`

### Variaciones (Si terminas rápido)

**Variación A**: Hook que corre linter automáticamente
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "cd ecommerce-api && npx eslint $CLAUDE_FILE_PATH --fix 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

**Variación B**: Script de release notes
```bash
# Agregar a package.json
"release-notes": "git log $(git describe --tags --abbrev=0)..HEAD --oneline | claude -p 'Generate release notes from these commits. Categorize as: Features, Fixes, Other. Use markdown format.' --output-format text"
```

### Tips y Trucos

- **CLAUDE.md**: Es lo primero que Claude lee al iniciar — úsalo para dar contexto
- **Hooks son shell commands**: Pueden hacer cualquier cosa que harías en terminal
- **`--output-format text`**: Ideal para scripts que necesitan output limpio
- **Combina con git hooks**: Husky + claude CLI = pre-commit reviews automáticos
- **Matchers**: `Write|Edit` captura modificaciones, usa `Bash` para capturar comandos

### Troubleshooting

**Problema**: Hooks no se ejecutan
**Solución**: Verifica que el `matcher` coincide con la tool que Claude está usando. Los matchers son case-sensitive.

**Problema**: CLAUDE.md no se lee automáticamente
**Solución**: Debe estar en la raíz del directorio donde inicias `claude`. Verifica con `/memory`.

**Problema**: Scripts npm tardan mucho
**Solución**: Agrega `--max-turns 1` al comando claude para limitar la interacción: `claude -p "..." --max-turns 1`

---

## Completaste todos los ejercicios!

### Próximos Pasos

1. **Revisar soluciones**: Compara tus implementaciones con las soluciones en `solutions/`
2. **Profundizar**: Lee las guías en `guides/` para best practices
3. **Experimentar**: Modifica los agents/skills para tus necesidades específicas
4. **Integrar**: Implementa estas técnicas en tus proyectos reales

### Recursos Adicionales

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Community Examples](https://github.com/anthropics/claude-code-examples)

### Feedback

Cómo fue tu experiencia con estos ejercicios?
- Qué ejercicio fue más útil?
- Qué fue más desafiante?
- Qué te gustaría ver en futuros workshops?

[Link a formulario de feedback]

---

**Gracias por participar en el Claude Code Workshop!**
