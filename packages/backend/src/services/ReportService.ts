import NodeCache from 'node-cache';
import { Knex } from 'knex';

const cache = new NodeCache({ stdTTL: 300 });

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class ReportService {
  constructor(private db: Knex) {}

  async getDashboardMetrics(agencyId?: string) {
    const cacheKey = `dashboard:${agencyId || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const baseQuery = agencyId ? this.db('records').where({ agency_id: agencyId }) : this.db('records');

    const [totalRecords] = await baseQuery.clone().count('* as count');
    const [activeRecords] = await baseQuery.clone().where({ status: 'ACTIVE' }).count('* as count');
    const [pendingTransmittals] = await this.db('transmittals')
      .where(agencyId ? { agency_id: agencyId, status: 'submitted' } : { status: 'submitted' })
      .count('* as count');
    const [pendingDispositions] = await this.db('dispositions')
      .where(agencyId ? { agency_id: agencyId, status: 'pending_approval' } : { status: 'pending_approval' })
      .count('* as count');
    const [overdueCheckouts] = await this.db('circulation_events')
      .where({ event_type: 'checkout' })
      .whereNull('checked_in_at')
      .where('due_date', '<', new Date())
      .count('* as count');

    const recentActivity = await this.db('audit_events')
      .orderBy('created_at', 'desc')
      .limit(10);

    const recordsByType = await baseQuery.clone()
      .select('media_type')
      .count('* as count')
      .groupBy('media_type');

    const metrics = {
      totalRecords: Number(totalRecords.count),
      activeRecords: Number(activeRecords.count),
      pendingTransmittals: Number(pendingTransmittals.count),
      pendingDispositions: Number(pendingDispositions.count),
      overdueCheckouts: Number(overdueCheckouts.count),
      recentActivity,
      recordsByType,
    };

    cache.set(cacheKey, metrics);
    return metrics;
  }

  async getRetentionReport(agencyId?: string) {
    const cacheKey = `retention:${agencyId || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const query = this.db('records')
      .join('retention_schedules', 'records.retention_schedule_id', 'retention_schedules.id')
      .select('retention_schedules.name', 'retention_schedules.code')
      .count('records.id as count')
      .groupBy('retention_schedules.name', 'retention_schedules.code');

    if (agencyId) query.where('records.agency_id', agencyId);

    const result = await query;
    cache.set(cacheKey, result);
    return result;
  }

  async getActivityReport(agencyId?: string, days = 30) {
    const cacheKey = `activity:${agencyId || 'all'}:${days}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const query = this.db('audit_events')
      .where('created_at', '>=', since)
      .select(this.db.raw("DATE(created_at) as date"))
      .count('* as count')
      .groupByRaw('DATE(created_at)')
      .orderBy('date');

    if (agencyId) query.where({ agency_id: agencyId });

    const result = await query;
    cache.set(cacheKey, result);
    return result;
  }

  async generateReport(reportId: string, format: string, agencyId?: string, dateFrom?: string, dateTo?: string): Promise<{ content: string; contentType: string; filename: string }> {
    let data: any[];
    let title: string;
    let columns: string[];

    switch (reportId) {
      case 'retention-compliance':
        data = await this.getRetentionReport(agencyId) as any[];
        title = 'Retention Compliance Report';
        columns = ['Schedule Name', 'Series Code', 'Record Count'];
        break;
      case 'disposition-summary':
        data = await this.db('dispositions')
          .select('status', 'disposition_type')
          .count('* as count')
          .groupBy('status', 'disposition_type');
        title = 'Disposition Summary Report';
        columns = ['Status', 'Type', 'Count'];
        break;
      case 'agency-activity':
        data = await this.getActivityReport(agencyId) as any[];
        title = 'Agency Activity Report';
        columns = ['Date', 'Event Count'];
        break;
      case 'inventory-status':
        data = await this.db('locations')
          .select('name', 'code', 'location_type', 'capacity', 'current_count')
          .where({ is_active: true })
          .orderBy('name');
        title = 'Inventory Status Report';
        columns = ['Name', 'Code', 'Type', 'Capacity', 'Current Count'];
        break;
      case 'audit-trail':
        data = await this.db('audit_events')
          .select('action', 'resource_type', 'resource_id', 'user_email', 'created_at')
          .orderBy('created_at', 'desc')
          .limit(500);
        title = 'Audit Trail Report';
        columns = ['Action', 'Resource Type', 'Resource ID', 'User', 'Timestamp'];
        break;
      case 'legal-holds':
        data = await this.db('legal_holds')
          .select('record_id', 'reason', 'is_active', 'placed_at', 'released_at');
        title = 'Legal Holds Report';
        columns = ['Record ID', 'Reason', 'Active', 'Placed', 'Released'];
        break;
      default:
        data = [];
        title = 'Report';
        columns = [];
    }

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv' || format === 'excel') {
      const rows = data.map((row) => Object.values(row).map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
      const csv = [columns.join(','), ...rows].join('\n');
      return {
        content: csv,
        contentType: 'text/csv',
        filename: `${reportId}-${timestamp}.csv`,
      };
    }

    // PDF format — return printable HTML
    const tableRows = data.map((row) =>
      `<tr>${Object.values(row).map((v) => `<td style="border:1px solid #e2e8f0;padding:6px 10px;font-size:12px;">${escapeHtml(String(v ?? ''))}</td>`).join('')}</tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title>
<style>body{font-family:Inter,sans-serif;margin:40px;color:#1e293b}
h1{font-size:18px;color:#003366;margin-bottom:4px}
.meta{font-size:12px;color:#64748b;margin-bottom:20px}
table{border-collapse:collapse;width:100%}
th{background:#f1f5f9;border:1px solid #e2e8f0;padding:8px 10px;font-size:11px;text-transform:uppercase;text-align:left;color:#475569}
@media print{body{margin:20px}}</style></head>
<body><h1>${escapeHtml(title)}</h1>
<p class="meta">Generated: ${escapeHtml(new Date().toLocaleString())} | Period: ${escapeHtml(dateFrom || 'All')} to ${escapeHtml(dateTo || 'Present')}</p>
<table><thead><tr>${columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
<tbody>${tableRows}</tbody></table>
<script>window.onload=function(){window.print()}</script></body></html>`;

    return {
      content: html,
      contentType: 'text/html',
      filename: `${reportId}-${timestamp}.html`,
    };
  }
}
