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
  record_id: string;
  notes?: string;
}

export class TransmittalsRepository extends BaseRepository<Transmittal> {
  constructor(db: Knex) {
    super(db, 'transmittals');
  }

  async findByAgency(agencyId: string, status?: string): Promise<Transmittal[]> {
    let query = this.db(this.tableName).where({ agency_id: agencyId });
    if (status) query = query.where({ status });
    return query.orderBy('created_at', 'desc');
  }

  async findPendingApproval(): Promise<Transmittal[]> {
    return this.db(this.tableName).where({ status: 'submitted' }).orderBy('submitted_at');
  }

  async getItems(transmittalId: string): Promise<TransmittalItem[]> {
    return this.db('transmittal_items').where({ transmittal_id: transmittalId });
  }

  async addItems(transmittalId: string, items: Omit<TransmittalItem, 'id'>[]): Promise<TransmittalItem[]> {
    const data = items.map((item) => ({ ...item, transmittal_id: transmittalId }));
    return this.db('transmittal_items').insert(data).returning('*');
  }

  async removeItem(transmittalId: string, itemId: string): Promise<boolean> {
    const count = await this.db('transmittal_items')
      .where({ id: itemId, transmittal_id: transmittalId })
      .delete();
    return count > 0;
  }
}
