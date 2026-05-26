import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add Secretary of State agency (used by frontend)
  const exists = await knex('agencies').where({ code: 'SOS' }).first();
  if (!exists) {
    await knex('agencies').insert({
      id: 'a1b2c3d4-1111-4000-8000-000000000009',
      code: 'SOS',
      name: 'Secretary of State',
      abbreviation: 'SOS',
      status: 'ACTIVE',
    });
  }

  // Fix DHHS code (was DHH in original seed)
  await knex('agencies').where({ code: 'DHH' }).update({ code: 'DHHS' });
  await knex('records').where({ agency_code: 'DHH' }).update({ agency_code: 'DHHS' });
}

export async function down(knex: Knex): Promise<void> {
  await knex('agencies').where({ code: 'SOS' }).del();
  await knex('agencies').where({ code: 'DHHS' }).update({ code: 'DHH' });
  await knex('records').where({ agency_code: 'DHHS' }).update({ agency_code: 'DHH' });
}