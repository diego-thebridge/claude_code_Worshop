# Proyecto de Ejemplo: E-Commerce REST API

Este proyecto es una API REST simplificada de e-commerce diseñada específicamente para el workshop de Claude Code. Contiene **problemas intencionales** que servirán como base para los ejercicios prácticos.

## 🎯 Propósito Pedagógico

Este proyecto está diseñado para practicar:

1. **Plan Mode**: Analizar y planear refactorizaciones complejas
2. **MCP Integration**: Conectar Claude Code con databases y external APIs
3. **Custom Agents**: Crear agentes de seguridad y testing
4. **Skills**: Definir standards de code review
5. **Git Workflows**: Commits, PRs, y automation

## 📋 Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT (básica - necesita upgrade a OAuth2)
- **Testing**: Jest
- **Linting**: ESLint
- **Type checking**: TypeScript

## 🏗️ Arquitectura

```
ecommerce-api/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── auth.controller.js
│   │   ├── products.controller.js
│   │   ├── users.controller.js
│   │   └── orders.controller.js
│   ├── middleware/        # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   ├── models/           # Database models (Prisma)
│   │   └── schema.prisma
│   ├── routes/           # API routes
│   │   ├── auth.routes.js
│   │   ├── products.routes.js
│   │   ├── users.routes.js
│   │   └── orders.routes.js
│   ├── services/         # Business logic
│   │   ├── auth.service.js
│   │   ├── products.service.js
│   │   ├── users.service.js
│   │   └── orders.service.js
│   ├── utils/            # Helpers
│   │   ├── logger.js
│   │   └── validators.js
│   ├── config/           # Configuration
│   │   └── database.js
│   └── server.js         # Entry point
├── tests/
│   ├── unit/
│   │   ├── auth.test.js
│   │   ├── products.test.js
│   │   └── users.test.js
│   └── integration/
│       ├── api.test.js
│       └── database.test.js
├── prisma/
│   ├── migrations/
│   └── seed.js
├── docker-compose.yml    # PostgreSQL container
├── package.json
├── .env.example
└── README.md
```

## 🔑 Features Implementadas

### Authentication (Básica)
- POST `/api/auth/register` - Registro de usuarios
- POST `/api/auth/login` - Login con JWT
- POST `/api/auth/logout` - Logout (invalidar token)

**Problema intencional**: Usa JWT básico sin refresh tokens. Necesita upgrade a OAuth2.

### Products CRUD
- GET `/api/products` - Listar productos (con paginación básica)
- GET `/api/products/:id` - Ver detalle de producto
- POST `/api/products` - Crear producto (admin only)
- PUT `/api/products/:id` - Actualizar producto (admin only)
- DELETE `/api/products/:id` - Eliminar producto (admin only)

**Problema intencional**: No hay rate limiting. Los endpoints son vulnerables a abuse.

### Users Management
- GET `/api/users/me` - Ver perfil propio
- PUT `/api/users/me` - Actualizar perfil
- GET `/api/users` - Listar usuarios (admin only)

**Problema intencional**: El endpoint de listado de usuarios no valida permisos correctamente.

### Orders
- POST `/api/orders` - Crear orden
- GET `/api/orders/me` - Ver órdenes propias
- GET `/api/orders/:id` - Ver detalle de orden

**Problema intencional**: No hay validación de inventario. Puedes ordenar productos sin stock.

## 🐛 Problemas Intencionales (Para Ejercicios)

### 1. Security Issues

**SQL Injection vulnerability** (src/services/products.service.js:45):
```javascript
// VULNERABLE: String concatenation en query
async function searchProducts(query) {
  const sql = `SELECT * FROM products WHERE name LIKE '%${query}%'`;
  return db.raw(sql);
}
```

**Exposed secrets** (.env no está en .gitignore correctamente):
```bash
JWT_SECRET=super-secret-key-12345
DATABASE_URL=postgresql://admin:password123@localhost:5432/ecommerce
```

