# E-Commerce API - Workshop Project

Este es el proyecto de ejemplo para el Claude Code workshop. Contiene **problemas intencionales** para los ejercicios prácticos.

## Estructura del Proyecto

```
ecommerce-api/
├── src/
│   ├── controllers/       # HTTP request handlers
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── models/          # Prisma schema
│   ├── routes/          # API routes
│   ├── config/          # Configuration
│   └── server.js        # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── prisma/
│   ├── migrations/
│   └── seed.js
├── docker-compose.yml
├── package.json
└── .env.example
```

## Setup Rápido

```bash
# Instalar dependencias
npm install

# Iniciar base de datos (Docker)
docker-compose up -d

# Ejecutar migraciones
npx prisma migrate dev

# Seed data
npm run seed

# Iniciar servidor
npm run dev
```

## Problemas Intencionales (Para Ejercicios)

Ver `../PROJECT.md` para lista completa. Los archivos de ejemplo incluyen:

1. **SQL Injection** - `src/services/products.service.js`
2. **Hardcoded Secrets** - `.env` file
3. **Missing Validation** - `src/controllers/users.controller.js`
4. **Broken Access Control** - `src/middleware/auth.middleware.js`

## Nota para Instructores

Este es un **esqueleto del proyecto**. Para el workshop completo:

1. Implementa los endpoints REST completos
2. Agrega los tests con ~60% coverage
3. Incluye los problemas intencionales listados en PROJECT.md
4. Seed database con productos de ejemplo

O usa un proyecto existente y agrega los problemas intencionales según necesites.

## Alternativa: Proyecto Real

Si prefieres, usa cualquier proyecto Node.js/Express existente y:
- Agrega algunos problemas intencionales de seguridad
- Documenta dónde están en PROJECT.md
- Los ejercicios funcionarán igual

El valor del workshop está en aprender Claude Code, no en el proyecto específico.
