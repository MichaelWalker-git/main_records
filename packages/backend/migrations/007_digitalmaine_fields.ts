import { Knex } from 'knex';

// digitalmaine.com-style classification metadata. Stored as flat columns on
// records so they can be queried, indexed and round-tripped through the typed
// API surface (in contrast to the free-form metadata JSONB column and to
// record_tags which holds user-applied tags rather than AI-extracted keywords).
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('records', (table) => {
    table.string('contributing_institution', 255).defaultTo('Maine State Archives');
    table.string('document_type_dm', 50);
    table.string('dm_identifier', 100);
    table.date('exact_creation_date');
    table.string('doc_language', 50);
    table.string('doc_location', 255);
    table.specificType('keywords', 'text[]').defaultTo(knex.raw("'{}'::text[]"));
    table.text('recommended_citation');
  });

  await knex.raw(`CREATE INDEX IF NOT EXISTS records_keywords_gin_idx ON records USING GIN (keywords)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS records_doc_location_idx ON records (doc_location)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS records_keywords_gin_idx`);
  await knex.raw(`DROP INDEX IF EXISTS records_doc_location_idx`);

  await knex.schema.alterTable('records', (table) => {
    table.dropColumn('contributing_institution');
    table.dropColumn('document_type_dm');
    table.dropColumn('dm_identifier');
    table.dropColumn('exact_creation_date');
    table.dropColumn('doc_language');
    table.dropColumn('doc_location');
    table.dropColumn('keywords');
    table.dropColumn('recommended_citation');
  });
}
