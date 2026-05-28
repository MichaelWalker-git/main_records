import { Knex } from 'knex';

// RFP Block 3 box-label set: umbrella/unit/subunit hierarchy, secondary agency,
// explicit dispo_date alongside the existing computed disposition_date, and a
// vacant_location flag for inventory shelf slots.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('records', (table) => {
    table.string('umbrella', 100);
    table.string('unit', 100);
    table.string('subunit', 100);
    table.string('agency_3', 50);
    table.string('tr_number', 50);
    table.date('dispo_date');
    table.boolean('rfid_enabled').defaultTo(false);
  });

  await knex.schema.alterTable('locations', (table) => {
    table.boolean('vacant_location').defaultTo(false);
    table.boolean('rfid_enabled').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('records', (table) => {
    table.dropColumn('umbrella');
    table.dropColumn('unit');
    table.dropColumn('subunit');
    table.dropColumn('agency_3');
    table.dropColumn('tr_number');
    table.dropColumn('dispo_date');
    table.dropColumn('rfid_enabled');
  });

  await knex.schema.alterTable('locations', (table) => {
    table.dropColumn('vacant_location');
    table.dropColumn('rfid_enabled');
  });
}
