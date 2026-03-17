# Solución: Ejercicio 5 - Automation con Hooks y Scripts

## Paso 1: Hooks en settings.json

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

**Hooks disponibles**:
- `PreToolUse`: Antes de que Claude use una tool (puede bloquear)
- `PostToolUse`: Después de que Claude usa una tool
- `Stop`: Cuando la sesión termina
- `UserPromptSubmit`: Cuando el usuario envía un prompt

**Matchers**: Filtran por nombre de tool (`Write`, `Edit`, `Bash`, `Read`, etc.)

## Paso 2: Scripts npm

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

**Uso**:
```bash
# Antes de commit
git add -A
npm run review

# Auditoría de seguridad
npm run audit:security

# Entender el proyecto rápidamente
npm run explain
```

## Paso 3: CLAUDE.md

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

**Por qué CLAUDE.md es importante**:
- Es lo primero que Claude lee al iniciar sesión
- Persiste entre sesiones (no se pierde al cerrar)
- Puede estar en la raíz del proyecto (compartido con equipo) o en `~/.claude/CLAUDE.md` (personal)
- Se puede verificar con `/memory`

## Paso 4: Verificación

```bash
# Verificar hooks
cat /tmp/claude-audit.log
# Debería mostrar entradas de archivos modificados

# Verificar CLAUDE.md
claude
> /memory
# Debería mostrar el contenido de CLAUDE.md

# Verificar scripts
npm run audit:security
# Debería ejecutar el análisis y mostrar resultados
```

## Variaciones

### Hook que corre linter automáticamente
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

### Script de release notes
```json
{
  "scripts": {
    "release-notes": "git log $(git describe --tags --abbrev=0 2>/dev/null || echo HEAD~10)..HEAD --oneline | claude -p 'Generate release notes from these commits. Categorize as: Features, Fixes, Other. Use markdown format.' --output-format text"
  }
}
```

### Hook de validación pre-prompt
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[$(date)] User prompt submitted' >> /tmp/claude-audit.log"
          }
        ]
      }
    ]
  }
}
```

## Tips clave

| Concepto | Descripción |
|----------|-------------|
| **CLAUDE.md** | Memoria persistente del proyecto, leída automáticamente |
| **Hooks** | Shell commands ejecutados automáticamente en eventos |
| **Matchers** | Filtros regex para seleccionar qué tools triggean hooks |
| **`--output-format text`** | Output limpio para scripts |
| **`/memory`** | Verificar qué sabe Claude del proyecto |
| **settings.json** | Configuración compartible con el equipo via `.claude/` |
