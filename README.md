# Claude Code Workshop - Sesión para Usuarios Avanzados

Workshop intensivo de 1-2 horas sobre Claude Code, diseñado para desarrolladores que ya están familiarizados con herramientas de IA y quieren dominar capacidades avanzadas.

## 📋 Contenido del Workshop

Este workshop cubre:

- **Plan Mode**: Exploración segura y planificación antes de modificar código
- **MCP (Model Context Protocol)**: Conectar Claude Code con APIs externas, databases, y herramientas
- **Subagents**: Crear y usar agentes especializados para workflows complejos
- **Skills**: Encapsular expertise del equipo en capacidades reutilizables
- **Git Integration**: Automatizar workflows con commits, PRs, y CI/CD
- **Best Practices**: Patterns para usar Claude Code efectivamente en producción

## 🎯 Audiencia

Este workshop está optimizado para:
- Desarrolladores con experiencia en IA conversacional (ChatGPT, GitHub Copilot)
- Equipos que buscan herramientas más avanzadas para agentic workflows
- Engineers interesados en automation y CI/CD con IA

## ⏱️ Duración

- **Versión compacta**: 90 minutos (omite arquitectura interna)
- **Versión completa**: 130 minutos (incluye arquitectura interna)
- **Versión extendida**: 150+ minutos

## 📂 Estructura del Repositorio

```
claude-code-workshop/
├── README.md                          # Este archivo
├── PROJECT.md                         # Overview del proyecto de ejemplo
├── EXERCISES.md                       # Ejercicios prácticos con instrucciones
├── .claude/                           # Configuraciones de ejemplo
│   ├── settings.json
│   ├── agents/
│   │   └── security-auditor.md
│   └── skills/
│       └── code-review/
│           └── SKILL.md
├── guides/                            # Guías de referencia
│   ├── quick-reference.md             # Cheat sheet
│   └── best-practices.md              # Best practices detalladas
├── solutions/                         # Soluciones a ejercicios
│   ├── exercise-1-plan.md
│   ├── exercise-2-mcp.sh
│   ├── exercise-3-agent.md
│   ├── exercise-4-skill.md
│   └── exercise-5-ci.md
└── ecommerce-api/                     # Proyecto de ejemplo
    ├── src/
    ├── tests/
    ├── package.json
    └── README.md
```

## 🚀 Setup Previo (IMPORTANTE - Hacer 48h antes)

### 1. Instalar Claude Code

**macOS, Linux, WSL**:
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell**:
```powershell
irm https://claude.ai/install.ps1 | iex
```

**Homebrew** (alternativa para macOS):
```bash
brew install --cask claude-code
```

**WinGet** (alternativa para Windows):
```bash
winget install Anthropic.ClaudeCode
```

### 2. Configurar Autenticación

```bash
claude
# Seguir el flujo de login en el navegador
```

### 3. Clonar este Repositorio

```bash
git clone https://github.com/[tu-usuario]/claude-code-workshop
cd claude-code-workshop
```

### 4. Setup del Proyecto de Ejemplo

```bash
cd ecommerce-api
npm install
```

**Iniciar base de datos** (Docker requerido):
```bash
docker-compose up -d
```

**Ejecutar migraciones**:
```bash
npm run migrate
npm run seed
```

### 5. Verificar Instalación

```bash
claude -p "Verify my Claude Code setup is working correctly"
```

Si ves una respuesta de Claude, estás listo!

### 6. Preparar Cuentas (Opcional pero Recomendado)

Para aprovechar al máximo las demos de MCP:

