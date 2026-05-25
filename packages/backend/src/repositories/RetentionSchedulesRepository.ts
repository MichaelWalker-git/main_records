import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface RetentionSchedule {
  id: string;
  name: string;
  code: string;
  description: string;
  retention_years: number;
  disposition_action: string;
  agency_id?: string;
  is_active: boolean;
  alert_days_before: number;
  created_at: Date;
  updated_at: Date;
}

export class RetentionSchedulesRepository extends BaseRepository<RetentionSchedule> {
  constructor(db: Knex) {
    super(db, 'retention_schedules');
  }

  async findActive(): Promise<RetentionSchedule[]> {
    return this.db(this.tableName).where({ is_active: true }).orderBy('code');
  }

  async findByCode(code: string): Promise<RetentionSchedule | undefined> {
    return this.db(this.tableName).where({ code }).first();
  }

  async findUpcomingAlerts(): Promise<any[]> {
    return this.db('records')
      .join('retention_schedules', 'records.retention_schedule_id', 'retention_schedules.id')
      .whereRaw(
        "records.created_at + (retention_schedules.retention_years || ' years')::interval - (retention_schedules.alert_days_before || ' days')::interval <= NOW()"
      )
      .whereRaw(
        "records.created_at + (retention_schedules.retention_years || ' years')::interval > NOW()"
      )
      .where('records.status', '!=', 'disposed')
      .select('records.*', 'retention_schedules.name as schedule_name');
  }
}
