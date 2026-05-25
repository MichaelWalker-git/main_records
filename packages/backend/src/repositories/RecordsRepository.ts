import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface Record {
  id: string;
  title: string;
  description: string;
  record_type: string;
  agency_id: string;
  template_id?: string;
  retention_schedule_id?: string;
  barcode: string;
  status: string;
  metadata: any;
  tags: string[];
  location_id?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export class RecordsRepository extends BaseRepository<Record> {
  constructor(db: Knex) {
    super(db, 'records');
  }

  async findByAgency(agencyId: string, limit = 50, offset = 0): Promise<Record[]> {
    return this.db(this.tableName)
      .where({ agency_id: agencyId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findByBarcode(barcode: string): Promise<Record | undefined> {
    return this.db(this.tableName).where({ barcode }).first();
  }

  async findByTags(tags: string[], agencyId?: string): Promise<Record[]> {
    let query = this.db(this.tableName).whereRaw('tags && ?', [tags]);
    if (agencyId) query = query.where({ agency_id: agencyId });
    return query;
  }

  async updateTags(id: string, tags: string[]): Promise<Record | undefined> {
    const [record] = await this.db(this.tableName)
      .where({ id })
      .update({ tags, updated_at: new Date() })
      .returning('*');
    return record;
  }

  async findByRetentionSchedule(scheduleId: string): Promise<Record[]> {
    return this.db(this.tableName).where({ retention_schedule_id: scheduleId });
  }

  async batchCreate(records: Partial<Record>[]): Promise<Record[]> {
    return this.db(this.tableName).insert(records).returning('*');
  }
}
