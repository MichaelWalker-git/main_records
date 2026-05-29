import { Knex } from 'knex';

// Idempotent: skip if already seeded (check for a known record)
const SENTINEL_RECORD = 'e5f6a7b8-5555-4000-8000-100000000001';

const AGENCIES = {
  MSA: 'a1b2c3d4-1111-4000-8000-000000000001',
  DHH: 'a1b2c3d4-1111-4000-8000-000000000002',
  DOE: 'a1b2c3d4-1111-4000-8000-000000000003',
  DOT: 'a1b2c3d4-1111-4000-8000-000000000004',
  DEP: 'a1b2c3d4-1111-4000-8000-000000000005',
  DOL: 'a1b2c3d4-1111-4000-8000-000000000006',
  DPS: 'a1b2c3d4-1111-4000-8000-000000000007',
  AGO: 'a1b2c3d4-1111-4000-8000-000000000008',
};

const USERS = {
  sarah: 'b2c3d4e5-2222-4000-8000-000000000001',
  michael: 'b2c3d4e5-2222-4000-8000-000000000002',
  diana: 'b2c3d4e5-2222-4000-8000-000000000003',
  james: 'b2c3d4e5-2222-4000-8000-000000000004',
};

const LOCATIONS = {
  aug_f1_a_01: 'd4e5f6a7-4444-4000-8000-000000000006',
  aug_f1_a_02: 'd4e5f6a7-4444-4000-8000-000000000007',
  aug_f1_b: 'd4e5f6a7-4444-4000-8000-000000000005',
  aug_f2: 'd4e5f6a7-4444-4000-8000-000000000003',
  bangor: 'd4e5f6a7-4444-4000-8000-000000000008',
  portland: 'd4e5f6a7-4444-4000-8000-000000000009',
};

const SCHEDULES = {
  admin: 'f6a7b8c9-6666-4000-8000-000000000001',
  financial: 'f6a7b8c9-6666-4000-8000-000000000002',
  personnel: 'f6a7b8c9-6666-4000-8000-000000000003',
  legal: 'f6a7b8c9-6666-4000-8000-000000000004',
  correspondence: 'f6a7b8c9-6666-4000-8000-000000000005',
};

function rid(n: number) { return `e5f6a7b8-5555-4000-8000-1000000000${n.toString().padStart(2, '0')}`; }
function tid(n: number) { return `a0a1b2c3-9999-4000-8000-0000000000${n.toString().padStart(2, '0')}`; }
function did(n: number) { return `b0b1c2d3-aaaa-4000-8000-0000000000${n.toString().padStart(2, '0')}`; }
function cid(n: number) { return `c0c1d2e3-bbbb-4000-8000-0000000000${n.toString().padStart(2, '0')}`; }
function nid(n: number) { return `d0d1e2f3-cccc-4000-8000-0000000000${n.toString().padStart(2, '0')}`; }
function aid(n: number) { return `e0e1f2a3-dddd-4000-8000-0000000000${n.toString().padStart(2, '0')}`; }

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000);

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    const exists = await trx('records').where('id', SENTINEL_RECORD).first();
    if (exists) return;
    await seed(trx);
  });
}

