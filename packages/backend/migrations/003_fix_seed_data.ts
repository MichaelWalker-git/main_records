import { Knex } from 'knex';

/**
 * Migration 003: Enhance deployed data for demo
 * - Schema: adds missing columns to transmittals + transmittal_items
 * - Adds SOS agency, fixes DHH → DHHS
 * - Converts location codes to 8-digit format (BBFFRRSS per REC-03)
 * - Updates retention schedule codes to GRS-* format
 * - Adds templates, extra records, transmittals, dispositions, notifications, audit events
 */
export async function up(knex: Knex): Promise<void> {
  // ============================================================
  // SCHEMA CHANGES (columns missing from deployed 001)
  // ============================================================

  // --- Add missing columns to transmittals ---
  const hasItemCount = await knex.schema.hasColumn('transmittals', 'item_count');
  if (!hasItemCount) {
    await knex.schema.alterTable('transmittals', (table) => {
      table.integer('item_count').defaultTo(0);
      table.text('notes');
    });
  }

  // --- Add missing columns to transmittal_items ---
  const hasBoxNumber = await knex.schema.hasColumn('transmittal_items', 'box_number');
  if (!hasBoxNumber) {
    await knex.schema.alterTable('transmittal_items', (table) => {
      table.string('box_number', 50);
      table.text('description');
      table.string('series_title', 255);
      table.string('date_range', 100);
    });
  }

  // ============================================================
  // DATA FIXES
  // ============================================================

  // --- Add SOS agency ---
  const sosExists = await knex('agencies').where({ code: 'SOS' }).first();
  if (!sosExists) {
    await knex('agencies').insert({
      id: 'a1b2c3d4-1111-4000-8000-000000000009',
      code: 'SOS',
      name: 'Secretary of State',
      abbreviation: 'SOS',
      status: 'ACTIVE',
    });
  }

  // --- Fix DHH → DHHS ---
  await knex('agencies').where({ code: 'DHH' }).update({ code: 'DHHS' });
  await knex('records').where({ agency_code: 'DHH' }).update({ agency_code: 'DHHS' });

  // --- Convert location codes to 8-digit format (BBFFRRSS) ---
  const locationCodeMap: Record<string, string> = {
    'SRC-AUG': '01000000',
    'SRC-AUG-F1': '01010000',
    'SRC-AUG-F2': '01020000',
    'SRC-AUG-F1-A': '01010100',
    'SRC-AUG-F1-B': '01010200',
    'SRC-AUG-F1-A-01': '01010101',
    'SRC-AUG-F1-A-02': '01010102',
    'SRC-BAN': '02000000',
    'SRC-PTL': '03000000',
  };

  for (const [oldCode, newCode] of Object.entries(locationCodeMap)) {
    await knex('locations').where({ code: oldCode }).update({ code: newCode });
  }

  // Update record location_codes to match
  await knex('records').where({ location_code: 'SRC-AUG-F1-A-01' }).update({ location_code: '01010101' });
  await knex('records').where({ location_code: 'SRC-AUG-F1-A-02' }).update({ location_code: '01010102' });
  await knex('records').where({ location_code: 'SRC-AUG-F1-B' }).update({ location_code: '01010200' });

  // Fix barcodes to use tracking number format + proper container numbers
  await knex('records').where({ barcode: 'BOX-DHH-0001' }).update({ barcode: 'RMS-20240115-0001', container_number: 'BOX-DHHS-2023-0001' });
  await knex('records').where({ barcode: 'BOX-DOT-0002' }).update({ barcode: 'RMS-20240115-0002', container_number: 'BOX-DOT-2023-0001' });
  await knex('records').where({ barcode: 'BOX-DOE-0004' }).update({ barcode: 'RMS-20240115-0004', container_number: 'BOX-DOE-2023-0001' });
  await knex('records').where({ barcode: 'BOX-AGO-0005' }).update({ barcode: 'RMS-20240115-0005', container_number: 'BOX-AGO-2023-0001' });

  // --- Update retention schedule codes to GRS-* ---
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000001' }).update({ code: 'GRS-1', description: 'General administrative records including correspondence, memos, and routine operational documents' });
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000002' }).update({ code: 'GRS-2', description: 'Financial and accounting records including budgets, invoices, and audit reports' });
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000003' }).update({ code: 'GRS-3', description: 'Employee personnel files including hiring, performance, and separation records' });
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000004' }).update({ code: 'GRS-4', description: 'Legal case files - permanent retention per 5 MRSA §95-C' });
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000005' }).update({ code: 'GRS-5', description: 'General correspondence not associated with a specific case or project' });

  // Add two more retention schedules
  const grs6Exists = await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000006' }).first();
  if (!grs6Exists) {
    await knex('retention_schedules').insert([
      { id: 'f6a7b8c9-6666-4000-8000-000000000006', name: 'Permits and Licenses', code: 'GRS-6', retention_years: 10, disposition_action: 'DESTROY', description: 'Permits, licenses, and certifications issued by state agencies', alert_days_before: 60, is_active: true },
      { id: 'f6a7b8c9-6666-4000-8000-000000000007', name: 'Meeting Minutes', code: 'GRS-7', retention_years: 25, disposition_action: 'TRANSFER_TO_ARCHIVES', description: 'Official meeting minutes of boards, commissions, and committees', alert_days_before: 90, is_active: true },
    ]);
  }

  // ============================================================
  // NEW DATA
  // ============================================================

  // --- Additional locations (shelves + Aisle C) ---
  const newLocations = [
    { id: 'd4e5f6a7-4444-4000-8000-000000000010', name: 'Shelf A-03', code: '01010103', parent_id: 'd4e5f6a7-4444-4000-8000-000000000004', location_type: 'shelf', capacity: 50, current_count: 45, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
    { id: 'd4e5f6a7-4444-4000-8000-000000000011', name: 'Aisle C', code: '01010300', parent_id: 'd4e5f6a7-4444-4000-8000-000000000002', location_type: 'room', capacity: 500, current_count: 376, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
    { id: 'd4e5f6a7-4444-4000-8000-000000000012', name: 'Shelf B-01', code: '01010201', parent_id: 'd4e5f6a7-4444-4000-8000-000000000005', location_type: 'shelf', capacity: 50, current_count: 48, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
    { id: 'd4e5f6a7-4444-4000-8000-000000000013', name: 'Shelf B-02', code: '01010202', parent_id: 'd4e5f6a7-4444-4000-8000-000000000005', location_type: 'shelf', capacity: 50, current_count: 35, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
  ];
  for (const loc of newLocations) {
    const exists = await knex('locations').where({ id: loc.id }).first();
    if (!exists) await knex('locations').insert(loc);
  }

  // --- Record templates ---
  const templatesExist = await knex('record_templates').first();
  if (!templatesExist) {
    await knex('record_templates').insert([
      { id: 'c1d2e3f4-3333-4000-8000-000000000001', name: 'Physical Box Transfer', description: 'Standard template for physical box transfers to Archives', agency_id: null, field_definitions: JSON.stringify([{ name: 'container_number', label: 'Container Number', type: 'text', required: true }, { name: 'box_number', label: 'Box Number', type: 'text', required: true }, { name: 'series_title', label: 'Record Series', type: 'text', required: true }, { name: 'date_from', label: 'Date From', type: 'date', required: true }, { name: 'date_to', label: 'Date To', type: 'date', required: true }]), is_active: true },
      { id: 'c1d2e3f4-3333-4000-8000-000000000002', name: 'Digital Document Upload', description: 'Template for born-digital records', agency_id: null, field_definitions: JSON.stringify([{ name: 'title', label: 'Document Title', type: 'text', required: true }, { name: 'description', label: 'Description', type: 'textarea', required: false }, { name: 'record_type', label: 'Record Type', type: 'select', required: true, options: ['general', 'financial', 'legal', 'permit', 'correspondence'] }]), is_active: true },
      { id: 'c1d2e3f4-3333-4000-8000-000000000003', name: 'Legal Case File', description: 'Template for legal case file transfers from AG office', agency_id: 'a1b2c3d4-1111-4000-8000-000000000008', field_definitions: JSON.stringify([{ name: 'case_number', label: 'Case Number', type: 'text', required: true }, { name: 'parties', label: 'Parties', type: 'text', required: true }, { name: 'filing_date', label: 'Filing Date', type: 'date', required: true }]), is_active: true },
    ]);
  }

  // --- Additional sample records ---
  const record6Exists = await knex('records').where({ id: 'e5f6a7b8-5555-4000-8000-000000000006' }).first();
  if (!record6Exists) {
    await knex('records').insert([
      { id: 'e5f6a7b8-5555-4000-8000-000000000006', title: 'Workers Compensation Claims 2022-2023', description: 'Workers compensation claims filed with the Department of Labor.', record_type: 'case_file', agency_id: 'a1b2c3d4-1111-4000-8000-000000000006', agency_code: 'DOL', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000003', series_title: 'Workers Compensation Claims', media_type: 'PHYSICAL', tracking_number: 'RMS-20240220-0001', barcode: 'RMS-20240220-0001', status: 'active', container_number: 'BOX-DOL-2023-0001', box_number: '0001', location_code: '01010202', location_id: 'd4e5f6a7-4444-4000-8000-000000000013', date_from: '2022-01-01', date_to: '2023-12-31', created_by: 'b2c3d4e5-2222-4000-8000-000000000002' },
      { id: 'e5f6a7b8-5555-4000-8000-000000000007', title: 'Election Records - 2024 Primary', description: 'Official election records for the 2024 Maine primary election.', record_type: 'general', agency_id: 'a1b2c3d4-1111-4000-8000-000000000009', agency_code: 'SOS', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000007', series_title: 'Election Records', media_type: 'PHYSICAL', tracking_number: 'RMS-20240301-0001', barcode: 'RMS-20240301-0001', status: 'active', container_number: 'BOX-SOS-2024-0001', box_number: '0001', location_code: '01010103', location_id: 'd4e5f6a7-4444-4000-8000-000000000010', date_from: '2024-01-01', date_to: '2024-06-30', created_by: 'b2c3d4e5-2222-4000-8000-000000000001' },
      { id: 'e5f6a7b8-5555-4000-8000-000000000008', title: 'DHHS Budget Reports FY2022-2023', description: 'Biennial budget reports and expenditure summaries for DHHS.', record_type: 'financial', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002', agency_code: 'DHHS', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000002', series_title: 'Budget Reports', media_type: 'DIGITAL', tracking_number: 'RMS-20240301-0002', barcode: 'RMS-20240301-0002', status: 'active', container_number: null, box_number: null, location_code: null, location_id: null, date_from: '2022-07-01', date_to: '2023-06-30', created_by: 'b2c3d4e5-2222-4000-8000-000000000003' },
    ]);
  }

  // --- Sample transmittals ---
  const transmittalExists = await knex('transmittals').first();
  if (!transmittalExists) {
    await knex('transmittals').insert([
      { id: 'dd44ee55-cccc-4000-8000-000000000001', title: 'Q4 2023 DHHS Records Transfer', description: 'Quarterly transfer of DHHS records to Archives', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002', status: 'received', submitted_by: 'b2c3d4e5-2222-4000-8000-000000000003', submitted_at: new Date('2024-01-05'), approved_by: 'b2c3d4e5-2222-4000-8000-000000000001', approved_at: new Date('2024-01-06'), received_by: 'b2c3d4e5-2222-4000-8000-000000000002', received_at: new Date('2024-01-08'), created_by: 'b2c3d4e5-2222-4000-8000-000000000003', item_count: 2 },
      { id: 'dd44ee55-cccc-4000-8000-000000000002', title: 'DOE Annual Records Submission', description: 'Annual submission of education records', agency_id: 'a1b2c3d4-1111-4000-8000-000000000003', status: 'submitted', submitted_by: 'b2c3d4e5-2222-4000-8000-000000000004', submitted_at: new Date('2024-02-01'), created_by: 'b2c3d4e5-2222-4000-8000-000000000004', item_count: 1 },
      { id: 'dd44ee55-cccc-4000-8000-000000000003', title: 'DOL Workers Comp Files Transfer', description: 'Transfer of closed workers compensation case files', agency_id: 'a1b2c3d4-1111-4000-8000-000000000006', status: 'draft', created_by: 'b2c3d4e5-2222-4000-8000-000000000002', item_count: 1 },
    ]);

    // Transmittal items (uses new columns added above)
    await knex('transmittal_items').insert([
      { id: 'dd44ee55-dddd-4000-8000-000000000001', transmittal_id: 'dd44ee55-cccc-4000-8000-000000000001', record_id: 'e5f6a7b8-5555-4000-8000-000000000001', box_number: '0001', description: 'Medicaid Eligibility Files 2023', series_title: 'Medicaid Eligibility Files', date_range: '2023-01 to 2023-12' },
      { id: 'dd44ee55-dddd-4000-8000-000000000002', transmittal_id: 'dd44ee55-cccc-4000-8000-000000000001', box_number: '0002', description: 'DHHS Administrative Correspondence', series_title: 'Correspondence', date_range: '2023-01 to 2023-06' },
      { id: 'dd44ee55-dddd-4000-8000-000000000003', transmittal_id: 'dd44ee55-cccc-4000-8000-000000000002', record_id: 'e5f6a7b8-5555-4000-8000-000000000004', box_number: '0004', description: 'School Funding Allocations FY2023', series_title: 'School Funding Allocations', date_range: '2022-07 to 2023-06' },
      { id: 'dd44ee55-dddd-4000-8000-000000000004', transmittal_id: 'dd44ee55-cccc-4000-8000-000000000003', record_id: 'e5f6a7b8-5555-4000-8000-000000000006', box_number: '0001', description: 'Workers Comp Claims 2022-2023', series_title: 'Workers Compensation Claims', date_range: '2022-01 to 2023-12' },
    ]);
  }

  // --- Sample disposition ---
  const dispositionExists = await knex('dispositions').first();
  if (!dispositionExists) {
    await knex('dispositions').insert({
      id: 'cc33dd44-bbbb-4000-8000-000000000001',
      title: 'FY2016 Correspondence Destruction',
      description: 'Scheduled destruction of general correspondence records past retention period',
      agency_id: 'a1b2c3d4-1111-4000-8000-000000000001',
      disposition_action: 'DESTROY',
      status: 'pending_approval',
      initiated_by: 'b2c3d4e5-2222-4000-8000-000000000002',
      initiated_at: new Date('2024-02-15'),
    });
    await knex('disposition_items').insert({
      id: 'cc33dd44-cccc-4000-8000-000000000001',
      disposition_id: 'cc33dd44-bbbb-4000-8000-000000000001',
      record_id: 'e5f6a7b8-5555-4000-8000-000000000003',
      has_legal_hold: false,
    });
  }

  // --- Sample notifications ---
  const notifExists = await knex('notifications').first();
  if (!notifExists) {
    await knex('notifications').insert([
      { id: 'ee55ff66-dddd-4000-8000-000000000001', user_id: 'b2c3d4e5-2222-4000-8000-000000000001', type: 'retention_alert', title: 'Retention Alert: Records Approaching Disposition', message: '1 record from DHHS is due for disposition within 90 days.', is_read: false, entity_type: 'record', entity_id: 'e5f6a7b8-5555-4000-8000-000000000005' },
      { id: 'ee55ff66-dddd-4000-8000-000000000002', user_id: 'b2c3d4e5-2222-4000-8000-000000000002', type: 'overdue', title: 'Overdue Record Alert', message: 'School Funding Allocations FY2023 (BOX-DOE-2023-0001) is overdue for return.', is_read: false, entity_type: 'record', entity_id: 'e5f6a7b8-5555-4000-8000-000000000004' },
      { id: 'ee55ff66-dddd-4000-8000-000000000003', user_id: 'b2c3d4e5-2222-4000-8000-000000000001', type: 'transmittal', title: 'New Transmittal Awaiting Approval', message: 'DOE Annual Records Submission requires your review.', is_read: false, entity_type: 'transmittal', entity_id: 'dd44ee55-cccc-4000-8000-000000000002' },
      { id: 'ee55ff66-dddd-4000-8000-000000000004', user_id: 'b2c3d4e5-2222-4000-8000-000000000003', type: 'disposition', title: 'Disposition Request Initiated', message: 'FY2016 Correspondence scheduled for destruction - review required.', is_read: true, entity_type: 'disposition', entity_id: 'cc33dd44-bbbb-4000-8000-000000000001' },
    ]);
  }

  // --- Sample audit events ---
  const auditExists = await knex('audit_events').first();
  if (!auditExists) {
    await knex('audit_events').insert([
      { id: 'ff66aa77-eeee-4000-8000-000000000001', user_id: 'b2c3d4e5-2222-4000-8000-000000000001', user_email: 'sarah.chen@maine.gov', agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', action: 'login', resource_type: 'session', resource_id: null, metadata: JSON.stringify({ ip: '10.0.1.45' }), created_at: new Date('2026-05-25T08:15:00Z') },
      { id: 'ff66aa77-eeee-4000-8000-000000000002', user_id: 'b2c3d4e5-2222-4000-8000-000000000003', user_email: 'diana.patel@maine.gov', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002', action: 'create', resource_type: 'record', resource_id: 'e5f6a7b8-5555-4000-8000-000000000001', metadata: JSON.stringify({ title: 'Medicaid Eligibility Files' }), created_at: new Date('2026-05-24T14:30:00Z') },
      { id: 'ff66aa77-eeee-4000-8000-000000000003', user_id: 'b2c3d4e5-2222-4000-8000-000000000002', user_email: 'michael.torres@maine.gov', agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', action: 'checkout', resource_type: 'record', resource_id: 'e5f6a7b8-5555-4000-8000-000000000004', metadata: JSON.stringify({ purpose: 'Annual audit review' }), created_at: new Date('2024-01-10T09:00:00Z') },
      { id: 'ff66aa77-eeee-4000-8000-000000000004', user_id: 'b2c3d4e5-2222-4000-8000-000000000001', user_email: 'sarah.chen@maine.gov', agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', action: 'approve', resource_type: 'transmittal', resource_id: 'dd44ee55-cccc-4000-8000-000000000001', metadata: JSON.stringify({ title: 'Q4 2023 DHHS Records Transfer' }), created_at: new Date('2024-01-06T10:00:00Z') },
      { id: 'ff66aa77-eeee-4000-8000-000000000005', user_id: 'b2c3d4e5-2222-4000-8000-000000000002', user_email: 'michael.torres@maine.gov', agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', action: 'receive', resource_type: 'transmittal', resource_id: 'dd44ee55-cccc-4000-8000-000000000001', metadata: JSON.stringify({ title: 'Q4 2023 DHHS Records Transfer' }), created_at: new Date('2024-01-08T11:30:00Z') },
      { id: 'ff66aa77-eeee-4000-8000-000000000006', user_id: 'b2c3d4e5-2222-4000-8000-000000000002', user_email: 'michael.torres@maine.gov', agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', action: 'initiate', resource_type: 'disposition', resource_id: 'cc33dd44-bbbb-4000-8000-000000000001', metadata: JSON.stringify({ action: 'DESTROY', title: 'FY2016 Correspondence Destruction' }), created_at: new Date('2024-02-15T14:00:00Z') },
    ]);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove added data (reverse order)
  await knex('audit_events').whereIn('id', [
    'ff66aa77-eeee-4000-8000-000000000001', 'ff66aa77-eeee-4000-8000-000000000002',
    'ff66aa77-eeee-4000-8000-000000000003', 'ff66aa77-eeee-4000-8000-000000000004',
    'ff66aa77-eeee-4000-8000-000000000005', 'ff66aa77-eeee-4000-8000-000000000006',
  ]).del();
  await knex('notifications').whereIn('id', [
    'ee55ff66-dddd-4000-8000-000000000001', 'ee55ff66-dddd-4000-8000-000000000002',
    'ee55ff66-dddd-4000-8000-000000000003', 'ee55ff66-dddd-4000-8000-000000000004',
  ]).del();
  await knex('disposition_items').where({ id: 'cc33dd44-cccc-4000-8000-000000000001' }).del();
  await knex('dispositions').where({ id: 'cc33dd44-bbbb-4000-8000-000000000001' }).del();
  await knex('transmittal_items').whereIn('id', [
    'dd44ee55-dddd-4000-8000-000000000001', 'dd44ee55-dddd-4000-8000-000000000002',
    'dd44ee55-dddd-4000-8000-000000000003', 'dd44ee55-dddd-4000-8000-000000000004',
  ]).del();
  await knex('transmittals').whereIn('id', [
    'dd44ee55-cccc-4000-8000-000000000001', 'dd44ee55-cccc-4000-8000-000000000002',
    'dd44ee55-cccc-4000-8000-000000000003',
  ]).del();
  await knex('records').whereIn('id', [
    'e5f6a7b8-5555-4000-8000-000000000006', 'e5f6a7b8-5555-4000-8000-000000000007',
    'e5f6a7b8-5555-4000-8000-000000000008',
  ]).del();
  await knex('record_templates').whereIn('id', [
    'c1d2e3f4-3333-4000-8000-000000000001', 'c1d2e3f4-3333-4000-8000-000000000002',
    'c1d2e3f4-3333-4000-8000-000000000003',
  ]).del();
  await knex('locations').whereIn('id', [
    'd4e5f6a7-4444-4000-8000-000000000010', 'd4e5f6a7-4444-4000-8000-000000000011',
    'd4e5f6a7-4444-4000-8000-000000000012', 'd4e5f6a7-4444-4000-8000-000000000013',
  ]).del();
  await knex('retention_schedules').whereIn('id', [
    'f6a7b8c9-6666-4000-8000-000000000006', 'f6a7b8c9-6666-4000-8000-000000000007',
  ]).del();

  // Revert retention schedule codes
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000001' }).update({ code: 'ADM-001' });
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000002' }).update({ code: 'FIN-001' });
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000003' }).update({ code: 'PER-001' });
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000004' }).update({ code: 'LEG-001' });
  await knex('retention_schedules').where({ id: 'f6a7b8c9-6666-4000-8000-000000000005' }).update({ code: 'COR-001' });

  // Revert barcodes
  await knex('records').where({ barcode: 'RMS-20240115-0001' }).update({ barcode: 'BOX-DHH-0001', container_number: 'BOX-DHH-0001' });
  await knex('records').where({ barcode: 'RMS-20240115-0002' }).update({ barcode: 'BOX-DOT-0002', container_number: 'BOX-DOT-0002' });
  await knex('records').where({ barcode: 'RMS-20240115-0004' }).update({ barcode: 'BOX-DOE-0004', container_number: 'BOX-DOE-0004' });
  await knex('records').where({ barcode: 'RMS-20240115-0005' }).update({ barcode: 'BOX-AGO-0005', container_number: 'BOX-AGO-0005' });

  // Revert location codes
  await knex('records').where({ location_code: '01010101' }).update({ location_code: 'SRC-AUG-F1-A-01' });
  await knex('records').where({ location_code: '01010102' }).update({ location_code: 'SRC-AUG-F1-A-02' });
  await knex('records').where({ location_code: '01010200' }).update({ location_code: 'SRC-AUG-F1-B' });

  const revertMap: Record<string, string> = {
    '01000000': 'SRC-AUG',
    '01010000': 'SRC-AUG-F1',
    '01020000': 'SRC-AUG-F2',
    '01010100': 'SRC-AUG-F1-A',
    '01010200': 'SRC-AUG-F1-B',
    '01010101': 'SRC-AUG-F1-A-01',
    '01010102': 'SRC-AUG-F1-A-02',
    '02000000': 'SRC-BAN',
    '03000000': 'SRC-PTL',
  };
  for (const [newCode, oldCode] of Object.entries(revertMap)) {
    await knex('locations').where({ code: newCode }).update({ code: oldCode });
  }

  // Revert agency codes
  await knex('records').where({ agency_code: 'DHHS' }).update({ agency_code: 'DHH' });
  await knex('agencies').where({ code: 'DHHS' }).update({ code: 'DHH' });
  await knex('agencies').where({ code: 'SOS' }).del();

  // Drop added columns
  const hasBoxNumber = await knex.schema.hasColumn('transmittal_items', 'box_number');
  if (hasBoxNumber) {
    await knex.schema.alterTable('transmittal_items', (table) => {
      table.dropColumn('box_number');
      table.dropColumn('description');
      table.dropColumn('series_title');
      table.dropColumn('date_range');
    });
  }
  const hasItemCount = await knex.schema.hasColumn('transmittals', 'item_count');
  if (hasItemCount) {
    await knex.schema.alterTable('transmittals', (table) => {
      table.dropColumn('item_count');
      table.dropColumn('notes');
    });
  }
}