import { Hono } from 'hono';
import type { Context } from 'hono';

import { db } from './db/db.js';
import { tareasTable } from './db/schema.js';

export const tareasRoutes = new Hono()
  .get('/', async (c: Context) => {
    const tareasData = await db.select().from(tareasTable);
    return c.json(tareasData);
  })
  .post('/', async (c: Context) => {
    const { descripcion, calificacion, materiaId } = await c.req.json();
    const newTarea = await db
      .insert(tareasTable)
      .values({ descripcion, calificacion, materiaId })
      .returning();
    return c.json(newTarea);
  });
