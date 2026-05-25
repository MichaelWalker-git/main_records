import { AuditRepository, AuditEvent, AuditFilters } from '../repositories/AuditRepository';

export class AuditService {
  constructor(private auditRepo: AuditRepository) {}

  async log(event: Omit<AuditEvent, 'id' | 'created_at'>): Promise<AuditEvent> {
    return this.auditRepo.insert(event);
  }

  async query(filters: AuditFilters, limit = 50, offset = 0): Promise<AuditEvent[]> {
    return this.auditRepo.query(filters, limit, offset);
  }

  async getCount(filters: AuditFilters): Promise<number> {
    return this.auditRepo.countByFilters(filters);
  }
}
