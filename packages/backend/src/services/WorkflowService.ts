import { TransmittalsRepository } from '../repositories/TransmittalsRepository';
import { DispositionsRepository } from '../repositories/DispositionsRepository';
import { ReferenceRequestsRepository } from '../repositories/ReferenceRequestsRepository';
import { NotificationService } from './NotificationService';
import { AppError } from '../middleware/errorHandler';

export class WorkflowService {
  constructor(
    private transmittalsRepo: TransmittalsRepository,
    private dispositionsRepo: DispositionsRepository,
    private referenceRepo: ReferenceRequestsRepository,
    private notificationService: NotificationService
  ) {}

  async submitTransmittal(transmittalId: string, userId: string) {
    const transmittal = await this.transmittalsRepo.findById(transmittalId);
    if (!transmittal) throw new AppError(404, 'Transmittal not found');
    if (transmittal.status !== 'draft') throw new AppError(400, 'Transmittal must be in draft status');

    const updated = await this.transmittalsRepo.update(transmittalId, {
      status: 'submitted',
      submitted_by: userId,
      submitted_at: new Date(),
    } as any);

    await this.notificationService.send('transmittal_submitted', { transmittalId, title: transmittal.title });
    return updated;
  }

  async approveTransmittal(transmittalId: string, userId: string) {
    const transmittal = await this.transmittalsRepo.findById(transmittalId);
    if (!transmittal) throw new AppError(404, 'Transmittal not found');
    if (transmittal.status !== 'submitted') throw new AppError(400, 'Transmittal must be in submitted status');

    const updated = await this.transmittalsRepo.update(transmittalId, {
      status: 'approved',
      approved_by: userId,
      approved_at: new Date(),
    } as any);

    await this.notificationService.send('transmittal_approved', { transmittalId });
    return updated;
  }

  async rejectTransmittal(transmittalId: string, userId: string, reason: string) {
    const transmittal = await this.transmittalsRepo.findById(transmittalId);
    if (!transmittal) throw new AppError(404, 'Transmittal not found');
    if (transmittal.status !== 'submitted') throw new AppError(400, 'Transmittal must be in submitted status');

    const updated = await this.transmittalsRepo.update(transmittalId, {
      status: 'rejected',
      rejection_reason: reason,
    } as any);

    await this.notificationService.send('transmittal_rejected', { transmittalId, reason });
    return updated;
  }

  async receiveTransmittal(transmittalId: string, userId: string) {
    const transmittal = await this.transmittalsRepo.findById(transmittalId);
    if (!transmittal) throw new AppError(404, 'Transmittal not found');
    if (transmittal.status !== 'approved') throw new AppError(400, 'Transmittal must be approved before receiving');

    const updated = await this.transmittalsRepo.update(transmittalId, {
      status: 'received',
      received_by: userId,
      received_at: new Date(),
    } as any);

    await this.notificationService.send('transmittal_received', { transmittalId });
    return updated;
  }

  async initiateDisposition(data: any, userId: string, agencyId: string) {
    const items = data.record_ids || [];
    for (const recordId of items) {
      const hasHold = await this.dispositionsRepo.hasActiveLegalHold(recordId);
      if (hasHold) {
        throw new AppError(409, `Record ${recordId} has an active legal hold`);
      }
    }

    const disposition = await this.dispositionsRepo.create({
      ...data,
      agency_id: agencyId,
      status: 'pending_approval',
      initiated_by: userId,
      initiated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (items.length > 0) {
      await this.dispositionsRepo.addItems(
        disposition.id,
        items.map((record_id: string) => ({ record_id, disposition_id: disposition.id, has_legal_hold: false }))
      );
    }

    await this.notificationService.send('disposition_initiated', { dispositionId: disposition.id });
    return disposition;
  }

  async approveDisposition(dispositionId: string, userId: string, level: 'first' | 'second') {
    const disposition = await this.dispositionsRepo.findById(dispositionId);
    if (!disposition) throw new AppError(404, 'Disposition not found');
    if (disposition.status !== 'pending_approval') throw new AppError(400, 'Disposition is not pending approval');

    const updateData: any = { updated_at: new Date() };
    if (level === 'first') {
      updateData.first_approver_id = userId;
      updateData.first_approved_at = new Date();
    } else {
      if (!disposition.first_approver_id) throw new AppError(400, 'First approval required before second');
      updateData.second_approver_id = userId;
      updateData.second_approved_at = new Date();
      updateData.status = 'approved';
    }

    const updated = await this.dispositionsRepo.update(dispositionId, updateData);
    await this.notificationService.send('disposition_approved', { dispositionId, level });
    return updated;
  }

  async rejectDisposition(dispositionId: string, userId: string, reason: string) {
    const disposition = await this.dispositionsRepo.findById(dispositionId);
    if (!disposition) throw new AppError(404, 'Disposition not found');

    const updated = await this.dispositionsRepo.update(dispositionId, {
      status: 'rejected',
      rejection_reason: reason,
      updated_at: new Date(),
    } as any);

    await this.notificationService.send('disposition_rejected', { dispositionId, reason });
    return updated;
  }

  async createReferenceRequest(data: any) {
    return this.referenceRepo.create({
      ...data,
      status: 'new',
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async assignReferenceRequest(requestId: string, userId: string) {
    return this.referenceRepo.assign(requestId, userId);
  }

  async completeReferenceRequest(requestId: string, responseNotes: string) {
    return this.referenceRepo.complete(requestId, responseNotes);
  }
}
