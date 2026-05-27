import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface Transmittal {
  id: string;
  title: string;
  description: string;
  agency_id: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'received';
  submitted_by?: string;
  submitted_at?: Date;
  approved_by?: string;
  approved_at?: Date;
  received_by?: string;
  received_at?: Date;
  rejection_reason?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransmittalItem {
  id: string;
  transmittal_id: string;
  record_id?: string;
  box_number?: string;
  description?: string;
  series_title?: string;
  date_range?: string;
  notes?: string;
}

export class TransmittalsRepository extends BaseRepository<Transmittal> {
  constructor(db: Knex) {
    super(db, 'transmittals');
  }

  async findAllWithAgency(status?: string): Promise<any[]> {
    let query = this.db(this.tableName)
      .select(
        'transmittals.*',
        'agencies.name as agency_name',
        'agencies.code as agency_code',
        this.db.raw("COALESCE(submitter.first_name || ' ' || submitter.last_name, submitter.email) as submitted_by_name"),
      )
      .leftJoin('agencies', 'transmittals.agency_id', 'agencies.id')
      .leftJoin('users as submitter', 'transmittals.submitted_by', 'submitter.id');
    if (status) query = query.where({ 'transmittals.status': status });
    return query.orderBy('transmittals.created_at', 'desc');
  }

  async findByAgency(agencyId: string, status?: string): Promise<any[]> {
    let query = this.db(this.tableName)
      .select(
        'transmittals.*',
        'agencies.name as agency_name',
        'agencies.code as agency_code',
        this.db.raw("COALESCE(submitter.first_name || ' ' || submitter.last_name, submitter.email) as submitted_by_name"),
      )
      .leftJoin('agencies', 'transmittals.agency_id', 'agencies.id')
      .leftJoin('users as submitter', 'transmittals.submitted_by', 'submitter.id')
      .where({ 'transmittals.agency_id': agencyId });
    if (status) query = query.where({ 'transmittals.status': status });
    return query.orderBy('transmittals.created_at', 'desc');
  }

  async findPendingApproval(): Promise<Transmittal[]> {
    return this.db(this.tableName).where({ status: 'submitted' }).orderBy('submitted_at');
  }

  async getItems(transmittalId: string): Promise<any[]> {
    return this.db('transmittal_items')
      .leftJoin('records', 'transmittal_items.record_id', 'records.id')
      .where({ 'transmittal_items.transmittal_id': transmittalId })
      .select(
        'transmittal_items.*',
        this.db.raw("COALESCE(transmittal_items.description, records.title) as description"),
        this.db.raw("COALESCE(transmittal_items.box_number, records.box_number, records.container_number) as box_number"),
        this.db.raw("COALESCE(transmittal_items.series_title, records.series_title) as series_title"),
        this.db.raw("COALESCE(transmittal_items.date_range, CASE WHEN records.date_from IS NOT NULL THEN records.date_from::text || ' – ' || COALESCE(records.date_to::text, 'present') ELSE NULL END) as date_range"),
        'records.tracking_number as record_tracking_number'
      );
  }

  async addItems(transmittalId: string, items: Partial<TransmittalItem>[]): Promise<TransmittalItem[]> {
    const data = items.map((item) => ({
      transmittal_id: transmittalId,
      record_id: item.record_id || null,
      box_number: item.box_number || null,
      description: item.description || null,
      series_title: item.series_title || null,
      date_range: item.date_range || null,
      notes: item.notes || null,
    }));
    return this.db('transmittal_items').insert(data).returning('*');
  }

  async removeItem(transmittalId: string, itemId: string): Promise<boolean> {
    const count = await this.db('transmittal_items')
      .where({ id: itemId, transmittal_id: transmittalId })
      .delete();
    return count > 0;
  }
}
