import { Knex } from 'knex';

const agencies = [
  { id: 'a1b2c3d4-1111-4000-8000-000000000001', code: 'MSA', name: 'Maine State Archives', abbreviation: 'MSA', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000002', code: 'DHH', name: 'Department of Health and Human Services', abbreviation: 'DHHS', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000003', code: 'DOE', name: 'Department of Education', abbreviation: 'DOE', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000004', code: 'DOT', name: 'Department of Transportation', abbreviation: 'DOT', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000005', code: 'DEP', name: 'Department of Environmental Protection', abbreviation: 'DEP', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000006', code: 'DOL', name: 'Department of Labor', abbreviation: 'DOL', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000007', code: 'DPS', name: 'Department of Public Safety', abbreviation: 'DPS', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000008', code: 'AGO', name: 'Office of the Attorney General', abbreviation: 'AG', status: 'ACTIVE' },
];

const users = [
  { id: 'b2c3d4e5-2222-4000-8000-000000000001', cognito_id: 'cognito-sub-001', email: 'sarah.chen@maine.gov', first_name: 'Sarah', last_name: 'Chen', agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', roles: '{SYSTEM_ADMIN}', is_active: true },
  { id: 'b2c3d4e5-2222-4000-8000-000000000002', cognito_id: 'cognito-sub-002', email: 'michael.torres@maine.gov', first_name: 'Michael', last_name: 'Torres', agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', roles: '{ARCHIVES_STAFF}', is_active: true },
  { id: 'b2c3d4e5-2222-4000-8000-000000000003', cognito_id: 'cognito-sub-003', email: 'diana.patel@maine.gov', first_name: 'Diana', last_name: 'Patel', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002', roles: '{RECORDS_OFFICER}', is_active: true },
  { id: 'b2c3d4e5-2222-4000-8000-000000000004', cognito_id: 'cognito-sub-004', email: 'james.wright@maine.gov', first_name: 'James', last_name: 'Wright', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002', roles: '{AGENCY_STAFF}', is_active: true },
];

const retentionSchedules = [
  { id: 'f6a7b8c9-6666-4000-8000-000000000001', name: 'General Administrative', code: 'ADM-001', retention_years: 7, disposition_action: 'DESTROY', description: 'General administrative records', alert_days_before: 90, is_active: true },
  { id: 'f6a7b8c9-6666-4000-8000-000000000002', name: 'Financial Records', code: 'FIN-001', retention_years: 10, disposition_action: 'DESTROY', description: 'Financial and accounting records', alert_days_before: 90, is_active: true },
  { id: 'f6a7b8c9-6666-4000-8000-000000000003', name: 'Personnel Records', code: 'PER-001', retention_years: 75, disposition_action: 'TRANSFER_TO_ARCHIVES', description: 'Employee personnel files', alert_days_before: 90, is_active: true },
  { id: 'f6a7b8c9-6666-4000-8000-000000000004', name: 'Legal Case Files', code: 'LEG-001', retention_years: 100, disposition_action: 'TRANSFER_TO_ARCHIVES', description: 'Legal case files - permanent retention', alert_days_before: 90, is_active: true },
  { id: 'f6a7b8c9-6666-4000-8000-000000000005', name: 'Correspondence', code: 'COR-001', retention_years: 3, disposition_action: 'DESTROY', description: 'General correspondence', alert_days_before: 30, is_active: true },
];

const locations = [
  { id: 'd4e5f6a7-4444-4000-8000-000000000001', name: 'State Records Center - Augusta', code: 'SRC-AUG', parent_id: null, location_type: 'building', capacity: 5000, current_count: 3200, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
  { id: 'd4e5f6a7-4444-4000-8000-000000000002', name: 'Floor 1', code: 'SRC-AUG-F1', parent_id: 'd4e5f6a7-4444-4000-8000-000000000001', location_type: 'floor', capacity: 2500, current_count: 1800, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
  { id: 'd4e5f6a7-4444-4000-8000-000000000003', name: 'Floor 2', code: 'SRC-AUG-F2', parent_id: 'd4e5f6a7-4444-4000-8000-000000000001', location_type: 'floor', capacity: 2500, current_count: 1400, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
  { id: 'd4e5f6a7-4444-4000-8000-000000000004', name: 'Room A', code: 'SRC-AUG-F1-A', parent_id: 'd4e5f6a7-4444-4000-8000-000000000002', location_type: 'room', capacity: 500, current_count: 320, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
  { id: 'd4e5f6a7-4444-4000-8000-000000000005', name: 'Room B', code: 'SRC-AUG-F1-B', parent_id: 'd4e5f6a7-4444-4000-8000-000000000002', location_type: 'room', capacity: 500, current_count: 410, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
  { id: 'd4e5f6a7-4444-4000-8000-000000000006', name: 'Shelf A-01', code: 'SRC-AUG-F1-A-01', parent_id: 'd4e5f6a7-4444-4000-8000-000000000004', location_type: 'shelf', capacity: 50, current_count: 42, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
  { id: 'd4e5f6a7-4444-4000-8000-000000000007', name: 'Shelf A-02', code: 'SRC-AUG-F1-A-02', parent_id: 'd4e5f6a7-4444-4000-8000-000000000004', location_type: 'shelf', capacity: 50, current_count: 38, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
  { id: 'd4e5f6a7-4444-4000-8000-000000000008', name: 'State Records Center - Bangor', code: 'SRC-BAN', parent_id: null, location_type: 'building', capacity: 3000, current_count: 1500, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
  { id: 'd4e5f6a7-4444-4000-8000-000000000009', name: 'State Records Center - Portland', code: 'SRC-PTL', parent_id: null, location_type: 'building', capacity: 2000, current_count: 900, agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', is_active: true },
];

const sampleRecords = [
  { id: 'e5f6a7b8-5555-4000-8000-000000000001', title: 'Medicaid Eligibility Files - 2023 DHHS', description: 'Medicaid eligibility determination records for fiscal year 2023', record_type: 'case_file', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002', agency_code: 'DHH', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000001', series_title: 'Medicaid Eligibility Files', media_type: 'PHYSICAL', tracking_number: 'RMS-20240115-0001', barcode: 'BOX-DHH-0001', status: 'active', container_number: 'BOX-DHH-0001', box_number: '0001', location_code: 'SRC-AUG-F1-A-01', location_id: 'd4e5f6a7-4444-4000-8000-000000000006', date_from: '2023-01-01', date_to: '2023-12-31', created_by: 'b2c3d4e5-2222-4000-8000-000000000003' },
  { id: 'e5f6a7b8-5555-4000-8000-000000000002', title: 'I-95 Corridor Improvement Project Records', description: 'Transportation project documentation for I-95 corridor improvements', record_type: 'project_file', agency_id: 'a1b2c3d4-1111-4000-8000-000000000004', agency_code: 'DOT', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000002', series_title: 'Transportation Project Records', media_type: 'PHYSICAL', tracking_number: 'RMS-20240115-0002', barcode: 'BOX-DOT-0002', status: 'active', container_number: 'BOX-DOT-0002', box_number: '0002', location_code: 'SRC-AUG-F1-A-02', location_id: 'd4e5f6a7-4444-4000-8000-000000000007', date_from: '2022-01-01', date_to: '2023-06-30', created_by: 'b2c3d4e5-2222-4000-8000-000000000002' },
  { id: 'e5f6a7b8-5555-4000-8000-000000000003', title: 'Environmental Permits - Kennebec County 2023', description: 'Environmental permits issued for Kennebec County region in 2023', record_type: 'permit', agency_id: 'a1b2c3d4-1111-4000-8000-000000000005', agency_code: 'DEP', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000003', series_title: 'Environmental Permits', media_type: 'DIGITAL', tracking_number: 'RMS-20240115-0003', barcode: null, status: 'active', container_number: null, box_number: null, location_code: null, location_id: null, date_from: '2023-01-01', date_to: '2023-12-31', created_by: 'b2c3d4e5-2222-4000-8000-000000000003' },
  { id: 'e5f6a7b8-5555-4000-8000-000000000004', title: 'School Funding Allocations FY2023', description: 'School district funding allocation records for fiscal year 2023', record_type: 'financial', agency_id: 'a1b2c3d4-1111-4000-8000-000000000003', agency_code: 'DOE', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000002', series_title: 'School Funding Allocations', media_type: 'PHYSICAL', tracking_number: 'RMS-20240115-0004', barcode: 'BOX-DOE-0004', status: 'checked_out', container_number: 'BOX-DOE-0004', box_number: '0004', location_code: 'SRC-AUG-F1-B', location_id: 'd4e5f6a7-4444-4000-8000-000000000005', date_from: '2022-07-01', date_to: '2023-06-30', created_by: 'b2c3d4e5-2222-4000-8000-000000000003' },
  { id: 'e5f6a7b8-5555-4000-8000-000000000005', title: 'Attorney General Legal Case Files 2020-2023', description: 'Legal case files managed by the Office of the Attorney General', record_type: 'legal', agency_id: 'a1b2c3d4-1111-4000-8000-000000000008', agency_code: 'AGO', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000004', series_title: 'Legal Case Files', media_type: 'PHYSICAL', tracking_number: 'RMS-20240115-0005', barcode: 'BOX-AGO-0005', status: 'on_hold', container_number: 'BOX-AGO-0005', box_number: '0005', location_code: 'SRC-AUG-F1-A-01', location_id: 'd4e5f6a7-4444-4000-8000-000000000006', date_from: '2020-01-01', date_to: '2023-12-31', created_by: 'b2c3d4e5-2222-4000-8000-000000000002' },
];

export async function up(knex: Knex): Promise<void> {
  await knex('agencies').insert(agencies);
  await knex('users').insert(users);
  await knex('retention_schedules').insert(retentionSchedules);
  await knex('locations').insert(locations);
  await knex('records').insert(sampleRecords);

  // Sample legal hold for the AG case files
  await knex('legal_holds').insert({
    id: 'a1a2b3c4-7777-4000-8000-000000000001',
    record_id: 'e5f6a7b8-5555-4000-8000-000000000005',
    reason: 'Active litigation - State v. Doe 2023-CV-1234',
    placed_by: 'b2c3d4e5-2222-4000-8000-000000000001',
    is_active: true,
  });

  // Sample circulation event (checked-out record)
  await knex('circulation_events').insert({
    id: 'g1a2b3c4-8888-4000-8000-000000000001',
    record_id: 'e5f6a7b8-5555-4000-8000-000000000004',
    user_id: 'b2c3d4e5-2222-4000-8000-000000000003',
    event_type: 'checkout',
    purpose: 'Annual audit review',
    checked_out_at: new Date('2024-01-10'),
    due_date: new Date('2024-02-10'),
    agency_id: 'a1b2c3d4-1111-4000-8000-000000000003',
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex('circulation_events').del();
  await knex('legal_holds').del();
  await knex('records').del();
  await knex('locations').del();
  await knex('retention_schedules').del();
  await knex('users').del();
  await knex('agencies').del();
}