import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface Record {
  id: string;
  title: string;
  description: string;
  record_type: string;
  agency_id: string;
  agency_code: string;
  template_id?: string;
  retention_schedule_id?: string;
  series_title: string;
  media_type: string;
  tracking_number: string;
  barcode: string;
  status: string;
  disposition_date?: Date;
  container_number?: string;
  box_number?: string;
  location_code?: string;
  location_id?: string;
  transmittal_number?: string;
  date_from?: string;
  date_to?: string;
  metadata: any;
  custom_metadata?: any;
  tags: string[];
  document_key?: string;
  has_document?: boolean;
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
    // BAR-05: Query barcode, tracking_number, and container_number (legacy support)
    return this.db(this.tableName)
      .where({ barcode })
      .orWhere({ tracking_number: barcode })
      .orWhere({ container_number: barcode })
      .first();
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

  async count(): Promise<number> {
    const [{ count }] = await this.db(this.tableName).count('* as count');
    return Number(count);
  }

  async countByAgency(agencyId: string): Promise<number> {
    const [{ count }] = await this.db(this.tableName).where({ agency_id: agencyId }).count('* as count');
    return Number(count);
  }

  async batchCreate(records: Partial<Record>[]): Promise<Record[]> {
    return this.db(this.tableName).insert(records).returning('*');
  }
}
