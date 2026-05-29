import knex, { Knex } from 'knex';
import { types } from 'pg';
import { config } from './index';

// PostgreSQL returns DATE columns (oid 1082) as JS Date objects parsed in
// the server's local timezone by default, then JSON-serialised back to a
// UTC ISO string — which off-by-ones the day in any timezone west of UTC.
// Force the raw "YYYY-MM-DD" string so frontend renders the same date
// the archivist typed.
types.setTypeParser(1082, (value: string) => value);

const isEcs = !!process.env.DB_HOST;

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    connectionString: config.databaseUrl,
    ssl: isEcs ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 5000,
  },
  acquireConnectionTimeout: 5000,
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations',
  },
};

export const db = knex(knexConfig);
export default knexConfig;
