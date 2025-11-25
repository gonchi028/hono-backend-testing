import { Hono } from 'hono';
import type { Context } from 'hono';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';

import { tareasTable, materiasTable } from '../db/schema.js';

export function createTareasRoutes(db: LibSQLDatabase) {
  return new Hono()
    // GET all tareas
    .get('/', async (c: Context) => {
      const tareasData = await db.select().from(tareasTable);
      return c.json(tareasData);
    })
    // GET tarea by ID
    .get('/:id', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      const tarea = await db.select().from(tareasTable).where(eq(tareasTable.id, id));
      if (tarea.length === 0) {
        return c.json({ error: 'Tarea not found' }, 404);
      }
      return c.json(tarea[0]);
    })
    // POST create new tarea
    .post('/', async (c: Context) => {
      const body = await c.req.json();
      const { descripcion, calificacion, materiaId } = body;
      
      // Validation
      if (!descripcion || calificacion === undefined || !materiaId) {
        return c.json({ error: 'Missing required fields: descripcion, calificacion, materiaId' }, 400);
      }
      
      if (typeof calificacion !== 'number' || calificacion < 0 || calificacion > 100) {
        return c.json({ error: 'Calificacion must be a number between 0 and 100' }, 400);
      }
      
      // Check if materia exists
      const materia = await db.select().from(materiasTable).where(eq(materiasTable.id, materiaId));
      if (materia.length === 0) {
        return c.json({ error: 'Materia not found' }, 404);
      }
      
      const newTarea = await db
        .insert(tareasTable)
        .values({ descripcion, calificacion, materiaId })
        .returning();
      return c.json(newTarea, 201);
    })
    // PUT update tarea
    .put('/:id', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      
      const body = await c.req.json();
      const { descripcion, calificacion, materiaId } = body;
      
      // Check if tarea exists
      const existing = await db.select().from(tareasTable).where(eq(tareasTable.id, id));
      if (existing.length === 0) {
        return c.json({ error: 'Tarea not found' }, 404);
      }
      
      // Validate calificacion if provided
      if (calificacion !== undefined && (typeof calificacion !== 'number' || calificacion < 0 || calificacion > 100)) {
        return c.json({ error: 'Calificacion must be a number between 0 and 100' }, 400);
      }
      
      // Validate materiaId if provided
      if (materiaId !== undefined) {
        const materia = await db.select().from(materiasTable).where(eq(materiasTable.id, materiaId));
        if (materia.length === 0) {
          return c.json({ error: 'Materia not found' }, 404);
        }
      }
      
      const updatedTarea = await db
        .update(tareasTable)
        .set({ 
          descripcion: descripcion ?? existing[0].descripcion, 
          calificacion: calificacion ?? existing[0].calificacion,
          materiaId: materiaId ?? existing[0].materiaId
        })
        .where(eq(tareasTable.id, id))
        .returning();
      return c.json(updatedTarea[0]);
    })
    // DELETE tarea
    .delete('/:id', async (c: Context) => {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ID' }, 400);
      }
      
      const existing = await db.select().from(tareasTable).where(eq(tareasTable.id, id));
      if (existing.length === 0) {
        return c.json({ error: 'Tarea not found' }, 404);
      }
      
      await db.delete(tareasTable).where(eq(tareasTable.id, id));
      return c.json({ message: 'Tarea deleted successfully' });
    });
}
