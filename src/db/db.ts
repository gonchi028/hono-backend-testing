import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

const client = createClient({ url: 'file:local.db' });
export const db = drizzle({ client });

// Factory function for creating test databases
export function createTestDb(url: string = ':memory:'): LibSQLDatabase {
  const testClient = createClient({ url });
  return drizzle({ client: testClient });
}

export type Database = LibSQLDatabase;
