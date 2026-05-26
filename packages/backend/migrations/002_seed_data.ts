import { Knex } from 'knex';

const agencies = [
  { id: 'a1b2c3d4-1111-4000-8000-000000000001', code: 'MSA', name: 'Maine State Archives', abbreviation: 'MSA', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000002', code: 'DHH', name: 'Department of Health and Human Services', abbreviation: 'DHHS', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000003', code: 'DOE', name: 'Department of Education', abbreviation: 'DOE', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000004', code: 'DOT', name: 'Department of Transportation', abbreviation: 'DOT', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000005', code: 'DEP', name: 'Department of Environmental Protection', abbreviation: 'DEP', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000006', code: 'DOL', name: 'Department of Labor', abbreviation: 'DOL', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000007', code: 'DPS', name: 'Department of Public Safety', abbreviation: 'DPS', status: 'ACTIVE' },
  { id: 'a1b2c3d4-1111-4000-8000-000000000008', code: 'AGO', name: 'Office of the Attorney General', abbreviation: 'AG', status: 'ACTIVE' }
];

const roles = [
  { id: '10000000-0000-4000-8000-000000000001', name: 'SYSTEM_ADMIN', display_name: 'System Administrator', description: 'Full system access' },
  { id: '10000000-0000-4000-8000-000000000002', name: 'ARCHIVES_STAFF', display_name: 'Archives Staff', description: 'Maine State Archives operations staff' },
  { id: '10000000-0000-4000-8000-000000000003', name: 'RECORDS_OFFICER', display_name: 'Records Officer', description: 'Agency records management officer' },
  { id: '10000000-0000-4000-8000-000000000004', name: 'AGENCY_STAFF', display_name: 'Agency Staff', description: 'General agency staff with limited access' }
];