async function seed(knex: Knex.Transaction): Promise<void> {

  // --- 50 additional records across agencies and statuses ---
  const records = [
    { id: rid(1), title: 'Governor Executive Orders 2024', description: 'Executive orders issued by the Governor during 2024 legislative session', record_type: 'executive', agency_id: AGENCIES.MSA, agency_code: 'MSA', retention_schedule_id: SCHEDULES.legal, series_title: 'Executive Orders', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0101', status: 'active', location_id: LOCATIONS.aug_f1_a_01, location_code: 'SRC-AUG-F1-A-01', ai_confidence: 0.94, classification_status: 'CLASSIFIED', tags: '{executive,governor,legislation}', created_by: USERS.sarah, created_at: daysAgo(45) },
    { id: rid(2), title: 'DHHS Foster Care Case Files Q1 2025', description: 'Foster care placement and review files for Q1 2025', record_type: 'case_file', agency_id: AGENCIES.DHH, agency_code: 'DHH', retention_schedule_id: SCHEDULES.personnel, series_title: 'Foster Care Case Files', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0102', status: 'active', location_id: LOCATIONS.aug_f1_a_02, location_code: 'SRC-AUG-F1-A-02', barcode: 'BOX-DHH-1001', ai_confidence: 0.91, classification_status: 'CLASSIFIED', tags: '{foster-care,confidential,dhhs}', created_by: USERS.diana, created_at: daysAgo(30) },
    { id: rid(3), title: 'DOT Bridge Inspection Reports 2024', description: 'Annual bridge safety inspection reports for state highways', record_type: 'inspection', agency_id: AGENCIES.DOT, agency_code: 'DOT', retention_schedule_id: SCHEDULES.admin, series_title: 'Bridge Inspection Reports', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0103', status: 'active', location_id: LOCATIONS.bangor, location_code: 'SRC-BAN', ai_confidence: 0.88, classification_status: 'CLASSIFIED', tags: '{infrastructure,safety,inspection}', created_by: USERS.michael, created_at: daysAgo(60) },
    { id: rid(4), title: 'DEP Water Quality Testing - Androscoggin River', description: 'Monthly water quality samples and analysis from Androscoggin River monitoring stations', record_type: 'environmental', agency_id: AGENCIES.DEP, agency_code: 'DEP', retention_schedule_id: SCHEDULES.admin, series_title: 'Water Quality Records', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0104', status: 'active', ai_confidence: 0.72, classification_status: 'NEEDS_REVIEW', tags: '{water-quality,environmental,monitoring}', created_by: USERS.michael, created_at: daysAgo(15) },
    { id: rid(5), title: 'DOL Unemployment Claims Batch - March 2025', description: 'Processed unemployment insurance claims for March 2025', record_type: 'financial', agency_id: AGENCIES.DOL, agency_code: 'DOL', retention_schedule_id: SCHEDULES.financial, series_title: 'Unemployment Claims', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0105', status: 'active', location_id: LOCATIONS.aug_f1_b, location_code: 'SRC-AUG-F1-B', barcode: 'BOX-DOL-2001', ai_confidence: 0.96, classification_status: 'CLASSIFIED', tags: '{unemployment,claims,financial}', created_by: USERS.diana, created_at: daysAgo(20) },
    { id: rid(6), title: 'DPS Incident Reports - Cumberland County Jan 2025', description: 'Law enforcement incident reports filed in Cumberland County', record_type: 'incident', agency_id: AGENCIES.DPS, agency_code: 'DPS', retention_schedule_id: SCHEDULES.legal, series_title: 'Incident Reports', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0106', status: 'on_hold', location_id: LOCATIONS.aug_f1_a_01, location_code: 'SRC-AUG-F1-A-01', barcode: 'BOX-DPS-3001', ai_confidence: 0.89, classification_status: 'CLASSIFIED', tags: '{law-enforcement,incidents,cumberland}', created_by: USERS.sarah, created_at: daysAgo(40) },
    { id: rid(7), title: 'AG Office Civil Litigation Files 2024', description: 'Civil litigation case documentation managed by AG office', record_type: 'legal', agency_id: AGENCIES.AGO, agency_code: 'AGO', retention_schedule_id: SCHEDULES.legal, series_title: 'Civil Litigation Files', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0107', status: 'on_hold', location_id: LOCATIONS.aug_f1_a_02, location_code: 'SRC-AUG-F1-A-02', barcode: 'BOX-AGO-4001', ai_confidence: 0.92, classification_status: 'CLASSIFIED', tags: '{litigation,legal,attorney-general}', created_by: USERS.michael, created_at: daysAgo(90) },
    { id: rid(8), title: 'DOE Teacher Certification Records 2023-2024', description: 'Teacher certification and renewal documentation', record_type: 'certification', agency_id: AGENCIES.DOE, agency_code: 'DOE', retention_schedule_id: SCHEDULES.personnel, series_title: 'Teacher Certifications', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0108', status: 'active', ai_confidence: 0.87, classification_status: 'CLASSIFIED', tags: '{education,certification,teachers}', created_by: USERS.diana, created_at: daysAgo(55) },
    { id: rid(9), title: 'MSA Archival Accession Log 2025', description: 'Log of all new accessions received by Maine State Archives in 2025', record_type: 'administrative', agency_id: AGENCIES.MSA, agency_code: 'MSA', retention_schedule_id: SCHEDULES.admin, series_title: 'Accession Records', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0109', status: 'active', ai_confidence: 0.95, classification_status: 'CLASSIFIED', tags: '{accession,archives,internal}', created_by: USERS.sarah, created_at: daysAgo(5) },
    { id: rid(10), title: 'DHHS Medicaid Audit Report FY2024', description: 'Internal audit of Medicaid program expenditures for fiscal year 2024', record_type: 'audit', agency_id: AGENCIES.DHH, agency_code: 'DHH', retention_schedule_id: SCHEDULES.financial, series_title: 'Audit Reports', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0110', status: 'active', ai_confidence: 0.93, classification_status: 'CLASSIFIED', tags: '{audit,medicaid,financial}', created_by: USERS.james, created_at: daysAgo(25) },
    { id: rid(11), title: 'DOT Highway Maintenance Contracts 2025', description: 'Active maintenance contracts for state highway system', record_type: 'contract', agency_id: AGENCIES.DOT, agency_code: 'DOT', retention_schedule_id: SCHEDULES.financial, series_title: 'Highway Contracts', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0111', status: 'checked_out', location_id: LOCATIONS.portland, location_code: 'SRC-PTL', barcode: 'BOX-DOT-5001', ai_confidence: 0.84, classification_status: 'CLASSIFIED', tags: '{contracts,maintenance,highways}', created_by: USERS.michael, created_at: daysAgo(35) },
    { id: rid(12), title: 'DEP Air Emissions Permits - Southern Maine', description: 'Air quality emission permits for industrial facilities in southern Maine', record_type: 'permit', agency_id: AGENCIES.DEP, agency_code: 'DEP', retention_schedule_id: SCHEDULES.admin, series_title: 'Air Emission Permits', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0112', status: 'active', ai_confidence: 0.78, classification_status: 'NEEDS_REVIEW', tags: '{air-quality,permits,emissions}', created_by: USERS.diana, created_at: daysAgo(12) },
    { id: rid(13), title: 'DOL Workers Compensation Appeals 2024', description: 'Workers compensation appeal case files resolved in 2024', record_type: 'case_file', agency_id: AGENCIES.DOL, agency_code: 'DOL', retention_schedule_id: SCHEDULES.legal, series_title: 'Workers Comp Appeals', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0113', status: 'pending_disposition', location_id: LOCATIONS.aug_f1_b, location_code: 'SRC-AUG-F1-B', barcode: 'BOX-DOL-2002', ai_confidence: 0.90, classification_status: 'CLASSIFIED', tags: '{workers-comp,appeals,legal}', created_by: USERS.james, created_at: daysAgo(120) },
    { id: rid(14), title: 'DPS Criminal Background Check Records 2023', description: 'Processed criminal background check requests and results', record_type: 'background_check', agency_id: AGENCIES.DPS, agency_code: 'DPS', retention_schedule_id: SCHEDULES.personnel, series_title: 'Background Checks', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0114', status: 'active', ai_confidence: 0.86, classification_status: 'CLASSIFIED', tags: '{background-check,criminal,confidential}', created_by: USERS.sarah, created_at: daysAgo(75) },
    { id: rid(15), title: 'AG Consumer Protection Complaints 2025', description: 'Consumer protection complaint filings received in Q1 2025', record_type: 'complaint', agency_id: AGENCIES.AGO, agency_code: 'AGO', retention_schedule_id: SCHEDULES.correspondence, series_title: 'Consumer Complaints', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0115', status: 'active', ai_confidence: 0.67, classification_status: 'NEEDS_REVIEW', tags: '{consumer,complaints,protection}', created_by: USERS.michael, created_at: daysAgo(8) },
    { id: rid(16), title: 'MSA Historical Maps Collection - Penobscot County', description: 'Digitized historical maps of Penobscot County dating from 1820-1900', record_type: 'historical', agency_id: AGENCIES.MSA, agency_code: 'MSA', retention_schedule_id: SCHEDULES.legal, series_title: 'Historical Maps', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0116', status: 'active', has_document: true, document_key: 'documents/maps-penobscot-collection.pdf', ai_confidence: 0.97, classification_status: 'CLASSIFIED', tags: '{historical,maps,penobscot,digitized}', created_by: USERS.sarah, created_at: daysAgo(100) },
    { id: rid(17), title: 'DOE School Safety Audit Reports 2024', description: 'Annual safety audit reports for public schools across Maine', record_type: 'audit', agency_id: AGENCIES.DOE, agency_code: 'DOE', retention_schedule_id: SCHEDULES.admin, series_title: 'School Safety Audits', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0117', status: 'in_transit', location_id: LOCATIONS.bangor, location_code: 'SRC-BAN', barcode: 'BOX-DOE-6001', ai_confidence: 0.91, classification_status: 'CLASSIFIED', tags: '{safety,schools,audit}', created_by: USERS.diana, created_at: daysAgo(22) },
    { id: rid(18), title: 'DHHS Child Welfare Statistics Q4 2024', description: 'Quarterly statistical report on child welfare services and outcomes', record_type: 'report', agency_id: AGENCIES.DHH, agency_code: 'DHH', retention_schedule_id: SCHEDULES.admin, series_title: 'Child Welfare Statistics', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0118', status: 'active', ai_confidence: 0.88, classification_status: 'CLASSIFIED', tags: '{child-welfare,statistics,quarterly}', created_by: USERS.james, created_at: daysAgo(50) },
    { id: rid(19), title: 'DOT Fuel Tax Revenue Records FY2024', description: 'State fuel tax collection records and revenue reconciliation', record_type: 'financial', agency_id: AGENCIES.DOT, agency_code: 'DOT', retention_schedule_id: SCHEDULES.financial, series_title: 'Fuel Tax Records', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0119', status: 'active', ai_confidence: 0.93, classification_status: 'CLASSIFIED', tags: '{fuel-tax,revenue,financial}', created_by: USERS.michael, created_at: daysAgo(65) },
    { id: rid(20), title: 'DEP Hazardous Waste Manifests 2025', description: 'Hazardous waste transport manifests and disposal tracking', record_type: 'manifest', agency_id: AGENCIES.DEP, agency_code: 'DEP', retention_schedule_id: SCHEDULES.admin, series_title: 'Hazardous Waste Manifests', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0120', status: 'active', location_id: LOCATIONS.portland, location_code: 'SRC-PTL', barcode: 'BOX-DEP-7001', ai_confidence: 0.85, classification_status: 'CLASSIFIED', tags: '{hazardous,waste,manifests,environmental}', created_by: USERS.diana, created_at: daysAgo(10) },
    { id: rid(21), title: 'DOL Apprenticeship Program Files 2024', description: 'Registered apprenticeship program documentation and participant records', record_type: 'program', agency_id: AGENCIES.DOL, agency_code: 'DOL', retention_schedule_id: SCHEDULES.personnel, series_title: 'Apprenticeship Programs', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0121', status: 'active', ai_confidence: 0.79, classification_status: 'NEEDS_REVIEW', tags: '{apprenticeship,training,workforce}', created_by: USERS.james, created_at: daysAgo(28) },
    { id: rid(22), title: 'MSA Vital Records Index Updates - 2025', description: 'Index updates for vital records (births, marriages, deaths) processed in 2025', record_type: 'index', agency_id: AGENCIES.MSA, agency_code: 'MSA', retention_schedule_id: SCHEDULES.legal, series_title: 'Vital Records Index', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0122', status: 'active', ai_confidence: 0.98, classification_status: 'CLASSIFIED', tags: '{vital-records,births,marriages,deaths}', created_by: USERS.sarah, created_at: daysAgo(3) },
    { id: rid(23), title: 'DHHS Nursing Home Inspection Reports 2024', description: 'Annual nursing home and long-term care facility inspection results', record_type: 'inspection', agency_id: AGENCIES.DHH, agency_code: 'DHH', retention_schedule_id: SCHEDULES.admin, series_title: 'Nursing Home Inspections', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0123', status: 'active', location_id: LOCATIONS.aug_f1_a_01, location_code: 'SRC-AUG-F1-A-01', barcode: 'BOX-DHH-1002', ai_confidence: 0.90, classification_status: 'CLASSIFIED', tags: '{nursing-home,inspection,healthcare}', created_by: USERS.diana, created_at: daysAgo(42) },
    { id: rid(24), title: 'DOT Vehicle Registration Database Backup Q1 2025', description: 'Quarterly database backup of vehicle registration records', record_type: 'database', agency_id: AGENCIES.DOT, agency_code: 'DOT', retention_schedule_id: SCHEDULES.admin, series_title: 'Vehicle Registration Backups', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0124', status: 'active', ai_confidence: 0.82, classification_status: 'CLASSIFIED', tags: '{vehicles,registration,database,backup}', created_by: USERS.michael, created_at: daysAgo(18) },
    { id: rid(25), title: 'DEP Wetlands Protection Orders 2024', description: 'Administrative orders for wetlands protection and violation remediation', record_type: 'order', agency_id: AGENCIES.DEP, agency_code: 'DEP', retention_schedule_id: SCHEDULES.legal, series_title: 'Wetlands Orders', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0125', status: 'pending_disposition', ai_confidence: 0.87, classification_status: 'CLASSIFIED', tags: '{wetlands,protection,orders,environmental}', created_by: USERS.diana, created_at: daysAgo(180) },
    { id: rid(26), title: 'DPS Firearms Licensing Records 2024', description: 'Concealed carry permit applications and renewals for 2024', record_type: 'license', agency_id: AGENCIES.DPS, agency_code: 'DPS', retention_schedule_id: SCHEDULES.personnel, series_title: 'Firearms Licensing', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0126', status: 'active', ai_confidence: 0.91, classification_status: 'CLASSIFIED', tags: '{firearms,licensing,permits,confidential}', created_by: USERS.sarah, created_at: daysAgo(48) },
    { id: rid(27), title: 'AG Tobacco Settlement Fund Reports', description: 'Annual reports on tobacco settlement fund disbursements and programs', record_type: 'financial', agency_id: AGENCIES.AGO, agency_code: 'AGO', retention_schedule_id: SCHEDULES.financial, series_title: 'Tobacco Settlement', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0127', status: 'active', ai_confidence: 0.94, classification_status: 'CLASSIFIED', tags: '{tobacco,settlement,financial,health}', created_by: USERS.michael, created_at: daysAgo(70) },
    { id: rid(28), title: 'DOE Special Education IEP Records 2024', description: 'Individual Education Program documentation for special education students', record_type: 'case_file', agency_id: AGENCIES.DOE, agency_code: 'DOE', retention_schedule_id: SCHEDULES.personnel, series_title: 'Special Education IEPs', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0128', status: 'checked_out', location_id: LOCATIONS.aug_f1_b, location_code: 'SRC-AUG-F1-B', barcode: 'BOX-DOE-6002', ai_confidence: 0.86, classification_status: 'CLASSIFIED', tags: '{special-education,iep,confidential}', created_by: USERS.diana, created_at: daysAgo(38) },
    { id: rid(29), title: 'MSA Legislative Session Minutes 2025', description: 'Official minutes from Maine Legislature 2025 session proceedings', record_type: 'legislative', agency_id: AGENCIES.MSA, agency_code: 'MSA', retention_schedule_id: SCHEDULES.legal, series_title: 'Legislative Minutes', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0129', status: 'active', ai_confidence: 0.99, classification_status: 'CLASSIFIED', tags: '{legislative,minutes,official,government}', created_by: USERS.sarah, created_at: daysAgo(7) },
    { id: rid(30), title: 'DOL Mine Safety Inspection Records', description: 'Mine safety inspection documentation and compliance reports', record_type: 'inspection', agency_id: AGENCIES.DOL, agency_code: 'DOL', retention_schedule_id: SCHEDULES.admin, series_title: 'Mine Safety Records', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0130', status: 'active', location_id: LOCATIONS.bangor, location_code: 'SRC-BAN', barcode: 'BOX-DOL-2003', ai_confidence: 0.83, classification_status: 'CLASSIFIED', tags: '{mining,safety,inspection,osha}', created_by: USERS.james, created_at: daysAgo(85) },
    { id: rid(31), title: 'DHHS Public Health Emergency Plans', description: 'County-level public health emergency preparedness plans', record_type: 'plan', agency_id: AGENCIES.DHH, agency_code: 'DHH', retention_schedule_id: SCHEDULES.admin, series_title: 'Emergency Plans', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0131', status: 'active', ai_confidence: 0.92, classification_status: 'CLASSIFIED', tags: '{emergency,public-health,preparedness}', created_by: USERS.james, created_at: daysAgo(95) },
    { id: rid(32), title: 'DOT Snow Removal Expenditure Reports 2024-2025', description: 'Winter season snow removal costs by district and contractor', record_type: 'financial', agency_id: AGENCIES.DOT, agency_code: 'DOT', retention_schedule_id: SCHEDULES.financial, series_title: 'Snow Removal Records', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0132', status: 'active', ai_confidence: 0.88, classification_status: 'CLASSIFIED', tags: '{snow-removal,expenditure,winter,contracts}', created_by: USERS.michael, created_at: daysAgo(14) },
    { id: rid(33), title: 'DEP Coastal Erosion Survey Data 2024', description: 'Coastal erosion monitoring data and shoreline change assessments', record_type: 'survey', agency_id: AGENCIES.DEP, agency_code: 'DEP', retention_schedule_id: SCHEDULES.admin, series_title: 'Coastal Surveys', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0133', status: 'active', ai_confidence: 0.76, classification_status: 'NEEDS_REVIEW', tags: '{coastal,erosion,survey,climate}', created_by: USERS.diana, created_at: daysAgo(33) },
    { id: rid(34), title: 'DPS Sex Offender Registry Updates Q1 2025', description: 'Registry updates and compliance verification records', record_type: 'registry', agency_id: AGENCIES.DPS, agency_code: 'DPS', retention_schedule_id: SCHEDULES.legal, series_title: 'Sex Offender Registry', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0134', status: 'active', ai_confidence: 0.95, classification_status: 'CLASSIFIED', tags: '{registry,compliance,confidential,legal}', created_by: USERS.sarah, created_at: daysAgo(16) },
    { id: rid(35), title: 'AG Environmental Enforcement Actions 2024', description: 'Legal enforcement actions for environmental regulation violations', record_type: 'enforcement', agency_id: AGENCIES.AGO, agency_code: 'AGO', retention_schedule_id: SCHEDULES.legal, series_title: 'Environmental Enforcement', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0135', status: 'active', location_id: LOCATIONS.aug_f1_a_01, location_code: 'SRC-AUG-F1-A-01', barcode: 'BOX-AGO-4002', ai_confidence: 0.89, classification_status: 'CLASSIFIED', tags: '{enforcement,environmental,legal,violations}', created_by: USERS.michael, created_at: daysAgo(52) },
    { id: rid(36), title: 'DOE School Nutrition Program Records', description: 'Federal school lunch and breakfast program compliance documentation', record_type: 'program', agency_id: AGENCIES.DOE, agency_code: 'DOE', retention_schedule_id: SCHEDULES.admin, series_title: 'Nutrition Programs', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0136', status: 'active', ai_confidence: 0.81, classification_status: 'CLASSIFIED', tags: '{nutrition,school-lunch,federal,compliance}', created_by: USERS.diana, created_at: daysAgo(27) },
    { id: rid(37), title: 'MSA Cemetery Records Digitization Project', description: 'Digitized cemetery and burial records from 19th century Maine', record_type: 'historical', agency_id: AGENCIES.MSA, agency_code: 'MSA', retention_schedule_id: SCHEDULES.legal, series_title: 'Cemetery Records', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0137', status: 'active', has_document: true, document_key: 'documents/cemetery-digitization-batch1.pdf', ai_confidence: 0.96, classification_status: 'CLASSIFIED', tags: '{cemetery,historical,digitization,genealogy}', created_by: USERS.sarah, created_at: daysAgo(110) },
    { id: rid(38), title: 'DOL Wage and Hour Violation Cases 2024', description: 'Wage theft and hour violation investigation case files', record_type: 'case_file', agency_id: AGENCIES.DOL, agency_code: 'DOL', retention_schedule_id: SCHEDULES.legal, series_title: 'Wage Violation Cases', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0138', status: 'on_hold', location_id: LOCATIONS.aug_f1_b, location_code: 'SRC-AUG-F1-B', barcode: 'BOX-DOL-2004', ai_confidence: 0.90, classification_status: 'CLASSIFIED', tags: '{wages,violations,investigation,legal}', created_by: USERS.james, created_at: daysAgo(80) },
    { id: rid(39), title: 'DHHS Substance Abuse Treatment Referrals', description: 'Treatment referral documentation for opioid response program', record_type: 'medical', agency_id: AGENCIES.DHH, agency_code: 'DHH', retention_schedule_id: SCHEDULES.personnel, series_title: 'Substance Abuse Referrals', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0139', status: 'active', ai_confidence: 0.84, classification_status: 'CLASSIFIED', tags: '{substance-abuse,treatment,opioid,confidential}', created_by: USERS.james, created_at: daysAgo(19) },
    { id: rid(40), title: 'DOT Public Transit Grant Applications 2025', description: 'Federal transit grant applications for rural and urban programs', record_type: 'grant', agency_id: AGENCIES.DOT, agency_code: 'DOT', retention_schedule_id: SCHEDULES.financial, series_title: 'Transit Grants', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0140', status: 'active', ai_confidence: 0.73, classification_status: 'NEEDS_REVIEW', tags: '{transit,grants,federal,applications}', created_by: USERS.michael, created_at: daysAgo(6) },
    { id: rid(41), title: 'DEP PFAS Contamination Site Records', description: 'Per- and polyfluoroalkyl substances contamination monitoring and remediation records', record_type: 'environmental', agency_id: AGENCIES.DEP, agency_code: 'DEP', retention_schedule_id: SCHEDULES.legal, series_title: 'PFAS Records', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0141', status: 'on_hold', ai_confidence: 0.91, classification_status: 'CLASSIFIED', tags: '{pfas,contamination,remediation,health}', created_by: USERS.diana, created_at: daysAgo(45) },
    { id: rid(42), title: 'DPS Emergency Communications Logs 2025', description: 'E-911 dispatch logs and emergency communications records', record_type: 'log', agency_id: AGENCIES.DPS, agency_code: 'DPS', retention_schedule_id: SCHEDULES.admin, series_title: 'E-911 Logs', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0142', status: 'active', ai_confidence: 0.94, classification_status: 'CLASSIFIED', tags: '{911,emergency,dispatch,communications}', created_by: USERS.sarah, created_at: daysAgo(2) },
    { id: rid(43), title: 'AG Charitable Trust Registration Files', description: 'Registration and annual reporting files for charitable organizations', record_type: 'registration', agency_id: AGENCIES.AGO, agency_code: 'AGO', retention_schedule_id: SCHEDULES.correspondence, series_title: 'Charitable Trusts', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0143', status: 'active', ai_confidence: 0.86, classification_status: 'CLASSIFIED', tags: '{charitable,trusts,registration,nonprofits}', created_by: USERS.michael, created_at: daysAgo(58) },
    { id: rid(44), title: 'MSA State Employee Oath of Office Records', description: 'Signed oath of office documents for state employees and officials', record_type: 'administrative', agency_id: AGENCIES.MSA, agency_code: 'MSA', retention_schedule_id: SCHEDULES.legal, series_title: 'Oath of Office', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0144', status: 'active', location_id: LOCATIONS.aug_f1_a_02, location_code: 'SRC-AUG-F1-A-02', barcode: 'BOX-MSA-8001', ai_confidence: 0.97, classification_status: 'CLASSIFIED', tags: '{oath,officials,legal,permanent}', created_by: USERS.sarah, created_at: daysAgo(130) },
    { id: rid(45), title: 'DOE Student Assessment Data 2024', description: 'Statewide student assessment results and performance metrics', record_type: 'data', agency_id: AGENCIES.DOE, agency_code: 'DOE', retention_schedule_id: SCHEDULES.admin, series_title: 'Student Assessments', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0145', status: 'active', ai_confidence: 0.88, classification_status: 'CLASSIFIED', tags: '{students,assessment,performance,education}', created_by: USERS.diana, created_at: daysAgo(62) },
    { id: rid(46), title: 'Unclassified Intake - Box from DOT Portland Office', description: 'Received physical box from DOT Portland regional office, contents not yet inventoried', record_type: 'unclassified', agency_id: AGENCIES.DOT, agency_code: 'DOT', series_title: null, media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0146', status: 'active', location_id: LOCATIONS.portland, location_code: 'SRC-PTL', barcode: 'BOX-DOT-5002', ai_confidence: null, classification_status: 'PENDING', tags: '{}', created_by: USERS.michael, created_at: daysAgo(1) },
    { id: rid(47), title: 'Unclassified Scan - DHHS Internal Memo', description: 'Scanned internal memo from DHHS Commissioner office, awaiting classification', record_type: 'unclassified', agency_id: AGENCIES.DHH, agency_code: 'DHH', series_title: null, media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0147', status: 'active', has_document: true, document_key: 'documents/dhhs-memo-scan.pdf', ai_confidence: null, classification_status: 'PENDING', tags: '{}', created_by: USERS.james, created_at: daysAgo(1) },
    { id: rid(48), title: 'DEP Land Use Planning Documents', description: 'Municipal land use planning and zoning compliance records', record_type: 'planning', agency_id: AGENCIES.DEP, agency_code: 'DEP', retention_schedule_id: SCHEDULES.admin, series_title: 'Land Use Planning', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0148', status: 'archived', ai_confidence: 0.87, classification_status: 'CLASSIFIED', tags: '{land-use,planning,zoning,municipal}', created_by: USERS.diana, created_at: daysAgo(365) },
    { id: rid(49), title: 'DPS Forensic Lab Analysis Reports 2023', description: 'Forensic laboratory analysis reports and chain of custody documentation', record_type: 'forensic', agency_id: AGENCIES.DPS, agency_code: 'DPS', retention_schedule_id: SCHEDULES.legal, series_title: 'Forensic Lab Reports', media_type: 'PHYSICAL', tracking_number: 'RMS-20260101-0149', status: 'destroyed', location_id: null, location_code: null, ai_confidence: 0.93, classification_status: 'CLASSIFIED', tags: '{forensic,laboratory,legal,evidence}', created_by: USERS.sarah, created_at: daysAgo(400) },
    { id: rid(50), title: 'MSA Genealogical Research Request Responses', description: 'Completed genealogical research requests and responses provided to public', record_type: 'correspondence', agency_id: AGENCIES.MSA, agency_code: 'MSA', retention_schedule_id: SCHEDULES.correspondence, series_title: 'Genealogical Research', media_type: 'DIGITAL', tracking_number: 'RMS-20260101-0150', status: 'active', ai_confidence: 0.85, classification_status: 'CLASSIFIED', tags: '{genealogy,research,public-request}', created_by: USERS.sarah, created_at: daysAgo(24) },
  ];

  await knex('records').insert(records);

  // --- Backfill digitalmaine.com-style classification metadata ---
  // Mirrors the public Maine Digital Commons schema so the demo can show parity
  // with how the State already publishes archival records.
  const DM_DOC_TYPES = ['Text', 'Image', 'Audio', 'Video', 'Map'] as const;
  const DM_LOCATIONS = [
    'Augusta, ME', 'Portland, ME', 'Bangor, ME', 'Lewiston, ME', 'Biddeford, ME',
    'Brunswick, ME', 'Waterville, ME', 'Rockland, ME',
  ];
  const DM_KEYWORD_POOL: Record<string, string[]> = {
    MSA: ['Maine', 'State Archives', 'Government', 'Public Records'],
    DHH: ['Maine', 'Health and Human Services', 'Public Health', 'Welfare'],
    DOE: ['Maine', 'Education', 'Schools', 'Students'],
    DOT: ['Maine', 'Transportation', 'Highways', 'Infrastructure'],
    DEP: ['Maine', 'Environment', 'Conservation', 'Permits'],
    DOL: ['Maine', 'Labor', 'Workforce', 'Compliance'],
    DPS: ['Maine', 'Public Safety', 'Law Enforcement', 'Emergency'],
    AGO: ['Maine', 'Attorney General', 'Litigation', 'Legal'],
  };

  for (let i = 1; i <= 50; i += 1) {
    const r = records[i - 1];
    const docType = (r.media_type === 'PHYSICAL' && (r.record_type || '').includes('map'))
      ? 'Map'
      : DM_DOC_TYPES[i % DM_DOC_TYPES.length];
    const location = DM_LOCATIONS[i % DM_LOCATIONS.length];
    const agencyKey = (r.agency_code || 'MSA') as keyof typeof DM_KEYWORD_POOL;
    const baseKeywords = DM_KEYWORD_POOL[agencyKey] || DM_KEYWORD_POOL.MSA;
    const seriesKeyword = (r.series_title || '').split(' ').slice(0, 2).join(' ');
    const keywords = Array.from(new Set([...baseKeywords, seriesKeyword].filter(Boolean)));
    const dmIdentifier = `${String(15 + (i % 10)).padStart(2, '0')}-${String(28000 + i).padStart(5, '0')}-F${String(i).padStart(3, '0')}-I${String((i * 7) % 100).padStart(3, '0')}`;
    const exactDate = new Date(Date.now() - (60 + i) * 86400000).toISOString().slice(0, 10);
    const createdYear = (r.created_at as Date).getFullYear();
    const citation = `${(r.agency_code || 'MSA')} (${createdYear}). "${r.title}". Maine State Archives, Series: ${r.series_title || 'General'}. Identifier ${dmIdentifier}.`;

    await knex('records').where({ id: r.id }).update({
      contributing_institution: 'Maine State Archives',
      document_type_dm: docType,
      dm_identifier: dmIdentifier,
      exact_creation_date: exactDate,
      doc_language: 'English',
      doc_location: location,
      keywords: keywords,
      recommended_citation: citation,
    });
  }

  // --- Transmittals at various stages ---
  const transmittals = [
    { id: tid(1), title: 'DOT Portland Office - Annual Records Transfer', description: 'Annual transfer of completed project files from Portland office', agency_id: AGENCIES.DOT, status: 'submitted', submitted_by: USERS.michael, submitted_at: daysAgo(5), created_by: USERS.michael, created_at: daysAgo(7) },
    { id: tid(2), title: 'DHHS - Medicaid Case Files Transfer', description: 'Transfer of closed Medicaid eligibility files to Archives', agency_id: AGENCIES.DHH, status: 'received', submitted_by: USERS.diana, submitted_at: daysAgo(12), received_by: USERS.sarah, received_at: daysAgo(8), created_by: USERS.diana, created_at: daysAgo(14) },
    { id: tid(3), title: 'DOE - Teacher Records End of Year Transfer', description: 'End of school year records transfer from Department of Education', agency_id: AGENCIES.DOE, status: 'approved', submitted_by: USERS.diana, submitted_at: daysAgo(20), approved_by: USERS.sarah, approved_at: daysAgo(15), created_by: USERS.diana, created_at: daysAgo(22) },
    { id: tid(4), title: 'DEP - Expired Permits Archive Transfer', description: 'Transfer of expired environmental permits for archival', agency_id: AGENCIES.DEP, status: 'draft', created_by: USERS.diana, created_at: daysAgo(2) },
    { id: tid(5), title: 'DPS - Cold Case Evidence Documentation', description: 'Transfer of cold case file copies to State Archives', agency_id: AGENCIES.DPS, status: 'submitted', submitted_by: USERS.sarah, submitted_at: daysAgo(3), created_by: USERS.sarah, created_at: daysAgo(4) },
    { id: tid(6), title: 'AG Office - Closed Civil Cases 2023', description: 'Batch transfer of closed civil litigation files', agency_id: AGENCIES.AGO, status: 'received', submitted_by: USERS.michael, submitted_at: daysAgo(30), received_by: USERS.sarah, received_at: daysAgo(25), created_by: USERS.michael, created_at: daysAgo(32) },
    { id: tid(7), title: 'DOL - Archived Apprenticeship Records', description: 'Completed apprenticeship program records from 2020-2022', agency_id: AGENCIES.DOL, status: 'rejected', submitted_by: USERS.james, submitted_at: daysAgo(18), rejection_reason: 'Missing inventory list and box labels. Please resubmit with complete manifest.', created_by: USERS.james, created_at: daysAgo(20) },
  ];

  await knex('transmittals').insert(transmittals);

  // Transmittal items
  const transmittalItems = [
    { id: 'a0a1b2c3-9999-4000-8000-100000000001', transmittal_id: tid(1), record_id: rid(3) },
    { id: 'a0a1b2c3-9999-4000-8000-100000000002', transmittal_id: tid(1), record_id: rid(11) },
    { id: 'a0a1b2c3-9999-4000-8000-100000000003', transmittal_id: tid(2), record_id: rid(2) },
    { id: 'a0a1b2c3-9999-4000-8000-100000000004', transmittal_id: tid(2), record_id: rid(10) },
    { id: 'a0a1b2c3-9999-4000-8000-100000000005', transmittal_id: tid(3), record_id: rid(8) },
    { id: 'a0a1b2c3-9999-4000-8000-100000000006', transmittal_id: tid(5), record_id: rid(6) },
    { id: 'a0a1b2c3-9999-4000-8000-100000000007', transmittal_id: tid(6), record_id: rid(7) },
    { id: 'a0a1b2c3-9999-4000-8000-100000000008', transmittal_id: tid(6), record_id: rid(35) },
  ];

  await knex('transmittal_items').insert(transmittalItems);

  // --- Dispositions at different approval levels ---
  const dispositions = [
    { id: did(1), title: 'Destroy - Expired Correspondence Records 2019', description: 'Routine destruction of expired correspondence per COR-001 schedule', agency_id: AGENCIES.MSA, disposition_action: 'destroy', status: 'pending_approval', initiated_by: USERS.diana, initiated_at: daysAgo(10), first_approver_id: USERS.michael, first_approved_at: daysAgo(7), created_at: daysAgo(10) },
    { id: did(2), title: 'Transfer - Historical Land Records to Archives', description: 'Transfer of historical land survey records to permanent archives', agency_id: AGENCIES.DEP, disposition_action: 'transfer', status: 'pending_approval', initiated_by: USERS.michael, initiated_at: daysAgo(15), created_at: daysAgo(15) },
    { id: did(3), title: 'Archive - DOT Project Files 2018-2020', description: 'Move completed transportation project files to permanent archive storage', agency_id: AGENCIES.DOT, disposition_action: 'archive', status: 'approved', initiated_by: USERS.michael, initiated_at: daysAgo(45), first_approver_id: USERS.diana, first_approved_at: daysAgo(40), second_approver_id: USERS.sarah, second_approved_at: daysAgo(35), third_approver_id: USERS.sarah, third_approved_at: daysAgo(30), certificate_number: 'CERT-B0B1C2D3-M4N5O6P7', completed_at: daysAgo(30), created_at: daysAgo(45) },
    { id: did(4), title: 'Destroy - DOL Routine Admin Records 2020', description: 'Scheduled destruction of routine administrative files per ADM-001', agency_id: AGENCIES.DOL, disposition_action: 'destroy', status: 'pending_approval', initiated_by: USERS.james, initiated_at: daysAgo(8), first_approver_id: USERS.michael, first_approved_at: daysAgo(5), second_approver_id: USERS.diana, second_approved_at: daysAgo(3), created_at: daysAgo(8) },
    { id: did(5), title: 'Transfer - AG Historical Opinions to Archives', description: 'Transfer of AG advisory opinions from 2000-2010 to state archives', agency_id: AGENCIES.AGO, disposition_action: 'transfer', status: 'rejected', initiated_by: USERS.michael, initiated_at: daysAgo(25), rejection_reason: 'Cannot transfer while active legal hold exists on related records.', created_at: daysAgo(25) },
  ];

  await knex('dispositions').insert(dispositions);

  // Disposition items
  const dispositionItems = [
    { id: 'b0b1c2d3-aaaa-4000-8000-100000000001', disposition_id: did(1), record_id: rid(13), has_legal_hold: false },
    { id: 'b0b1c2d3-aaaa-4000-8000-100000000002', disposition_id: did(2), record_id: rid(25), has_legal_hold: false },
    { id: 'b0b1c2d3-aaaa-4000-8000-100000000003', disposition_id: did(4), record_id: rid(30), has_legal_hold: false },
  ];

  await knex('disposition_items').insert(dispositionItems);

  // --- Legal holds ---
  const legalHolds = [
    { id: 'a1a2b3c4-7777-4000-8000-000000000002', record_id: rid(6), reason: 'Pending internal affairs investigation - Case IA-2025-0042', placed_by: USERS.sarah, is_active: true },
    { id: 'a1a2b3c4-7777-4000-8000-000000000003', record_id: rid(7), reason: 'Active civil litigation - Smith v. State of Maine', placed_by: USERS.sarah, is_active: true },
    { id: 'a1a2b3c4-7777-4000-8000-000000000004', record_id: rid(38), reason: 'DOL wage theft class action - pending court ruling', placed_by: USERS.sarah, is_active: true },
    { id: 'a1a2b3c4-7777-4000-8000-000000000005', record_id: rid(41), reason: 'PFAS litigation hold - multi-party environmental suit', placed_by: USERS.sarah, is_active: true },
  ];

  await knex('legal_holds').insert(legalHolds);

  // --- Circulation events ---
  const circulationEvents = [
    { id: cid(1), record_id: rid(11), user_id: USERS.james, event_type: 'checkout', purpose: 'Contract renewal review', checked_out_at: daysAgo(7), due_date: daysFromNow(7), agency_id: AGENCIES.DOT },
    { id: cid(2), record_id: rid(28), user_id: USERS.diana, event_type: 'checkout', purpose: 'IEP audit preparation', checked_out_at: daysAgo(14), due_date: daysAgo(3), agency_id: AGENCIES.DOE }, // overdue!
    { id: cid(3), record_id: rid(3), user_id: USERS.michael, event_type: 'checkout', purpose: 'Bridge inspection follow-up', checked_out_at: daysAgo(30), due_date: daysAgo(15), checked_in_at: daysAgo(12), agency_id: AGENCIES.DOT },
    { id: cid(4), record_id: rid(3), user_id: USERS.james, event_type: 'checkin', notes: 'Returned after review, no issues', checked_in_at: daysAgo(12), agency_id: AGENCIES.DOT },
    { id: cid(5), record_id: rid(10), user_id: USERS.diana, event_type: 'checkout', purpose: 'FY2024 reconciliation', checked_out_at: daysAgo(5), due_date: daysFromNow(10), agency_id: AGENCIES.DHH },
    { id: cid(6), record_id: rid(44), user_id: USERS.sarah, event_type: 'checkout', purpose: 'Verification for new appointees', checked_out_at: daysAgo(3), due_date: daysFromNow(14), agency_id: AGENCIES.MSA },
    { id: cid(7), record_id: rid(23), user_id: USERS.james, event_type: 'checkout', purpose: 'Compliance follow-up review', checked_out_at: daysAgo(20), due_date: daysAgo(5), agency_id: AGENCIES.DHH }, // overdue!
    { id: cid(8), record_id: rid(5), user_id: USERS.james, event_type: 'checkout', purpose: 'Quarterly claims audit', checked_out_at: daysAgo(45), due_date: daysAgo(30), checked_in_at: daysAgo(28), agency_id: AGENCIES.DOL },
    { id: cid(9), record_id: rid(5), user_id: USERS.james, event_type: 'checkin', notes: 'Returned after quarterly review', checked_in_at: daysAgo(28), agency_id: AGENCIES.DOL },
  ];

  await knex('circulation_events').insert(circulationEvents);

  // --- Notifications ---
  const notifications = [
    { id: nid(1), user_id: USERS.sarah, type: 'disposition_approval', title: 'Disposition Awaits Final Approval', message: 'DOL routine admin records destruction requires your Level 3 approval', entity_type: 'disposition', entity_id: did(4), is_read: false, created_at: daysAgo(3) },
    { id: nid(2), user_id: USERS.sarah, type: 'classification_complete', title: '12 Records Classified by AI', message: '12 new records classified. 2 below confidence threshold require manual review.', entity_type: 'record', entity_id: rid(4), is_read: false, created_at: daysAgo(1) },
    { id: nid(3), user_id: USERS.sarah, type: 'transmittal_received', title: 'New Transmittal Submitted', message: 'DOT Portland Office submitted annual records transfer (2 boxes, 45 items)', entity_type: 'transmittal', entity_id: tid(1), is_read: false, created_at: daysAgo(5) },
    { id: nid(4), user_id: USERS.michael, type: 'overdue_checkout', title: 'Overdue Record Return', message: 'DOE Special Education IEP Records 2024 is 3 days overdue for return', entity_type: 'record', entity_id: rid(28), is_read: false, created_at: daysAgo(3) },
    { id: nid(5), user_id: USERS.diana, type: 'retention_alert', title: 'Retention Schedule Expiring', message: '8 records reach retention deadline within 30 days. Review required.', entity_type: 'record', entity_id: rid(13), is_read: false, created_at: daysAgo(2) },
    { id: nid(6), user_id: USERS.sarah, type: 'legal_hold', title: 'New Legal Hold Placed', message: 'Legal hold placed on PFAS contamination records per litigation requirement', entity_type: 'record', entity_id: rid(41), is_read: true, read_at: daysAgo(1), created_at: daysAgo(2) },
    { id: nid(7), user_id: USERS.james, type: 'transmittal_rejected', title: 'Transmittal Rejected', message: 'Your archived apprenticeship records transmittal was rejected. Missing inventory list.', entity_type: 'transmittal', entity_id: tid(7), is_read: false, created_at: daysAgo(18) },
  ];

  await knex('notifications').insert(notifications);

  // --- Audit events ---
  const auditEvents = [
    { id: aid(1), user_id: USERS.sarah, user_email: 'sarah.chen@maine.gov', agency_id: AGENCIES.MSA, action: 'RECORD_CREATED', resource_type: 'record', resource_id: rid(1), metadata: JSON.stringify({ title: 'Governor Executive Orders 2024' }), created_at: daysAgo(45) },
    { id: aid(2), user_id: USERS.michael, user_email: 'michael.torres@maine.gov', agency_id: AGENCIES.MSA, action: 'AI_CLASSIFICATION', resource_type: 'record', resource_id: rid(1), metadata: JSON.stringify({ confidence: 0.94, series: 'Executive Orders' }), created_at: daysAgo(45) },
    { id: aid(3), user_id: USERS.diana, user_email: 'diana.patel@maine.gov', agency_id: AGENCIES.DHH, action: 'RECORD_CREATED', resource_type: 'record', resource_id: rid(2), metadata: JSON.stringify({ title: 'DHHS Foster Care Case Files Q1 2025' }), created_at: daysAgo(30) },
    { id: aid(4), user_id: USERS.michael, user_email: 'michael.torres@maine.gov', agency_id: AGENCIES.DOT, action: 'TRANSMITTAL_SUBMITTED', resource_type: 'transmittal', resource_id: tid(1), metadata: JSON.stringify({ title: 'DOT Portland Office - Annual Records Transfer' }), created_at: daysAgo(5) },
    { id: aid(5), user_id: USERS.sarah, user_email: 'sarah.chen@maine.gov', agency_id: AGENCIES.MSA, action: 'LEGAL_HOLD_PLACED', resource_type: 'record', resource_id: rid(41), metadata: JSON.stringify({ reason: 'PFAS litigation hold' }), created_at: daysAgo(2) },
    { id: aid(6), user_id: USERS.diana, user_email: 'diana.patel@maine.gov', agency_id: AGENCIES.DOL, action: 'DISPOSITION_INITIATED', resource_type: 'disposition', resource_id: did(1), metadata: JSON.stringify({ action: 'destroy', record_count: 1 }), created_at: daysAgo(10) },
    { id: aid(7), user_id: USERS.michael, user_email: 'michael.torres@maine.gov', agency_id: AGENCIES.MSA, action: 'DISPOSITION_APPROVED', resource_type: 'disposition', resource_id: did(1), metadata: JSON.stringify({ level: 'first' }), created_at: daysAgo(7) },
    { id: aid(8), user_id: USERS.james, user_email: 'james.wright@maine.gov', agency_id: AGENCIES.DOT, action: 'RECORD_CHECKOUT', resource_type: 'record', resource_id: rid(11), metadata: JSON.stringify({ purpose: 'Contract renewal review', due_date: daysFromNow(7).toISOString() }), created_at: daysAgo(7) },
    { id: aid(9), user_id: USERS.sarah, user_email: 'sarah.chen@maine.gov', agency_id: AGENCIES.MSA, action: 'RECORD_CREATED', resource_type: 'record', resource_id: rid(22), metadata: JSON.stringify({ title: 'Vital Records Index Updates - 2025' }), created_at: daysAgo(3) },
    { id: aid(10), user_id: USERS.sarah, user_email: 'sarah.chen@maine.gov', agency_id: AGENCIES.MSA, action: 'OCR_PROCESSED', resource_type: 'record', resource_id: rid(16), metadata: JSON.stringify({ pages: 24, confidence: 0.97 }), created_at: daysAgo(100) },
  ];

  await knex('audit_events').insert(auditEvents);

  // --- Templates ---
  const templates = [
    { id: 'f1f2a3b4-eeee-4000-8000-000000000001', name: 'Correspondence', description: 'Template for general agency correspondence and memos', agency_id: null, field_definitions: JSON.stringify([{ name: 'sender', label: 'Sender Name', type: 'text', required: true }, { name: 'recipient', label: 'Recipient', type: 'text', required: true }, { name: 'subject', label: 'Subject', type: 'text', required: true }, { name: 'date_sent', label: 'Date Sent', type: 'date', required: true }, { name: 'priority', label: 'Priority', type: 'select', options: ['Normal', 'High', 'Urgent'], required: false }]), is_active: true },
    { id: 'f1f2a3b4-eeee-4000-8000-000000000002', name: 'Financial Audit', description: 'Template for financial audit documentation and findings', agency_id: null, field_definitions: JSON.stringify([{ name: 'fiscal_year', label: 'Fiscal Year', type: 'text', required: true }, { name: 'department', label: 'Department', type: 'text', required: true }, { name: 'auditor', label: 'Lead Auditor', type: 'text', required: true }, { name: 'finding_count', label: 'Number of Findings', type: 'number', required: false }, { name: 'risk_level', label: 'Overall Risk Level', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: true }]), is_active: true },
    { id: 'f1f2a3b4-eeee-4000-8000-000000000003', name: 'Legal Document', description: 'Template for legal filings, opinions, and case documentation', agency_id: null, field_definitions: JSON.stringify([{ name: 'case_number', label: 'Case Number', type: 'text', required: true }, { name: 'case_type', label: 'Case Type', type: 'select', options: ['Civil', 'Criminal', 'Administrative', 'Advisory'], required: true }, { name: 'parties', label: 'Parties Involved', type: 'text', required: true }, { name: 'filing_date', label: 'Filing Date', type: 'date', required: true }, { name: 'court', label: 'Court/Jurisdiction', type: 'text', required: false }]), is_active: true },
  ];

  await knex('record_templates').insert(templates);
}

export async function down(knex: Knex): Promise<void> {
  await knex('record_templates').whereIn('id', ['f1f2a3b4-eeee-4000-8000-000000000001', 'f1f2a3b4-eeee-4000-8000-000000000002', 'f1f2a3b4-eeee-4000-8000-000000000003']).del();
  await knex('audit_events').where('id', 'like', 'e0e1f2a3-dddd-4000-8000%').del();
  await knex('notifications').where('id', 'like', 'd0d1e2f3-cccc-4000-8000%').del();
  await knex('circulation_events').where('id', 'like', 'c0c1d2e3-bbbb-4000-8000%').del();
  await knex('legal_holds').whereIn('id', ['a1a2b3c4-7777-4000-8000-000000000002', 'a1a2b3c4-7777-4000-8000-000000000003', 'a1a2b3c4-7777-4000-8000-000000000004', 'a1a2b3c4-7777-4000-8000-000000000005']).del();
  await knex('disposition_items').where('id', 'like', 'b0b1c2d3-aaaa-4000-8000-1%').del();
  await knex('dispositions').where('id', 'like', 'b0b1c2d3-aaaa-4000-8000%').del();
  await knex('transmittal_items').where('id', 'like', 'a0a1b2c3-9999-4000-8000-1%').del();
  await knex('transmittals').where('id', 'like', 'a0a1b2c3-9999-4000-8000%').del();
  await knex('records').where('id', 'like', 'e5f6a7b8-5555-4000-8000-1%').del();
}
