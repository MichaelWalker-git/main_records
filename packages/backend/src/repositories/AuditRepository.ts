import { Knex } from 'knex';

export interface AuditEvent {
  id: string;
  user_id: string;
  user_email: string;
  agency_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata: any;
  created_at: Date;
}

export interface AuditFilters {
  user_id?: string;
  agency_id?: string;
  resource_type?: string;
  resource_id?: string;
  action?: string;
  from_date?: Date;
  to_date?: Date;
}

export class AuditRepository {
  constructor(private db: Knex) {}

  async insert(event: Omit<AuditEvent, 'id' | 'created_at'>): Promise<AuditEvent> {
    const [record] = await this.db('audit_events')
      .insert({ ...event, created_at: new Date() })
      .returning('*');
    return record;
  }

  async query(filters: AuditFilters, limit = 50, offset = 0): Promise<AuditEvent[]> {
    let query = this.db('audit_events');

    if (filters.user_id) query = query.where({ user_id: filters.user_id });
    if (filters.agency_id) query = query.where({ agency_id: filters.agency_id });
    if (filters.resource_type) query = query.where({ resource_type: filters.resource_type });
    if (filters.resource_id) query = query.where({ resource_id: filters.resource_id });
    if (filters.action) query = query.where('action', 'ilike', `%${filters.action}%`);
    if (filters.from_date) query = query.where('created_at', '>=', filters.from_date);
    if (filters.to_date) query = query.where('created_at', '<=', filters.to_date);

    return query.orderBy('created_at', 'desc').limit(limit).offset(offset);
  }

  async countByFilters(filters: AuditFilters): Promise<number> {
    let query = this.db('audit_events');
    if (filters.agency_id) query = query.where({ agency_id: filters.agency_id });
    if (filters.resource_type) query = query.where({ resource_type: filters.resource_type });
    const [{ count }] = await query.count('* as count');
    return Number(count);
  }
}
