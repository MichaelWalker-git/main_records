import { Knex } from 'knex';

export interface CirculationEvent {
  id: string;
  record_id: string;
  user_id: string;
  event_type: 'checkout' | 'checkin';
  checked_out_at: Date;
  due_date: Date;
  checked_in_at?: Date;
  notes?: string;
  agency_id: string;
  created_at: Date;
}

export class CirculationRepository {
  constructor(private db: Knex) {}

  async checkout(data: Omit<CirculationEvent, 'id' | 'event_type' | 'checked_in_at' | 'created_at'>): Promise<CirculationEvent> {
    const [record] = await this.db('circulation_events')
      .insert({ ...data, event_type: 'checkout', created_at: new Date() })
      .returning('*');
    return record;
  }

  async checkin(eventId: string, notes?: string): Promise<CirculationEvent> {
    const [record] = await this.db('circulation_events')
      .where({ id: eventId })
      .update({ checked_in_at: new Date(), notes, event_type: 'checkin' })
      .returning('*');
    return record;
  }

  async findActiveCheckout(recordId: string): Promise<CirculationEvent | undefined> {
    return this.db('circulation_events')
      .where({ record_id: recordId, event_type: 'checkout' })
      .whereNull('checked_in_at')
      .first();
  }

  async findOverdue(agencyId?: string): Promise<CirculationEvent[]> {
    let query = this.db('circulation_events')
      .where({ event_type: 'checkout' })
      .whereNull('checked_in_at')
      .where('due_date', '<', new Date());
    if (agencyId) query = query.where({ agency_id: agencyId });
    return query.orderBy('due_date');
  }

  async findByUser(userId: string): Promise<CirculationEvent[]> {
    return this.db('circulation_events')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  async findByRecord(recordId: string): Promise<CirculationEvent[]> {
    return this.db('circulation_events')
      .where({ record_id: recordId })
      .orderBy('created_at', 'desc');
  }
}
