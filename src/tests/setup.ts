import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';

import { createApp } from '../app.js';
import { alumnosTable, materiasTable, tareasTable } from '../db/schema.js';

export interface TestContext {
  db: LibSQLDatabase;
  app: ReturnType<typeof createApp>;
}

/**
 * Creates a test context with an isolated in-memory SQLite database
 */
export async function createTestContext(): Promise<TestContext> {
  const client = createClient({ url: ':memory:' });
  const db = drizzle({ client });

  // Create tables
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS alumnos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS materias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      sigla TEXT NOT NULL UNIQUE
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descripcion TEXT NOT NULL,
      calificacion INTEGER NOT NULL,
      materia_id INTEGER NOT NULL REFERENCES materias(id)
    )
  `);

  const app = createApp(db);

  return { db, app };
}

/**
 * Clears all tables in the test database
 */
export async function clearDatabase(db: LibSQLDatabase): Promise<void> {
  await db.delete(tareasTable);
  await db.delete(materiasTable);
  await db.delete(alumnosTable);
}

/**
 * Seeds the database with sample test data
 */
export async function seedTestData(db: LibSQLDatabase) {
  // Insert test alumnos
  const alumnos = await db.insert(alumnosTable).values([
    { nombre: 'Juan', apellido: 'Pérez', correo: 'juan.perez@test.com' },
    { nombre: 'María', apellido: 'García', correo: 'maria.garcia@test.com' },
    { nombre: 'Carlos', apellido: 'López', correo: 'carlos.lopez@test.com' },
  ]).returning();

  // Insert test materias
  const materias = await db.insert(materiasTable).values([
    { titulo: 'Matemáticas', sigla: 'MAT101' },
    { titulo: 'Programación', sigla: 'PRG201' },
    { titulo: 'Base de Datos', sigla: 'BD301' },
  ]).returning();

  // Insert test tareas
  const tareas = await db.insert(tareasTable).values([
    { descripcion: 'Tarea 1 de Matemáticas', calificacion: 85, materiaId: materias[0].id },
    { descripcion: 'Tarea 2 de Matemáticas', calificacion: 90, materiaId: materias[0].id },
    { descripcion: 'Proyecto de Programación', calificacion: 95, materiaId: materias[1].id },
  ]).returning();

  return { alumnos, materias, tareas };
}

/**
 * Test fixtures for creating sample data
 */
export const fixtures = {
  alumno: {
    valid: {
      nombre: 'Test',
      apellido: 'User',
      correo: 'test.user@example.com',
    },
    invalidEmail: {
      nombre: 'Test',
      apellido: 'User',
      correo: 'invalid-email',
    },
    missingFields: {
      nombre: 'Test',
    },
  },
  materia: {
    valid: {
      titulo: 'Test Subject',
      sigla: 'TEST01',
    },
    invalidSigla: {
      titulo: 'Test Subject',
      sigla: 'T', // Too short
    },
    missingFields: {
      titulo: 'Test Subject',
    },
  },
  tarea: {
    valid: (materiaId: number) => ({
      descripcion: 'Test Task',
      calificacion: 80,
      materiaId,
    }),
    invalidCalificacion: (materiaId: number) => ({
      descripcion: 'Test Task',
      calificacion: 150, // Invalid: > 100
      materiaId,
    }),
    missingFields: {
      descripcion: 'Test Task',
    },
  },
};
