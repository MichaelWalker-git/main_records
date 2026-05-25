import knex, { Knex } from 'knex';
import { config } from './index';

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: config.databaseUrl,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations',
  },
};

export const db = knex(knexConfig);
export default knexConfig;
