import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('records', (table) => {
    table.string('document_key', 500);
    table.boolean('has_document').defaultTo(false);
    table.string('ocr_status', 20);
    table.string('classification_status', 20);
    table.jsonb('ai_tags');
    table.float('ai_confidence');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('records', (table) => {
    table.dropColumn('document_key');
    table.dropColumn('has_document');
    table.dropColumn('ocr_status');
    table.dropColumn('classification_status');
    table.dropColumn('ai_tags');
    table.dropColumn('ai_confidence');
  });
}