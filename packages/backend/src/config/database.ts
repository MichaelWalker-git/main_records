import knex, { Knex } from 'knex';
import { config } from './index';

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
