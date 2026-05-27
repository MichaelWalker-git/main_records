import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Extensions (pg_trgm is always available; pgvector requires Aurora 15.4+)
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  try {
    await knex.raw(`CREATE EXTENSION IF NOT EXISTS vector`);
  } catch (err) {
    console.warn('pgvector extension not available - semantic search will be disabled');
  }

  // --- Core identity tables ---

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
    table.string('cognito_id', 255).unique();
    table.string('email', 255).notNullable().unique();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.uuid('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
    table.specificType('roles', 'text[]').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['agency_id']);
    table.index(['is_active']);
  });

  // --- Configuration tables ---

  await knex.schema.createTable('retention_schedules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('code', 50).notNullable().unique();
    table.text('description');
    table.integer('retention_years').notNullable();
    table.string('disposition_action', 50).notNullable();
    table.uuid('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.integer('alert_days_before').defaultTo(90);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('locations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('code', 50).notNullable().unique();
    table.uuid('parent_id').references('id').inTable('locations').onDelete('SET NULL');
    table.string('location_type', 20).notNullable(); // building, floor, room, shelf, box
    table.integer('capacity').notNullable().defaultTo(0);
    table.integer('current_count').notNullable().defaultTo(0);
    table.uuid('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['parent_id']);
    table.index(['location_type']);
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

  // --- Core records table ---

  await knex.schema.createTable('records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 500).notNullable();
    table.text('description');
    table.string('record_type', 50);
    table.uuid('agency_id').notNullable().references('id').inTable('agencies').onDelete('RESTRICT');
    table.string('agency_code', 10).notNullable();
    table.uuid('template_id').references('id').inTable('record_templates').onDelete('SET NULL');
    table.uuid('retention_schedule_id').references('id').inTable('retention_schedules').onDelete('SET NULL');
    table.string('series_title', 255);
    table.string('media_type', 50).notNullable().defaultTo('PHYSICAL');
    table.string('tracking_number', 50).unique();
    table.string('barcode', 50);
    table.string('status', 30).notNullable().defaultTo('active');
    table.date('disposition_date');
    table.string('container_number', 50);
    table.string('box_number', 20);
    table.string('location_code', 50);
    table.uuid('location_id').references('id').inTable('locations').onDelete('SET NULL');
    table.string('transmittal_number', 50);
    table.date('date_from');
    table.date('date_to');
    table.jsonb('metadata');
    table.jsonb('custom_metadata');
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('updated_by').references('id').inTable('users').onDelete('SET NULL');
    // Document processing columns
    table.string('document_key', 500);
    table.boolean('has_document').defaultTo(false);
    table.string('ocr_status', 20);
    table.string('classification_status', 20);
    table.jsonb('ai_tags');
    table.float('ai_confidence');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['agency_id']);
    table.index(['status']);
    table.index(['retention_schedule_id']);
    table.index(['location_code']);
    table.index(['media_type']);
    table.index(['date_from', 'date_to']);
    table.index(['tracking_number']);
    table.index(['barcode']);
  });

  // Full-text search vector (generated column)
  await knex.raw(`
    ALTER TABLE records
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(series_title, '') || ' ' ||
        coalesce(media_type, '')
      )
    ) STORED
  `);
  await knex.raw(`CREATE INDEX idx_records_search_vector ON records USING GIN (search_vector)`);
  await knex.raw(`CREATE INDEX idx_records_title_trgm ON records USING GIN (title gin_trgm_ops)`);

  // Semantic search embedding (Bedrock Titan v2 = 1024 dimensions)
  // Only add if pgvector extension was successfully created
  try {
    await knex.raw(`ALTER TABLE records ADD COLUMN embedding vector(1024)`);
    await knex.raw(`
      CREATE INDEX idx_records_embedding ON records
      USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 64)
    `);
  } catch (err) {
    console.warn('pgvector column/index skipped - extension not available');
  }

  // --- Record support tables ---

  await knex.schema.createTable('record_tags', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('record_id').notNullable().references('id').inTable('records').onDelete('CASCADE');
    table.string('tag', 100).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['record_id']);
    table.index(['tag']);
  });

  // --- Transmittals ---

  await knex.schema.createTable('transmittals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description');
    table.uuid('agency_id').notNullable().references('id').inTable('agencies').onDelete('RESTRICT');
    table.string('status', 30).notNullable().defaultTo('draft');
    table.uuid('submitted_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('submitted_at');
    table.uuid('approved_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('approved_at');
    table.uuid('received_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('received_at');
    table.text('rejection_reason');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['agency_id']);
    table.index(['status']);
  });

  await knex.schema.createTable('transmittal_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('transmittal_id').notNullable().references('id').inTable('transmittals').onDelete('CASCADE');
    table.uuid('record_id').references('id').inTable('records').onDelete('SET NULL');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['transmittal_id']);
  });

  // --- Dispositions ---

  await knex.schema.createTable('dispositions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description');
    table.uuid('agency_id').notNullable().references('id').inTable('agencies').onDelete('RESTRICT');
    table.string('disposition_action', 50).notNullable();
    table.string('status', 30).notNullable().defaultTo('draft');
    table.uuid('initiated_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('initiated_at');
    table.uuid('first_approver_id').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('first_approved_at');
    table.uuid('second_approver_id').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('second_approved_at');
    table.uuid('third_approver_id').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('third_approved_at');
    table.string('certificate_number', 100);
    table.text('rejection_reason');
    table.timestamp('completed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['agency_id']);
    table.index(['status']);
  });

  await knex.schema.createTable('disposition_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('disposition_id').notNullable().references('id').inTable('dispositions').onDelete('CASCADE');
    table.uuid('record_id').notNullable().references('id').inTable('records').onDelete('CASCADE');
    table.boolean('has_legal_hold').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['disposition_id']);
  });

  // --- Legal holds ---

  await knex.schema.createTable('legal_holds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('record_id').notNullable().references('id').inTable('records').onDelete('CASCADE');
    table.text('reason').notNullable();
    table.uuid('placed_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('placed_at').defaultTo(knex.fn.now());
    table.uuid('released_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('released_at');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['record_id']);
    table.index(['is_active']);
  });

  // --- Circulation ---

  await knex.schema.createTable('circulation_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('record_id').notNullable().references('id').inTable('records').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('event_type', 30).notNullable(); // checkout, checkin
    table.text('purpose');
    table.timestamp('checked_out_at');
    table.timestamp('due_date');
    table.timestamp('checked_in_at');
    table.text('notes');
    table.uuid('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['record_id']);
    table.index(['event_type']);
    table.index(['user_id']);
    table.index(['due_date']);
  });

  // --- Reference requests ---

  await knex.schema.createTable('reference_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('requester_name', 200).notNullable();
    table.string('requester_email', 255).notNullable();
    table.string('requester_phone', 20);
    table.uuid('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
    table.text('description').notNullable();
    table.specificType('record_types', 'text[]').defaultTo('{}');
    table.date('date_range_start');
    table.date('date_range_end');
    table.string('status', 30).notNullable().defaultTo('new');
    table.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL');
    table.text('response_notes');
    table.timestamp('completed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['status']);
    table.index(['assigned_to']);
  });

  // --- Audit log ---

  await knex.schema.createTable('audit_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('user_email', 255);
    table.uuid('agency_id').references('id').inTable('agencies').onDelete('SET NULL');
    table.string('action', 100).notNullable();
    table.string('resource_type', 50).notNullable();
    table.uuid('resource_id');
    table.jsonb('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['user_id']);
    table.index(['agency_id']);
    table.index(['resource_type', 'resource_id']);
    table.index(['action']);
    table.index(['created_at']);
  });

  // --- Notifications ---

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
  await knex.schema.dropTableIfExists('legal_holds');
  await knex.schema.dropTableIfExists('disposition_items');
  await knex.schema.dropTableIfExists('dispositions');
  await knex.schema.dropTableIfExists('transmittal_items');
  await knex.schema.dropTableIfExists('transmittals');
  await knex.schema.dropTableIfExists('record_tags');
  await knex.raw('ALTER TABLE records DROP COLUMN IF EXISTS embedding');
  await knex.raw('ALTER TABLE records DROP COLUMN IF EXISTS search_vector');
  await knex.schema.dropTableIfExists('records');
  await knex.schema.dropTableIfExists('record_templates');
  await knex.schema.dropTableIfExists('locations');
  await knex.schema.dropTableIfExists('retention_schedules');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('agencies');
  await knex.raw('DROP EXTENSION IF EXISTS vector');
  await knex.raw('DROP EXTENSION IF EXISTS pg_trgm');
}