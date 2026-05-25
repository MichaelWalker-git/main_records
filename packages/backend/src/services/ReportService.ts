import NodeCache from 'node-cache';
import { Knex } from 'knex';

const cache = new NodeCache({ stdTTL: 300 });

export class ReportService {
  constructor(private db: Knex) {}

  async getDashboardMetrics(agencyId?: string) {
    const cacheKey = `dashboard:${agencyId || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const baseQuery = agencyId ? this.db('records').where({ agency_id: agencyId }) : this.db('records');

    const [totalRecords] = await baseQuery.clone().count('* as count');
    const [activeRecords] = await baseQuery.clone().where({ status: 'active' }).count('* as count');
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
      .modify((qb: any) => { if (agencyId) qb.where({ agency_id: agencyId }); })
      .count('* as count');

    const recentActivity = await this.db('audit_events')
      .modify((qb: any) => { if (agencyId) qb.where({ agency_id: agencyId }); })
      .orderBy('created_at', 'desc')
      .limit(10);

    const recordsByType = await baseQuery.clone()
      .select('record_type')
      .count('* as count')
      .groupBy('record_type');

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
}
