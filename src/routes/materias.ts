import { Hono } from 'hono';
import type { Context } from 'hono';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';

import { materiasTable, tareasTable } from '../db/schema.js';

export function createMateriasRoutes(db: LibSQLDatabase) {
  return new Hono()
    // GET all materias
    .get('/', async (c: Context) => {
      const materiasData = await db.select().from(materiasTable);
      return c.json(materiasData);
    })
    // GET materia by ID
    .get('/:id', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      const materia = await db.select().from(materiasTable).where(eq(materiasTable.id, id));
      if (materia.length === 0) {
        return c.json({ error: 'Materia not found' }, 404);
      }
      return c.json(materia[0]);
    })
    // GET tareas by materia ID
    .get('/:id/tareas', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      
      // Check if materia exists
      const materia = await db.select().from(materiasTable).where(eq(materiasTable.id, id));
      if (materia.length === 0) {
        return c.json({ error: 'Materia not found' }, 404);
      }
      
      const tareas = await db.select().from(tareasTable).where(eq(tareasTable.materiaId, id));
      return c.json(tareas);
    })
    // POST create new materia
    .post('/', async (c: Context) => {
      const body = await c.req.json();
      const { titulo, sigla } = body;
      
      // Validation
      if (!titulo || !sigla) {
        return c.json({ error: 'Missing required fields: titulo, sigla' }, 400);
      }
      
      // Sigla format validation (e.g., 3-10 uppercase letters/numbers)
      if (sigla.length < 2 || sigla.length > 10) {
        return c.json({ error: 'Sigla must be between 2 and 10 characters' }, 400);
      }
      
      try {
        const newMateria = await db
          .insert(materiasTable)
          .values({ titulo, sigla })
          .returning();
        return c.json(newMateria, 201);
      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed') || 
            error.cause?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return c.json({ error: 'Sigla already exists' }, 409);
        }
        throw error;
      }
    })
    // PUT update materia
    .put('/:id', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      
      const body = await c.req.json();
      const { titulo, sigla } = body;
      
      // Check if materia exists
      const existing = await db.select().from(materiasTable).where(eq(materiasTable.id, id));
      if (existing.length === 0) {
        return c.json({ error: 'Materia not found' }, 404);
      }
      
      // Sigla format validation if provided
      if (sigla && (sigla.length < 2 || sigla.length > 10)) {
        return c.json({ error: 'Sigla must be between 2 and 10 characters' }, 400);
      }
      
      try {
        const updatedMateria = await db
          .update(materiasTable)
          .set({ 
            titulo: titulo ?? existing[0].titulo, 
            sigla: sigla ?? existing[0].sigla 
          })
          .where(eq(materiasTable.id, id))
          .returning();
        return c.json(updatedMateria[0]);
      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed') || 
            error.cause?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return c.json({ error: 'Sigla already exists' }, 409);
        }
        throw error;
      }
    })
    // DELETE materia
    .delete('/:id', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      
      const existing = await db.select().from(materiasTable).where(eq(materiasTable.id, id));
      if (existing.length === 0) {
        return c.json({ error: 'Materia not found' }, 404);
      }
      
      // Check if materia has associated tareas
      const tareas = await db.select().from(tareasTable).where(eq(tareasTable.materiaId, id));
      if (tareas.length > 0) {
        return c.json({ error: 'Cannot delete materia with associated tareas' }, 409);
      }
      
      await db.delete(materiasTable).where(eq(materiasTable.id, id));
      return c.json({ message: 'Materia deleted successfully' });
    });
}
