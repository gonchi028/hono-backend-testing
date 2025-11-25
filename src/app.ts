import { Hono } from 'hono';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

import { createAlumnosRoutes } from './routes/alumnos.js';
import { createMateriasRoutes } from './routes/materias.js';
import { createTareasRoutes } from './routes/tareas.js';

export function createApp(db: LibSQLDatabase) {
  const app = new Hono()
    .route('/alumnos', createAlumnosRoutes(db))
    .route('/materias', createMateriasRoutes(db))
    .route('/tareas', createTareasRoutes(db));

  return app;
}

export type AppType = ReturnType<typeof createApp>;
