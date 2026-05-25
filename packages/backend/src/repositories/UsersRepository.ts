import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface User {
  id: string;
  cognito_id: string;
  email: string;
  first_name: string;
  last_name: string;
  agency_id: string;
  roles: string[];
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class UsersRepository extends BaseRepository<User> {
  constructor(db: Knex) {
    super(db, 'users');
  }

  async findByCognitoId(cognitoId: string): Promise<User | undefined> {
    return this.db(this.tableName).where({ cognito_id: cognitoId }).first();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.db(this.tableName).where({ email }).first();
  }

  async findByAgency(agencyId: string): Promise<User[]> {
    return this.db(this.tableName).where({ agency_id: agencyId }).orderBy('last_name');
  }

  async updateRoles(id: string, roles: string[]): Promise<User | undefined> {
    const [record] = await this.db(this.tableName)
      .where({ id })
      .update({ roles, updated_at: new Date() })
      .returning('*');
    return record;
  }

  async deactivate(id: string): Promise<User | undefined> {
    const [record] = await this.db(this.tableName)
      .where({ id })
      .update({ is_active: false, updated_at: new Date() })
      .returning('*');
    return record;
  }
}
