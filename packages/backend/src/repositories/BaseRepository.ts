import { Knex } from 'knex';

export class BaseRepository<T extends Record<string, any>> {
  constructor(
    protected db: Knex,
    protected tableName: string
  ) {}

  async findById(id: string): Promise<T | undefined> {
    return this.db(this.tableName).where({ id }).first();
  }

  async findAll(filters: Partial<T> = {}, limit = 50, offset = 0): Promise<T[]> {
    return this.db(this.tableName).where(filters).limit(limit).offset(offset);
  }

  async create(data: Partial<T>): Promise<T> {
    const [record] = await this.db(this.tableName).insert(data).returning('*');
    return record;
  }

  async update(id: string, data: Partial<T>): Promise<T | undefined> {
    const [record] = await this.db(this.tableName)
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return record;
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db(this.tableName).where({ id }).delete();
    return count > 0;
  }

  async count(filters: Partial<T> = {}): Promise<number> {
    const [{ count }] = await this.db(this.tableName).where(filters).count('* as count');
    return Number(count);
  }
}
