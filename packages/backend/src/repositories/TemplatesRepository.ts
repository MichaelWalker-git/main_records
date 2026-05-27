import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface Template {
  id: string;
  name: string;
  description: string;
  agency_id?: string;
  field_definitions: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class TemplatesRepository extends BaseRepository<Template> {
  constructor(db: Knex) {
    super(db, 'record_templates');
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
}