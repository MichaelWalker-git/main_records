import { v4 as uuidv4 } from 'uuid';
import { LocationsRepository } from '../repositories/LocationsRepository';
import { CirculationRepository } from '../repositories/CirculationRepository';
import { RecordsRepository } from '../repositories/RecordsRepository';
import { AppError } from '../middleware/errorHandler';

export class InventoryService {
  constructor(
    private locationsRepo: LocationsRepository,
    private circulationRepo: CirculationRepository,
    private recordsRepo: RecordsRepository
  ) {}

  async getLocationTree(parentId?: string) {
    return this.locationsRepo.findTree(parentId);
  }

  async createLocation(data: any) {
    return this.locationsRepo.create({
      ...data,
      id: uuidv4(),
      current_count: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getUtilization(locationId: string) {
    return this.locationsRepo.getUtilization(locationId);
  }

  async checkout(recordId: string, userId: string, agencyId: string, dueDate: Date, purpose: string, notes?: string) {
    const record = await this.recordsRepo.findById(recordId);
    if (!record) throw new AppError(404, 'Record not found');

    // CIR-01: Only ACTIVE records can be checked out
    if (record.status !== 'active') {
      throw new AppError(400, `Only active records can be checked out (current status: ${record.status})`);
    }

    const existing = await this.circulationRepo.findActiveCheckout(recordId);
    if (existing) throw new AppError(409, 'Record is already checked out');

    const event = await this.circulationRepo.checkout({
      record_id: recordId,
      user_id: userId,
      agency_id: agencyId,
      purpose,
      checked_out_at: new Date(),
      due_date: dueDate,
      notes,
    });

    if (record.location_id) {
      await this.locationsRepo.decrementCount(record.location_id);
    }

    return event;
  }

  async checkin(recordId: string, notes?: string) {
    const event = await this.circulationRepo.findActiveCheckout(recordId);
    if (!event) throw new AppError(404, 'No active checkout found for this record');

    const updated = await this.circulationRepo.checkin(event.id, notes);

    const record = await this.recordsRepo.findById(recordId);
    if (record?.location_id) {
      await this.locationsRepo.incrementCount(record.location_id);
    }

    return updated;
  }

  async getOverdue(agencyId?: string) {
    return this.circulationRepo.findOverdue(agencyId);
  }

  async getCirculationHistory(recordId: string) {
    return this.circulationRepo.findByRecord(recordId);
  }
}
