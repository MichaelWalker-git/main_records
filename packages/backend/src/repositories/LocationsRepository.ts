import { Knex } from 'knex';
import { BaseRepository } from './BaseRepository';

export interface Location {
  id: string;
  name: string;
  code: string;
  parent_id?: string;
  location_type: 'building' | 'floor' | 'room' | 'shelf' | 'box';
  capacity: number;
  current_count: number;
  agency_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class LocationsRepository extends BaseRepository<Location> {
  constructor(db: Knex) {
    super(db, 'locations');
  }

  async findTree(parentId?: string): Promise<Location[]> {
    if (parentId) {
      return this.db(this.tableName).where({ parent_id: parentId }).orderBy('name');
    }
    return this.db(this.tableName).whereNull('parent_id').orderBy('name');
  }

  async findChildren(parentId: string): Promise<Location[]> {
    return this.db(this.tableName).where({ parent_id: parentId }).orderBy('name');
  }

  async getUtilization(locationId: string): Promise<{ capacity: number; current_count: number; utilization: number }> {
    const location = await this.findById(locationId);
    if (!location) throw new Error('Location not found');
    return {
      capacity: location.capacity,
      current_count: location.current_count,
      utilization: location.capacity > 0 ? location.current_count / location.capacity : 0,
    };
  }

  async incrementCount(locationId: string): Promise<void> {
    await this.db(this.tableName).where({ id: locationId }).increment('current_count', 1);
  }

  async decrementCount(locationId: string): Promise<void> {
    await this.db(this.tableName).where({ id: locationId }).decrement('current_count', 1);
  }

  async findByCode(code: string): Promise<Location | undefined> {
    return this.db(this.tableName).where({ code }).first();
  }
}
