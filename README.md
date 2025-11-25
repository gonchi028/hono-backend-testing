# Simple Backend - Hono API

A REST API built with [Hono](https://hono.dev/), [Drizzle ORM](https://orm.drizzle.team/), and SQLite for managing students (alumnos), subjects (materias), and tasks (tareas).

## 🚀 Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The server will start at http://localhost:3000

### Production

```bash
pnpm build
pnpm start
```

## 📚 API Endpoints

### Alumnos (Students)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/alumnos` | Get all students |
| GET | `/alumnos/:id` | Get a student by ID |
| POST | `/alumnos` | Create a new student |
| PUT | `/alumnos/:id` | Update a student |
| DELETE | `/alumnos/:id` | Delete a student |

**Body for POST/PUT:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@example.com"
}
```

### Materias (Subjects)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/materias` | Get all subjects |
| GET | `/materias/:id` | Get a subject by ID |
| GET | `/materias/:id/tareas` | Get all tasks for a subject |
| POST | `/materias` | Create a new subject |
| PUT | `/materias/:id` | Update a subject |
| DELETE | `/materias/:id` | Delete a subject |

**Body for POST/PUT:**
```json
{
  "titulo": "Programación",
  "sigla": "PRG101"
}
```

### Tareas (Tasks)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tareas` | Get all tasks |
| GET | `/tareas/:id` | Get a task by ID |
| POST | `/tareas` | Create a new task |
| PUT | `/tareas/:id` | Update a task |
| DELETE | `/tareas/:id` | Delete a task |

**Body for POST/PUT:**
```json
{
  "descripcion": "Homework 1",
  "calificacion": 85,
  "materiaId": 1
}
```

## 🧪 Testing

The project includes comprehensive test coverage with unit tests, integration tests, and E2E tests.

### Run All Tests

```bash
pnpm test
```

### Run Tests Once (CI mode)

```bash
pnpm test:run
```

### Run Specific Test Suites

```bash
# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# E2E tests only
pnpm test:e2e
```

### Run with Coverage

```bash
pnpm test:coverage
```

### Test Structure

```
src/tests/
├── setup.ts              # Test utilities and fixtures
├── unit/
│   └── validators.test.ts    # Unit tests for validation functions
├── integration/
│   ├── alumnos.test.ts       # Integration tests for /alumnos endpoints
│   ├── materias.test.ts      # Integration tests for /materias endpoints
│   └── tareas.test.ts        # Integration tests for /tareas endpoints
└── e2e/
    └── workflows.test.ts     # End-to-end workflow tests
```

## 🔄 CI/CD

This project uses GitHub Actions for continuous integration. Tests run automatically on:

- Push to `dev` or `main` branches
- Pull requests to `dev` or `main` branches

The CI pipeline includes:
- Running unit tests
- Running integration tests
- Running E2E tests
- Running tests with coverage
- Type checking with TypeScript
- Building the project

## 🗄️ Database Schema

### Alumnos (Students)
- `id` - Primary key (auto-increment)
- `nombre` - First name (required)
- `apellido` - Last name (required)
- `correo` - Email (required, unique)

### Materias (Subjects)
- `id` - Primary key (auto-increment)
- `titulo` - Title (required)
- `sigla` - Code (required, unique, 2-10 characters)

### Tareas (Tasks)
- `id` - Primary key (auto-increment)
- `descripcion` - Description (required)
- `calificacion` - Grade (required, 0-100)
- `materiaId` - Foreign key to materias (required)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Hono
- **ORM**: Drizzle ORM
- **Database**: SQLite (libSQL)
- **Testing**: Vitest
- **Language**: TypeScript
