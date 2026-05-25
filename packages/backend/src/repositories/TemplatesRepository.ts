import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface Template {
  id: string;
  name: string;
  description: string;
  record_type: string;
  agency_id?: string;
  fields: any;
  retention_schedule_id?: string;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export class TemplatesRepository extends BaseRepository<Template> {
  constructor(db: Knex) {
    super(db, 'templates');
  }

  async findActive(agencyId?: string): Promise<Template[]> {
    let query = this.db(this.tableName).where({ is_active: true });
    if (agencyId) {
      query = query.where(function () {
        this.where({ agency_id: agencyId }).orWhereNull('agency_id');
      });
    }
    return query.orderBy('name');
  }

  async findByRecordType(recordType: string): Promise<Template[]> {
    return this.db(this.tableName).where({ record_type: recordType, is_active: true });
  }
}
