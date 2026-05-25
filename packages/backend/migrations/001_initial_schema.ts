import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('agencies', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('code', 10).notNullable().unique();
    table.string('name', 255).notNullable();
    table.string('abbreviation', 20).notNullable();
    table.string('status', 20).notNullable().defaultTo('ACTIVE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('cognito_sub', 255).unique();
    table.uuid('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
    table.string('status', 20).notNullable().defaultTo('ACTIVE');
    table.string('phone', 20);
    table.timestamp('last_login_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['agency_id']);
    table.index(['status']);
  });

  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 50).notNullable().unique();
    table.string('display_name', 100).notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('user_roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.uuid('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'role_id', 'agency_id']);
  });

  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.string('resource', 100).notNullable();
    table.string('action', 50).notNullable();
    table.jsonb('conditions');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['role_id']);
  });

  await knex.schema.createTable('retention_schedules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('series_code', 50).notNullable().unique();
    table.integer('retention_period_days');
    table.string('disposition_action', 50).notNullable();
    table.text('legal_authority');
    table.text('description');
    table.jsonb('alert_thresholds').defaultTo('[90, 30, 7]');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('schedule_alerts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('retention_schedule_id').notNullable().references('id').inTable('retention_schedules').onDelete('CASCADE');
    table.integer('days_before').notNullable();
    table.string('alert_type', 50).notNullable();
    table.jsonb('recipients');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('warehouses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('code', 10).notNullable().unique();
    table.text('address').notNullable();
    table.integer('total_capacity').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('locations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('warehouse_id').notNullable().references('id').inTable('warehouses').onDelete('CASCADE');
    table.string('code', 20).notNullable().unique();
    table.string('row', 10).notNullable();
    table.string('bay', 10).notNullable();
    table.string('shelf', 10).notNullable();
    table.string('position', 10).notNullable();
    table.boolean('is_occupied').defaultTo(false);
    table.uuid('occupied_by');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['warehouse_id']);
    table.index(['is_occupied']);
  });

  await knex.schema.createTable('records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('agency_id').notNullable().references('id').inTable('agencies').onDelete('RESTRICT');
    table.string('agency_code', 10).notNullable();
    table.uuid('retention_schedule_id').references('id').inTable('retention_schedules').onDelete('SET NULL');
    table.string('series_title', 255).notNullable();
    table.string('title', 500).notNullable();
    table.string('media_type', 20).notNullable();
    table.string('status', 30).notNullable().defaultTo('ACTIVE');
    table.string('container_number', 50);
    table.string('box_number', 20);
    table.string('location_code', 20);
    table.string('transmittal_number', 50);
    table.date('date_from');
    table.date('date_to');
    table.text('description');
    table.jsonb('custom_metadata');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('updated_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['agency_id']);
    table.index(['status']);
    table.index(['retention_schedule_id']);
    table.index(['location_code']);
    table.index(['media_type']);
    table.index(['date_from', 'date_to']);
  });

  await knex.schema.createTable('record_metadata', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('record_id').notNullable().references('id').inTable('records').onDelete('CASCADE');
    table.string('key', 100).notNullable();
    table.text('value');
    table.string('data_type', 20).defaultTo('string');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['record_id']);
    table.unique(['record_id', 'key']);
  });

  await knex.schema.createTable('record_tags', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('record_id').notNullable().references('id').inTable('records').onDelete('CASCADE');
    table.string('tag', 100).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['record_id']);
    table.index(['tag']);
  });

  await knex.schema.createTable('record_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.uuid('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
    table.jsonb('field_definitions').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('transmittals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('transmittal_number', 50).notNullable().unique();
    table.uuid('agency_id').notNullable().references('id').inTable('agencies').onDelete('RESTRICT');
    table.string('status', 30).notNullable().defaultTo('DRAFT');
    table.uuid('submitted_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('submitted_at');
    table.uuid('approved_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('approved_at');
    table.timestamp('received_at');
    table.timestamp('shelved_at');
    table.integer('total_boxes').defaultTo(0);
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['agency_id']);
    table.index(['status']);
  });

  await knex.schema.createTable('transmittal_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('transmittal_id').notNullable().references('id').inTable('transmittals').onDelete('CASCADE');
    table.uuid('record_id').references('id').inTable('records').onDelete('SET NULL');
    table.string('box_number', 20);
    table.string('series_title', 255);
    table.date('date_from');
    table.date('date_to');
    table.string('location_code', 20);
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['transmittal_id']);
  });

  await knex.schema.createTable('transmittal_approvals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('transmittal_id').notNullable().references('id').inTable('transmittals').onDelete('CASCADE');
    table.uuid('approver_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('action', 20).notNullable();
    table.text('comments');
    table.timestamp('acted_at').defaultTo(knex.fn.now());
    table.index(['transmittal_id']);
  });

  await knex.schema.createTable('dispositions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('disposition_number', 50).notNullable().unique();
    table.uuid('agency_id').notNullable().references('id').inTable('agencies').onDelete('RESTRICT');
    table.uuid('retention_schedule_id').references('id').inTable('retention_schedules').onDelete('SET NULL');
    table.string('action', 30).notNullable();
    table.string('status', 30).notNullable().defaultTo('DRAFT');
    table.uuid('requested_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('requested_at');
    table.timestamp('approved_at');
    table.timestamp('executed_at');
    table.text('justification');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['agency_id']);
    table.index(['status']);
  });

  await knex.schema.createTable('disposition_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('disposition_id').notNullable().references('id').inTable('dispositions').onDelete('CASCADE');
    table.uuid('record_id').notNullable().references('id').inTable('records').onDelete('CASCADE');
    table.string('status', 20).defaultTo('PENDING');
    table.timestamp('processed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['disposition_id']);
  });

  await knex.schema.createTable('disposition_approvals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('disposition_id').notNullable().references('id').inTable('dispositions').onDelete('CASCADE');
    table.uuid('approver_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('action', 20).notNullable();
    table.text('comments');
    table.timestamp('acted_at').defaultTo(knex.fn.now());
    table.index(['disposition_id']);
  });

  await knex.schema.createTable('legal_holds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('hold_number', 50).notNullable().unique();
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('status', 20).notNullable().defaultTo('ACTIVE');
    table.uuid('issued_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('issued_at');
    table.timestamp('released_at');
    table.text('legal_basis');
    table.text('custodian');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['status']);
  });

  await knex.schema.createTable('legal_hold_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('legal_hold_id').notNullable().references('id').inTable('legal_holds').onDelete('CASCADE');
    table.uuid('record_id').notNullable().references('id').inTable('records').onDelete('CASCADE');
    table.timestamp('added_at').defaultTo(knex.fn.now());
    table.uuid('added_by').references('id').inTable('users').onDelete('SET NULL');
    table.unique(['legal_hold_id', 'record_id']);
  });

  await knex.schema.createTable('circulation_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('record_id').notNullable().references('id').inTable('records').onDelete('CASCADE');
    table.string('event_type', 30).notNullable();
    table.uuid('requested_by').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('checked_out_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('checked_out_at');
    table.timestamp('due_date');
    table.timestamp('returned_at');
    table.text('purpose');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['record_id']);
    table.index(['event_type']);
    table.index(['checked_out_by']);
  });

  await knex.schema.createTable('reference_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('request_number', 50).notNullable().unique();
    table.uuid('requester_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('requester_name', 200);
    table.string('requester_email', 255);
    table.string('requester_agency', 255);
    table.text('description').notNullable();
    table.string('status', 30).notNullable().defaultTo('NEW');
    table.string('priority', 20).defaultTo('NORMAL');
    table.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('due_date');
    table.timestamp('completed_at');
    table.text('response');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['status']);
    table.index(['assigned_to']);
  });

  await knex.schema.createTable('audit_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('event_type', 50).notNullable();
    table.string('entity_type', 50).notNullable();
    table.uuid('entity_id');
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('user_email', 255);
    table.specificType('ip_address', 'inet');
    table.string('user_agent', 500);
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.jsonb('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['entity_type', 'entity_id']);
    table.index(['user_id']);
    table.index(['event_type']);
    table.index(['created_at']);
  });

  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type', 50).notNullable();
    table.string('title', 255).notNullable();
    table.text('message');
    table.string('entity_type', 50);
    table.uuid('entity_id');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    table.jsonb('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['user_id', 'is_read']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('audit_events');
  await knex.schema.dropTableIfExists('reference_requests');
  await knex.schema.dropTableIfExists('circulation_events');
  await knex.schema.dropTableIfExists('legal_hold_records');
  await knex.schema.dropTableIfExists('legal_holds');
  await knex.schema.dropTableIfExists('disposition_approvals');
  await knex.schema.dropTableIfExists('disposition_items');
  await knex.schema.dropTableIfExists('dispositions');
  await knex.schema.dropTableIfExists('transmittal_approvals');
  await knex.schema.dropTableIfExists('transmittal_items');
  await knex.schema.dropTableIfExists('transmittals');
  await knex.schema.dropTableIfExists('record_templates');
  await knex.schema.dropTableIfExists('record_tags');
  await knex.schema.dropTableIfExists('record_metadata');
  await knex.schema.dropTableIfExists('records');
  await knex.schema.dropTableIfExists('locations');
  await knex.schema.dropTableIfExists('warehouses');
  await knex.schema.dropTableIfExists('schedule_alerts');
  await knex.schema.dropTableIfExists('retention_schedules');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('agencies');
}