- **GitHub**: [Personal Access Token](https://github.com/settings/tokens) con scopes `repo`, `read:org`
- **PostgreSQL**: Ya configurado con Docker Compose (ver paso 4)
- **Sentry**: [Free tier account](https://sentry.io/signup/) (opcional)

## 📝 Requisitos Previos

### Software Necesario

- **Node.js** 18+ y npm
- **Docker** y Docker Compose (para la base de datos)
- **Git** 2.30+
- **Terminal**: bash, zsh, o PowerShell

### Conocimientos Recomendados

- Experiencia con herramientas de IA (ChatGPT, Copilot, etc.)
- JavaScript/TypeScript básico
- REST APIs y Node.js
- Git workflows
- Terminal/command line

## 🎓 Cómo Usar Este Material

### Para Instructores

**📗 NUEVO: [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md)** - Guion completo minuto a minuto
**📋 NUEVO: [INSTRUCTOR_CHECKLIST.md](INSTRUCTOR_CHECKLIST.md)** - Checklist ejecutivo para imprimir

1. **Leer el guion completo**: Ver `INSTRUCTOR_GUIDE.md` para:
   - Timing detallado (0:00 - 2:30)
   - Diálogos exactos para cada sección
   - Qué mostrar en pantalla
   - Cómo manejar ejercicios
   - Troubleshooting en vivo
   - Tips del instructor

2. **Imprimir checklist**: `INSTRUCTOR_CHECKLIST.md` contiene:
   - Pre-workshop checklist (3 días, 1 día, 2h antes)
   - Timing rápido de las 7 fases
   - Frases clave por sección
   - Checkpoints durante ejercicios
   - Troubleshooting rápido

3. **Preparar demos**: Probar todas las demos en `PROJECT.md` antes de la sesión

4. **Configurar backup**: Tener demos pregrabadas en caso de API issues

5. **Setup técnico**:
   - Dos pantallas (una para terminal/slides, otra para chat)
   - Terminal con font size grande (18-20pt) y color scheme claro
   - Grabar la sesión para compartir después
   - Docker corriendo para database

### Para Participantes

1. **Completar setup previo** 48h antes de la sesión
2. **Durante el workshop**: Seguir las demos y completar ejercicios en `EXERCISES.md`
3. **Después del workshop**: Consultar `guides/quick-reference.md` y `guides/best-practices.md`

### Modo Auto-estudio

Si estás usando este material por tu cuenta:

1. Lee `PROJECT.md` para entender el proyecto de ejemplo
2. Completa los ejercicios en orden: `EXERCISES.md`
3. Compara con las soluciones en `solutions/`
4. Consulta las guías en `guides/` para profundizar

## 🛠️ Troubleshooting

### Claude Code no está en PATH

```bash
# Agregar a ~/.zshrc o ~/.bashrc
export PATH="$HOME/.claude/bin:$PATH"
```

Luego reiniciar terminal o ejecutar:
```bash
source ~/.zshrc  # o source ~/.bashrc
```

### Permission Denied

```bash
chmod +x ~/.claude/bin/claude
```

### API Rate Limits

Si encuentras rate limits durante la sesión:
- Usar personal API key: `claude config set apiKey YOUR_KEY`
- Configurar thinking budget: `export MAX_THINKING_TOKENS=5000`

### Docker Issues

Si Docker no inicia correctamente:

```bash
# Verificar que Docker está corriendo
docker ps

# Reiniciar containers
cd ecommerce-api
docker-compose down
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Problemas con npm install

Si hay errores durante `npm install`:

```bash
# Limpiar cache
npm cache clean --force

# Remover node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📚 Recursos Adicionales

### Documentación Oficial
- [Claude Code Docs](https://code.claude.com/docs/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude API Docs](https://docs.anthropic.com/)

### Ejemplos y Tutoriales
- [Claude Code Examples](https://github.com/anthropics/claude-code-examples)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

### Comunidad
- [Discord de Anthropic](https://discord.gg/anthropic)
- [GitHub Discussions](https://github.com/anthropics/claude-code/discussions)

## 🤝 Contribuir

Si encuentras errores o tienes sugerencias:
1. Abre un issue describiendo el problema
2. O crea un PR con la corrección propuesta

## 📄 Licencia

Este material educativo está disponible bajo licencia MIT.

## 👨‍🏫 Autor y Contacto

Creado por [Tu Nombre] para [Nombre del Curso/Organización]

Para preguntas sobre el workshop:
- Email: [tu-email]
- Office hours: [horario y link] (si aplica)

## 📊 Feedback

Después de completar el workshop, por favor completa nuestra encuesta de feedback:
[Link a formulario de feedback]

Tus comentarios nos ayudan a mejorar el contenido para futuras sesiones.

---

**¿Listo para empezar?** 🚀

1. Completa el setup previo
2. Lee `PROJECT.md` para familiarizarte con el proyecto
3. Únete a la sesión online o comienza con `EXERCISES.md`

¡Bienvenido al mundo de Claude Code!
