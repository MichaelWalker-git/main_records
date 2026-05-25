import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface ReferenceRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  agency_id?: string;
  description: string;
  record_types: string[];
  date_range_start?: Date;
  date_range_end?: Date;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  response_notes?: string;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class ReferenceRequestsRepository extends BaseRepository<ReferenceRequest> {
  constructor(db: Knex) {
    super(db, 'reference_requests');
  }

  async findByStatus(status: string): Promise<ReferenceRequest[]> {
    return this.db(this.tableName).where({ status }).orderBy('created_at');
  }

  async findByAssignee(userId: string): Promise<ReferenceRequest[]> {
    return this.db(this.tableName).where({ assigned_to: userId }).orderBy('created_at', 'desc');
  }

  async assign(id: string, userId: string): Promise<ReferenceRequest | undefined> {
    const [record] = await this.db(this.tableName)
      .where({ id })
      .update({ assigned_to: userId, status: 'in_progress', updated_at: new Date() })
      .returning('*');
    return record;
  }

  async complete(id: string, responseNotes: string): Promise<ReferenceRequest | undefined> {
    const [record] = await this.db(this.tableName)
      .where({ id })
      .update({ status: 'completed', response_notes: responseNotes, completed_at: new Date(), updated_at: new Date() })
      .returning('*');
    return record;
  }
}
