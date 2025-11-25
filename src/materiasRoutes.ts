import { Hono } from 'hono';
import type { Context } from 'hono';

import { db } from './db/db.js';
import { materiasTable } from './db/schema.js';

export const materiasRoutes = new Hono()
  .get('/', async (c: Context) => {
    const materiasData = await db.select().from(materiasTable);
    return c.json(materiasData);
  })
  .post('/', async (c: Context) => {
    const { titulo, sigla } = await c.req.json();
    const newMateria = await db
      .insert(materiasTable)
      .values({ titulo, sigla })
      .returning();
    return c.json(newMateria);
  });
