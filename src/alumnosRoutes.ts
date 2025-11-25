import { Hono } from 'hono';
import type { Context } from 'hono';

import { db } from './db/db.js';
import { alumnosTable } from './db/schema.js';

export const alumnosRoutes = new Hono()
  .get('/', async (c: Context) => {
    const alumnosData = await db.select().from(alumnosTable);
    return c.json(alumnosData);
  })
  .post('/', async (c: Context) => {
    const { nombre, apellido, correo } = await c.req.json();
    const newAlumno = await db
      .insert(alumnosTable)
      .values({ nombre, apellido, correo })
      .returning();
    return c.json(newAlumno);
  });
