import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface Disposition {
  id: string;
  title: string;
  description: string;
  agency_id: string;
  disposition_action: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';
  initiated_by: string;
  initiated_at: Date;
  first_approver_id?: string;
  first_approved_at?: Date;
  second_approver_id?: string;
  second_approved_at?: Date;
  rejection_reason?: string;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DispositionItem {
  id: string;
  disposition_id: string;
  record_id: string;
  has_legal_hold: boolean;
}

export interface LegalHold {
  id: string;
  record_id: string;
  reason: string;
  placed_by: string;
  placed_at: Date;
  released_by?: string;
  released_at?: Date;
  is_active: boolean;
}

export class DispositionsRepository extends BaseRepository<Disposition> {
  constructor(db: Knex) {
    super(db, 'dispositions');
  }

  async findByAgency(agencyId: string): Promise<Disposition[]> {
    return this.db(this.tableName).where({ agency_id: agencyId }).orderBy('created_at', 'desc');
  }

  async getItems(dispositionId: string): Promise<DispositionItem[]> {
    return this.db('disposition_items').where({ disposition_id: dispositionId });
  }

  async addItems(dispositionId: string, items: Omit<DispositionItem, 'id'>[]): Promise<DispositionItem[]> {
    const data = items.map((item) => ({ ...item, disposition_id: dispositionId }));
    return this.db('disposition_items').insert(data).returning('*');
  }

  async findLegalHolds(recordId: string): Promise<LegalHold[]> {
    return this.db('legal_holds').where({ record_id: recordId, is_active: true });
  }

  async createLegalHold(hold: Omit<LegalHold, 'id' | 'released_by' | 'released_at'>): Promise<LegalHold> {
    const [record] = await this.db('legal_holds').insert(hold).returning('*');
    return record;
  }

  async releaseLegalHold(holdId: string, releasedBy: string): Promise<LegalHold> {
    const [record] = await this.db('legal_holds')
      .where({ id: holdId })
      .update({ is_active: false, released_by: releasedBy, released_at: new Date() })
      .returning('*');
    return record;
  }

  async hasActiveLegalHold(recordId: string): Promise<boolean> {
    const hold = await this.db('legal_holds')
      .where({ record_id: recordId, is_active: true })
      .first();
    return !!hold;
  }
}
