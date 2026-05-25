import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable pgvector extension (available on Aurora PostgreSQL 15.4+)
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS vector`);

  // Add embedding column (1024 dimensions for Titan Embeddings v2)
  await knex.raw(`
    ALTER TABLE records
    ADD COLUMN IF NOT EXISTS embedding vector(1024)
  `);

  // Create HNSW index for fast approximate nearest neighbor search
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_records_embedding
    ON records USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS idx_records_embedding`);
  await knex.raw(`ALTER TABLE records DROP COLUMN IF EXISTS embedding`);
  await knex.raw(`DROP EXTENSION IF EXISTS vector`);
}