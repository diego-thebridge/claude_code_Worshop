# Claude Code Workshop - Índice de Materiales

Guía completa de todos los archivos del workshop y cómo usarlos.

## 📂 Estructura Completa

```
sesion_CC/
├── 📘 README.md                       ← Empezar aquí
├── 📄 INDEX.md                        ← Este archivo
├── 📊 PROJECT.md                      ← Descripción del proyecto de ejemplo
├── 📝 EXERCISES.md                    ← 5 ejercicios con instrucciones
│
├── 📚 guides/
│   ├── quick-reference.md             ← Cheat sheet (consulta rápida)
│   └── best-practices.md              ← Guía exhaustiva avanzada
│
├── ⚙️ .claude/
│   ├── settings.json                  ← Ejemplo de configuración
│   ├── agents/
│   │   └── security-auditor.md        ← Agent de seguridad completo
│   └── skills/
│       └── code-review/
│           └── SKILL.md               ← Skill de code review
│
├── ✅ solutions/
│   ├── exercise-1-plan.md             ← Solución ejercicio 1
│   ├── exercise-2-mcp.sh              ← Solución ejercicio 2
│   ├── exercise-3-agent.md            ← Solución ejercicio 3
│   ├── exercise-4-skill.md            ← Solución ejercicio 4
│   └── exercise-5-ci.md               ← Solución ejercicio 5
│
└── 💻 ecommerce-api/                  ← Proyecto de ejemplo
    ├── README.md                      ← Setup del proyecto
    ├── .env.example                   ← Environment variables
    └── src/                           ← Código con vulnerabilidades
        ├── services/products.service.js      (SQL injection)
        ├── middleware/auth.middleware.js     (Broken access control)
        └── controllers/users.controller.js   (Missing validation)
```

---

## 👥 Para PARTICIPANTES



#### 1. **README.md** (15 min)
**Qué es**: Instrucciones de setup completas
**Leer secciones**:
- Setup Previo (instalar Claude Code)
- Clonar repositorio
- Verificar instalación
- Preparar cuentas (GitHub token, Supabase/Docker-)

**Acción**:
```bash
# Instalar Claude Code
curl -fsSL https://claude.ai/install.sh | bash

# Verificar
claude --version

# Clonar workshop
git clone [repo-url]
cd claude-code-workshop
```

#### 2. **PROJECT.md** (10 min)
**Qué es**: Overview del proyecto e-commerce API
**Leer secciones**:
- Arquitectura del proyecto
- Problemas intencionales (para entender qué buscar)
- Setup del proyecto

**Acción**:
```bash
cd ecommerce-api
npm install
docker-compose up -d
```

### Durante el Workshop (120 min)

#### 3. **EXERCISES.md** (Seguir en tiempo real)
**Qué es**: 5 ejercicios prácticos paso a paso
**Cómo usar**:
- Tener abierto durante todo el workshop
- Seguir instrucciones durante cada ejercicio
- Marcar checkboxes conforme completas
- Consultar troubleshooting si tienes problemas

**Timing**:
- Ejercicio 1: 0:30 - 0:40 (10 min)
- Ejercicio 2: 1:01 - 1:10 (10 min)
- Ejercicio 3: 1:30 - 1:40 (10 min)
- Ejercicio 4: 1:54 - 2:02 (8 min)
- Ejercicio 5: (para casa, tiene las instrucciones)

#### 4. **guides/quick-reference.md** (Consulta durante ejercicios)
**Qué es**: Cheat sheet con todos los comandos
**Cuándo usar**:
- ¿Olvidaste un comando? → quick-reference.md
- ¿Cómo se configura un MCP server? → quick-reference.md
- ¿Qué shortcut era? → quick-reference.md


### Después del Workshop

#### 5. **solutions/** (Después de cada ejercicio)
**Qué es**: Soluciones completas de cada ejercicio
**Cuándo ver**:
- DESPUÉS de intentar el ejercicio
- Si te atrasaste y no terminaste
- Para comparar tu approach con la solución
- Para ver variaciones avanzadas

**No hacer**: Ver antes de intentar el ejercicio