**Missing input validation** (src/controllers/users.controller.js:78):
```javascript
// No validation on user input
async function updateProfile(req, res) {
  const { email, name, phone } = req.body;
  // Directly updates without validation
  await userService.update(req.user.id, { email, name, phone });
}
```

**No rate limiting**: Todos los endpoints están expuestos sin rate limits.

### 2. Authentication Issues

**Weak JWT implementation**:
- No refresh tokens
- Tokens nunca expiran (o expiración muy larga)
- Secret hardcodeado en .env

**Missing CSRF protection**: POST endpoints sin CSRF tokens.

### 3. Authorization Issues

**Broken access control** (src/middleware/auth.middleware.js:34):
```javascript
// VULNERABLE: Admin check puede ser bypasseado
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  // Pero el user.role viene del JWT sin verificación adicional
}
```

### 4. Data Validation Issues

**Missing inventory checks** (src/services/orders.service.js:56):
```javascript
async function createOrder(userId, items) {
  // NO verifica stock antes de crear orden
  const order = await db.order.create({
    data: { userId, items }
  });
  return order;
}
```

**No input sanitization**: Los inputs del usuario no se sanitizan antes de guardar.

### 5. Performance Issues

**N+1 queries** (src/controllers/orders.controller.js:23):
```javascript
async function getOrdersWithProducts(req, res) {
  const orders = await orderService.findAll();
  // N+1: Para cada orden, hace una query adicional
  for (let order of orders) {
    order.products = await productService.findByIds(order.productIds);
  }
  return res.json(orders);
}
```

**Missing indexes**: La tabla `products` no tiene index en `name` a pesar de búsquedas frecuentes.

### 6. Testing Issues

**Low coverage**: Solo ~60% coverage
- Falta tests para edge cases
- Falta integration tests para orders
- No hay tests de seguridad

**Flaky tests**: Algunos tests dependen de timing y fallan intermitentemente.

## 🎓 Ejercicios Basados en Este Proyecto

### Ejercicio 1: Plan Mode - OAuth2 Refactor
**Objetivo**: Usar Plan Mode para analizar y planear la migración de JWT a OAuth2.

**Tarea**:
```
> Switch to Plan Mode
> Analyze the current authentication system and create a detailed plan to migrate to OAuth2
```

**Criterios de éxito**:
- Plan identifica todos los archivos a modificar
- Considera backward compatibility
- Incluye migration strategy para usuarios existentes
- Define testing approach

### Ejercicio 2: MCP Integration - Database + GitHub
**Objetivo**: Conectar MCP servers y resolver tarea que require ambos.

**Setup**:
```bash
# PostgreSQL MCP server
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://localhost:5432/ecommerce"

# GitHub MCP server
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

**Tarea**:
```
> Query the database to find products with zero inventory
> Create a GitHub issue listing these products with their details
> Tag it with "inventory" and "urgent" labels
```

### Ejercicio 3: Custom Agent - Security Auditor
**Objetivo**: Crear un agent que detecte los security issues intencionales.

**Tarea**: Crear `.claude/agents/security-auditor.md` que:
- Analice el código en busca de OWASP Top 10 vulnerabilities
- Reporte findings con severity (Critical, High, Medium, Low)
- Incluya file paths y line numbers específicos
- Solo use herramientas read-only (Read, Grep, Glob)

**Criterios de éxito**:
- Detecta el SQL injection
- Detecta el exposed secret
- Detecta missing input validation
- Detecta broken access control

### Ejercicio 4: Team Skill - Code Review Standards
**Objetivo**: Crear un skill que encapsule code review standards del equipo.

**Tarea**: Crear `.claude/skills/code-review/SKILL.md` que verifique:

**Style checks**:
- Max function length: 50 lines
- Max file length: 300 lines
- Naming conventions (camelCase para variables, PascalCase para classes)

**Security checks**:
- No hardcoded secrets
- Input validation presente
- SQL queries parametrizadas
- CORS configurado

**Testing checks**:
- Min 80% coverage
- Tests para cada endpoint
- Tests para edge cases

**Output format**:
```
✅ Passes: [list]
⚠️  Warnings: [list with file:line]
❌ Failures: [list with file:line]
```

### Ejercicio 5: CI/CD Automation
**Objetivo**: Crear scripts de automation para CI/CD.

**Tareas**:

1. **Pre-commit hook** (package.json script):
```json
{
  "scripts": {
    "pre-commit": "claude -p 'Review staged changes for security issues and code style'"
  }
}
```

2. **PR review automation** (GitHub Actions):
```yaml
- name: Claude Code Review
  run: |
    claude -p "Review the changes vs main branch. Focus on security, performance, and best practices. Output findings in markdown."
