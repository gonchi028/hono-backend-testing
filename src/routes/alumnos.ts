import { Hono } from 'hono';
import type { Context } from 'hono';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';

import { alumnosTable } from '../db/schema.js';

export function createAlumnosRoutes(db: LibSQLDatabase) {
  return new Hono()
    // GET all alumnos
    .get('/', async (c: Context) => {
      const alumnosData = await db.select().from(alumnosTable);
      return c.json(alumnosData);
    })
    // GET alumno by ID
    .get('/:id', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      const alumno = await db.select().from(alumnosTable).where(eq(alumnosTable.id, id));
      if (alumno.length === 0) {
        return c.json({ error: 'Alumno not found' }, 404);
      }
      return c.json(alumno[0]);
    })
    // POST create new alumno
    .post('/', async (c: Context) => {
      const body = await c.req.json();
      const { nombre, apellido, correo } = body;
      
      // Validation
      if (!nombre || !apellido || !correo) {
        return c.json({ error: 'Missing required fields: nombre, apellido, correo' }, 400);
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }
      
      try {
        const newAlumno = await db
          .insert(alumnosTable)
          .values({ nombre, apellido, correo })
          .returning();
        return c.json(newAlumno, 201);
      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed') || 
            error.cause?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return c.json({ error: 'Email already exists' }, 409);
        }
        throw error;
      }
    })
    // PUT update alumno
    .put('/:id', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      
      const body = await c.req.json();
      const { nombre, apellido, correo } = body;
      
      // Check if alumno exists
      const existing = await db.select().from(alumnosTable).where(eq(alumnosTable.id, id));
      if (existing.length === 0) {
        return c.json({ error: 'Alumno not found' }, 404);
      }
      
      // Email validation if provided
      if (correo) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
          return c.json({ error: 'Invalid email format' }, 400);
        }
      }
      
      try {
        const updatedAlumno = await db
          .update(alumnosTable)
          .set({ 
            nombre: nombre ?? existing[0].nombre, 
            apellido: apellido ?? existing[0].apellido, 
            correo: correo ?? existing[0].correo 
          })
          .where(eq(alumnosTable.id, id))
          .returning();
        return c.json(updatedAlumno[0]);
      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed') || 
            error.cause?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return c.json({ error: 'Email already exists' }, 409);
        }
        throw error;
      }
    })
    // DELETE alumno
    .delete('/:id', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      
      const existing = await db.select().from(alumnosTable).where(eq(alumnosTable.id, id));
      if (existing.length === 0) {
        return c.json({ error: 'Alumno not found' }, 404);
      }
      
      await db.delete(alumnosTable).where(eq(alumnosTable.id, id));
      return c.json({ message: 'Alumno deleted successfully' });
    });
}