#### 6. **guides/best-practices.md** (Esta semana)
**Qué es**: Guía exhaustiva de 46 páginas sobre patterns avanzados
**Secciones clave**:
- Permission strategies
- Context management
- MCP server design
- Agent architecture patterns
- Team collaboration setup
- Security & privacy
- Performance optimization

**Cómo leer**: Por secciones según las vayas necesitando

#### 7. **.claude/** (Referencia para tu proyecto)
**Qué es**: Ejemplos de configuración funcionales
**Usar para**:
- Copiar settings.json a tu proyecto
- Adaptar security-auditor agent
- Personalizar code-review skill

**Acción**:
```bash
# Copiar a tu proyecto
cp -r .claude ~/tu-proyecto/.claude
# Luego adaptar a tus necesidades
```



## 📋 Checklist de Uso

### ✅ Participantes

**Antes del Workshop**:
- [ ] Leer README.md completo
- [ ] Instalar Claude Code y verificar
- [ ] Clonar repositorio
- [ ] Setup ecommerce-api (Docker, npm install)
- [ ] Leer PROJECT.md para familiarizarse

**Durante el Workshop**:
- [ ] Seguir EXERCISES.md en tiempo real
- [ ] Consultar quick-reference.md cuando necesario
- [ ] Intentar ejercicios antes de ver solutions

**Después del Workshop**:
- [ ] Revisar solutions/ de ejercicios no completados
- [ ] Leer best-practices.md por secciones
- [ ] Adaptar .claude/ configs a tu proyecto
- [ ] Empezar a usar Claude Code en proyecto real

### ✅ Instructores

**1 Semana Antes**:
- [ ] Leer INSTRUCTOR_GUIDE.md completo
- [ ] Hacer dry run del timing
- [ ] Practicar demos
- [ ] Grabar demos de backup

**3 Días Antes**:
- [ ] Enviar README.md y setup instructions a participantes
- [ ] Confirmar instalaciones

**1 Día Antes**:
- [ ] Probar todos los ejercicios
- [ ] Verificar MCP servers funcionan
- [ ] Imprimir INSTRUCTOR_CHECKLIST.md

**2 Horas Antes**:
- [ ] Setup de 2 pantallas
- [ ] Terminal: font grande, color claro
- [ ] Abrir archivos necesarios
- [ ] Docker corriendo

**Durante Workshop**:
- [ ] Seguir INSTRUCTOR_CHECKLIST.md
- [ ] Timing checks cada ejercicio
- [ ] Engagement polls cada 15 min
- [ ] Grabar sesión

**Después Workshop**:
- [ ] Email con materials y grabación
- [ ] Survey de feedback
- [ ] Responder preguntas pendientes

---

## 🎯 Archivos por Caso de Uso

### "Quiero aprender Claude Code"
→ Start: **README.md** → **EXERCISES.md** → **quick-reference.md**

### "Necesito referencia rápida"
→ **quick-reference.md** (comandos, shortcuts, configs)

### "Quiero profundizar"
→ **best-practices.md** (46 páginas de patterns avanzados)

### "Voy a dar el workshop"
→ **INSTRUCTOR_GUIDE.md** + **INSTRUCTOR_CHECKLIST.md**

### "Necesito configurar mi proyecto"
→ **.claude/** (copiar y adaptar configs)

### "¿Cómo se hace X?"
→ **solutions/** (ejemplos completos paso a paso)

### "Quiero entender el proyecto"
→ **PROJECT.md** (arquitectura y problemas intencionales)

---

## 💡 Tips de Navegación

### Búsqueda Rápida

**Para participantes**:
```bash
# ¿Cómo configurar MCP?
grep -r "mcp add" guides/quick-reference.md

# ¿Qué hace el comando X?
grep -A 5 "comando-que-busco" guides/quick-reference.md
```

**Para instructores**:
```bash
# ¿Qué digo en minuto 45?
grep -A 20 "\[0:45" INSTRUCTOR_GUIDE.md

# ¿Troubleshooting para API failure?
grep -A 10 "API falla" INSTRUCTOR_CHECKLIST.md
```