```

3. **Auto-translate new strings**:
```bash
claude -p "Find new strings in src/locales/en.json that don't exist in es.json, fr.json, de.json. Translate and update the files."
```

## 🚀 Cómo Ejecutar el Proyecto

### Setup Inicial

1. **Clonar y instalar dependencias**:
```bash
cd ecommerce-api
npm install
```

2. **Configurar environment variables**:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Iniciar base de datos**:
```bash
docker-compose up -d
```

4. **Ejecutar migraciones**:
```bash
npx prisma migrate dev
```

5. **Seed data**:
```bash
npm run seed
```

### Desarrollo

**Iniciar servidor en development**:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

**Ejecutar tests**:
```bash
# All tests
npm test

# Con coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Linting**:
```bash
npm run lint
npm run lint:fix
```

**Type checking**:
```bash
npm run typecheck
```

### Testing Manual con curl

**Registrar usuario**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Listar productos** (requiere auth):
```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);
```

## 🔍 Endpoints de Testing

Algunos endpoints útiles para testing durante el workshop:

**Health check**:
```bash
GET /health
# Response: { "status": "ok", "timestamp": "..." }
```

**Database connection check**:
```bash
GET /health/db
# Response: { "database": "connected", "latency": "5ms" }
```

**Seed data reset** (development only):
```bash
POST /api/dev/reset
# WARNING: Limpia y re-seedea toda la base de datos
```

## 🐳 Docker Setup

El proyecto incluye Docker Compose para la base de datos:

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Comandos útiles**:
```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Parar y eliminar volumes (limpieza completa)
docker-compose down -v
```

## 📈 Métricas Actuales

**Test Coverage**: ~60%
- Controllers: 70%
- Services: 55%
- Middleware: 65%
- Routes: 50%

**Code Quality**:
- ESLint warnings: 23
- ESLint errors: 5 (intencionales)
- TypeScript errors: 8 (intencionales)

**Performance**:
- Average response time: 120ms
- N+1 queries detectadas: 3 locations
- Missing indexes: 2 tables

**Security**:
- Known vulnerabilities: 6 (intencionales)
- Outdated dependencies: 2 (non-critical)

## 🎯 Objetivos de Aprendizaje

Después de trabajar con este proyecto, deberías poder:

1. ✅ Usar Plan Mode para analizar y planear refactorizaciones complejas
2. ✅ Conectar y usar MCP servers para integrar external tools
3. ✅ Crear custom agents con restrictions específicas
4. ✅ Definir skills reutilizables para el equipo
5. ✅ Automatizar workflows con Claude Code en CI/CD
6. ✅ Aplicar best practices de seguridad y performance

## 🤝 Contribuir al Proyecto

Este es un proyecto educativo. Si encuentras bugs **no intencionales** o tienes sugerencias:

1. Verifica que no sea uno de los problemas intencionales listados arriba
2. Abre un issue describiendo el problema
3. O crea un PR con la corrección

## 📚 Recursos Relacionados

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Nota para instructores**: Este proyecto contiene vulnerabilidades intencionales para propósitos educativos. NO usar en producción. Asegúrate de explicar claramente a los participantes cuáles son los problemas intencionales vs bugs reales.
