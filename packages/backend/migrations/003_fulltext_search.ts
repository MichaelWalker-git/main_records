import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add a generated tsvector column for fast full-text search
  await knex.raw(`
    ALTER TABLE records
    ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(series_title, '') || ' ' ||
        coalesce(media_type, '')
      )
    ) STORED
  `);

  // Create GIN index for fast full-text search
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_records_search_vector
    ON records USING GIN (search_vector)
  `);

  // Trigram index for fuzzy/partial matching
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_records_title_trgm
    ON records USING GIN (title gin_trgm_ops)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS idx_records_title_trgm`);
  await knex.raw(`DROP INDEX IF EXISTS idx_records_search_vector`);
  await knex.raw(`ALTER TABLE records DROP COLUMN IF EXISTS search_vector`);
}