const users = [
  { id: 'b2c3d4e5-2222-4000-8000-000000000001', email: 'sarah.chen@maine.gov', first_name: 'Sarah', last_name: 'Chen', cognito_sub: 'cognito-sub-placeholder-001', agency_id: null, status: 'ACTIVE' },
  { id: 'b2c3d4e5-2222-4000-8000-000000000002', email: 'michael.torres@maine.gov', first_name: 'Michael', last_name: 'Torres', cognito_sub: 'cognito-sub-placeholder-002', agency_id: 'a1b2c3d4-1111-4000-8000-000000000001', status: 'ACTIVE' },
  { id: 'b2c3d4e5-2222-4000-8000-000000000003', email: 'diana.patel@maine.gov', first_name: 'Diana', last_name: 'Patel', cognito_sub: 'cognito-sub-placeholder-003', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002', status: 'ACTIVE' },
  { id: 'b2c3d4e5-2222-4000-8000-000000000004', email: 'james.wright@maine.gov', first_name: 'James', last_name: 'Wright', cognito_sub: 'cognito-sub-placeholder-004', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002', status: 'ACTIVE' }
];

const userRoles = [
  { id: '20000000-0000-4000-8000-000000000001', user_id: 'b2c3d4e5-2222-4000-8000-000000000001', role_id: '10000000-0000-4000-8000-000000000001', agency_id: null },
  { id: '20000000-0000-4000-8000-000000000002', user_id: 'b2c3d4e5-2222-4000-8000-000000000002', role_id: '10000000-0000-4000-8000-000000000002', agency_id: 'a1b2c3d4-1111-4000-8000-000000000001' },
  { id: '20000000-0000-4000-8000-000000000003', user_id: 'b2c3d4e5-2222-4000-8000-000000000003', role_id: '10000000-0000-4000-8000-000000000003', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002' },
  { id: '20000000-0000-4000-8000-000000000004', user_id: 'b2c3d4e5-2222-4000-8000-000000000004', role_id: '10000000-0000-4000-8000-000000000004', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002' }
];

const warehouses = [
  { id: 'c3d4e5f6-3333-4000-8000-000000000001', name: 'State Records Center - Augusta', code: '01', address: '230 State Street, Augusta, ME 04330', total_capacity: 5000, is_active: true },
  { id: 'c3d4e5f6-3333-4000-8000-000000000002', name: 'State Records Center - Bangor', code: '02', address: '45 Commerce Drive, Bangor, ME 04401', total_capacity: 3000, is_active: true },
  { id: 'c3d4e5f6-3333-4000-8000-000000000003', name: 'State Records Center - Portland', code: '03', address: '125 Presumpscot Street, Portland, ME 04103', total_capacity: 2000, is_active: true }
];

const retentionSchedules = [
  { id: 'f6a7b8c9-6666-4000-8000-000000000001', name: 'General Administrative', series_code: 'ADM-001', retention_period_days: 2555, disposition_action: 'DESTROY', legal_authority: '5 MRSA Section 95-B; State Archives General Schedule GS-1', alert_thresholds: JSON.stringify([90, 30, 7]) },
  { id: 'f6a7b8c9-6666-4000-8000-000000000002', name: 'Financial Records', series_code: 'FIN-001', retention_period_days: 3650, disposition_action: 'DESTROY', legal_authority: '5 MRSA Section 95-B; State Archives General Schedule GS-4', alert_thresholds: JSON.stringify([90, 30, 7]) },
  { id: 'f6a7b8c9-6666-4000-8000-000000000003', name: 'Personnel Records', series_code: 'PER-001', retention_period_days: 27375, disposition_action: 'TRANSFER_TO_ARCHIVES', legal_authority: '5 MRSA Section 95-B; State Archives General Schedule GS-7', alert_thresholds: JSON.stringify([90, 30, 7]) },
  { id: 'f6a7b8c9-6666-4000-8000-000000000004', name: 'Legal Case Files', series_code: 'LEG-001', retention_period_days: null, disposition_action: 'TRANSFER_TO_ARCHIVES', legal_authority: '5 MRSA Section 95-B; Permanent Retention per Archives directive', alert_thresholds: JSON.stringify([90, 30, 7]) },
  { id: 'f6a7b8c9-6666-4000-8000-000000000005', name: 'Correspondence', series_code: 'COR-001', retention_period_days: 1095, disposition_action: 'DESTROY', legal_authority: '5 MRSA Section 95-B; State Archives General Schedule GS-2', alert_thresholds: JSON.stringify([90, 30, 7]) }
];

const sampleRecords = [
  { id: 'e5f6a7b8-5555-4000-8000-000000000001', agency_id: 'a1b2c3d4-1111-4000-8000-000000000002', agency_code: 'DHH', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000001', series_title: 'Medicaid Eligibility Files', title: 'Medicaid Eligibility Files - 2023 DHHS', media_type: 'PHYSICAL', status: 'ACTIVE', container_number: 'BOX-DHH-0001', box_number: '0001', location_code: '01010101', transmittal_number: 'TR-2024-0001', date_from: '2023-01-01', date_to: '2023-12-31', created_by: 'b2c3d4e5-2222-4000-8000-000000000003' },
  { id: 'e5f6a7b8-5555-4000-8000-000000000002', agency_id: 'a1b2c3d4-1111-4000-8000-000000000004', agency_code: 'DOT', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000002', series_title: 'Transportation Project Records', title: 'I-95 Corridor Improvement Project Records', media_type: 'PHYSICAL', status: 'ACTIVE', container_number: 'BOX-DOT-0002', box_number: '0002', location_code: '01010102', transmittal_number: 'TR-2024-0002', date_from: '2022-01-01', date_to: '2023-06-30', created_by: 'b2c3d4e5-2222-4000-8000-000000000002' },
  { id: 'e5f6a7b8-5555-4000-8000-000000000003', agency_id: 'a1b2c3d4-1111-4000-8000-000000000005', agency_code: 'DEP', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000003', series_title: 'Environmental Permits', title: 'Environmental Permits - Kennebec County 2023', media_type: 'DIGITAL', status: 'ACTIVE', container_number: null, box_number: null, location_code: null, transmittal_number: 'TR-2024-0003', date_from: '2023-01-01', date_to: '2023-12-31', created_by: 'b2c3d4e5-2222-4000-8000-000000000003' },
  { id: 'e5f6a7b8-5555-4000-8000-000000000004', agency_id: 'a1b2c3d4-1111-4000-8000-000000000003', agency_code: 'DOE', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000002', series_title: 'School Funding Allocations', title: 'School Funding Allocations FY2023', media_type: 'PHYSICAL', status: 'CHECKED_OUT', container_number: 'BOX-DOE-0004', box_number: '0004', location_code: '01010202', transmittal_number: 'TR-2024-0004', date_from: '2022-07-01', date_to: '2023-06-30', created_by: 'b2c3d4e5-2222-4000-8000-000000000003' },
  { id: 'e5f6a7b8-5555-4000-8000-000000000005', agency_id: 'a1b2c3d4-1111-4000-8000-000000000008', agency_code: 'AGO', retention_schedule_id: 'f6a7b8c9-6666-4000-8000-000000000004', series_title: 'Legal Case Files', title: 'Attorney General Legal Case Files 2020-2023', media_type: 'PHYSICAL', status: 'ON_HOLD', container_number: 'BOX-AGO-0005', box_number: '0005', location_code: '01010301', transmittal_number: 'TR-2024-0005', date_from: '2020-01-01', date_to: '2023-12-31', created_by: 'b2c3d4e5-2222-4000-8000-000000000002' }
];

export async function up(knex: Knex): Promise<void> {
  await knex('agencies').insert(agencies);
  await knex('roles').insert(roles);
  await knex('users').insert(users);
  await knex('user_roles').insert(userRoles);
  await knex('warehouses').insert(warehouses);
  await knex('retention_schedules').insert(retentionSchedules);

  const locations = [];
  let idx = 0;
  for (let row = 1; row <= 10; row++) {
    for (let bay = 1; bay <= 5; bay++) {
      for (let sp = 1; sp <= 2; sp++) {
        idx++;
        const rowStr = String(row).padStart(2, '0');
        const bayStr = String(bay).padStart(2, '0');
        const spStr = String(sp).padStart(2, '0');
        const code = '01' + rowStr + bayStr + spStr;
        const isOccupied = idx <= 60;
        const id = 'd4e5f6a7-4444-4000-8000-' + String(idx).padStart(12, '0');
        // Only reference actual existing record IDs for occupied_by
        const occupiedByMap: Record<number, string> = {
          1: 'e5f6a7b8-5555-4000-8000-000000000001',
          2: 'e5f6a7b8-5555-4000-8000-000000000002',
          3: 'e5f6a7b8-5555-4000-8000-000000000004',
          4: 'e5f6a7b8-5555-4000-8000-000000000005',
        };
        locations.push({
          id,
          warehouse_id: 'c3d4e5f6-3333-4000-8000-000000000001',
          code,
          row: rowStr,
          bay: bayStr,
          shelf: spStr,
          position: String(sp),
          is_occupied: isOccupied,
          occupied_by: occupiedByMap[idx] || null
        });
      }
    }
  }
  await knex.batchInsert('locations', locations, 50);
  await knex('records').insert(sampleRecords);
}

export async function down(knex: Knex): Promise<void> {
  await knex('records').del();
  await knex('locations').del();
  await knex('retention_schedules').del();
  await knex('warehouses').del();
  await knex('user_roles').del();
  await knex('users').del();
  await knex('roles').del();
  await knex('agencies').del();
}
