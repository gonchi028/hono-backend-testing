import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { db } from './db/db.js';

export const app = createApp(db);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
