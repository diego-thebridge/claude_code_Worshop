# Solución: Ejercicio 2 - CLI Power Tools

## Paso 1: Análisis rápido con `claude -p`

```bash
cd ecommerce-api

# Análisis directo
claude -p "List all API endpoints in this project with their HTTP methods and file locations. Output as a markdown table."
```

**Resultado esperado**: Una tabla markdown con todos los endpoints, métodos HTTP, y archivos correspondientes.

## Paso 2: Output formats

```bash
# JSON para parseo programático
claude -p "Find all TODO and FIXME comments in the codebase. Return as JSON with fields: file, line, comment" --output-format json

# Texto plano para pipes
claude -p "Summarize the security issues in this codebase in 3 bullet points" --output-format text
```

**Resultado esperado**:
- `--output-format json`: Output estructurado parseable con `jq`
- `--output-format text`: Texto limpio sin formato markdown

## Paso 3: Pipes con Unix

```bash
# Analizar archivos modificados
git diff --name-only HEAD~3 | claude -p "Review these changed files for potential bugs or security issues. Be concise."

# Analizar output de tests
npm test 2>&1 | claude -p "Analyze these test results. List which tests failed and suggest fixes."

# Revisar dependencias
cat package.json | claude -p "Review these dependencies. Flag any with known security issues or that are deprecated."
```

**Resultado esperado**: Claude recibe el stdin y analiza el contenido contextualmente.

## Paso 4: Script batch

```bash
#!/bin/bash
# quality-report.sh - Genera reporte de calidad

echo "=== Code Quality Report ===" > /tmp/quality-report.md
echo "Generated: $(date)" >> /tmp/quality-report.md
echo "" >> /tmp/quality-report.md

echo "## Security Findings" >> /tmp/quality-report.md
claude -p "Scan src/ for hardcoded secrets, SQL injection, and missing input validation. List findings with file:line format." --output-format text >> /tmp/quality-report.md

echo "" >> /tmp/quality-report.md
echo "---" >> /tmp/quality-report.md
echo "## Code Style" >> /tmp/quality-report.md

claude -p "Check src/ for functions longer than 50 lines, files longer than 300 lines, and naming convention violations. Be concise." --output-format text >> /tmp/quality-report.md

echo "" >> /tmp/quality-report.md
echo "---" >> /tmp/quality-report.md
echo "Report complete."

cat /tmp/quality-report.md
```

**Resultado esperado**: Un archivo markdown con un reporte de calidad que combina múltiples análisis.

## Paso 5: Slash commands

```
/cost          → Muestra tokens usados y costo estimado de la sesión
/context       → Muestra uso del context window (tokens usados / disponibles)
/memory        → Muestra contenido de CLAUDE.md (proyecto + usuario)
/skills        → Lista skills disponibles en .claude/skills/
/agents        → Lista agents disponibles en .claude/agents/
```

## Variaciones

### Alias útil para reviews
```bash
# En ~/.bashrc o ~/.zshrc
alias cr='claude -p "Review the git staged changes. Focus on bugs and security. Be concise." --output-format text'

# Uso:
git add .
cr
```

### Script de análisis de PR
```bash
git diff main...HEAD | claude -p "Review this diff as a senior developer. Categorize feedback as: Must Fix, Should Fix, Nice to Have. Be specific with file:line references." --output-format text
```

### Generador de tests
```bash
claude -p "Read src/services/products.service.js and generate unit tests using Jest. Cover happy path, edge cases, and error scenarios." --output-format text > tests/unit/products.generated.test.js
```

## Tips clave

| Tip | Ejemplo |
|-----|---------|
| `-p` para one-liners | `claude -p "explain this code"` |
| `--output-format json` | Para parsear con `jq` |
| `--output-format text` | Para scripts y pipes |
| Pipe stdin | `cat file \| claude -p "analyze"` |
| Timeout | `timeout 30 claude -p "..."` |
| Max turns | `claude -p "..." --max-turns 1` |
