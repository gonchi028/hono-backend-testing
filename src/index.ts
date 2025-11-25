import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { alumnosRoutes } from './alumnosRoutes.js';
import { materiasRoutes } from './materiasRoutes.js';
import { tareasRoutes } from './tareasRoutes.js';

export const app = new Hono()
  .route('/alumnos', alumnosRoutes)
  .route('/materias', materiasRoutes)
  .route('/tareas', tareasRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
