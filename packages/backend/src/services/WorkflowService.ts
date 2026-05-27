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

    this.notificationService.send('transmittal_submitted', { transmittalId, title: transmittal.title }).catch((err) => {
      console.warn(`[WorkflowService] Notification failed (non-blocking):`, err.message);
    });
    return updated;
  }

  async approveTransmittal(transmittalId: string, userId: string) {
    const transmittal = await this.transmittalsRepo.findById(transmittalId);
    if (!transmittal) throw new AppError(404, 'Transmittal not found');
    if (transmittal.status !== 'submitted' && transmittal.status !== 'received') {
      throw new AppError(400, 'Transmittal must be in submitted or received status');
    }

    const updated = await this.transmittalsRepo.update(transmittalId, {
      status: 'approved',
      approved_by: userId,
      approved_at: new Date(),
    } as any);

    this.notificationService.send('transmittal_approved', { transmittalId }).catch((err) => {
      console.warn(`[WorkflowService] Notification failed (non-blocking):`, err.message);
    });
    return updated;
  }

  async rejectTransmittal(transmittalId: string, userId: string, reason: string) {
    const transmittal = await this.transmittalsRepo.findById(transmittalId);
    if (!transmittal) throw new AppError(404, 'Transmittal not found');
    if (transmittal.status !== 'submitted' && transmittal.status !== 'received') {
      throw new AppError(400, 'Transmittal must be in submitted or received status');
    }

    const updated = await this.transmittalsRepo.update(transmittalId, {
      status: 'rejected',
      rejection_reason: reason,
    } as any);

    this.notificationService.send('transmittal_rejected', { transmittalId, reason }).catch((err) => {
      console.warn(`[WorkflowService] Notification failed (non-blocking):`, err.message);
    });
    return updated;
  }

  async receiveTransmittal(transmittalId: string, userId: string) {
    const transmittal = await this.transmittalsRepo.findById(transmittalId);
    if (!transmittal) throw new AppError(404, 'Transmittal not found');
    if (transmittal.status !== 'submitted' && transmittal.status !== 'approved') {
      throw new AppError(400, 'Transmittal must be submitted or approved before receiving');
    }

    const updated = await this.transmittalsRepo.update(transmittalId, {
      status: 'received',
      received_by: userId,
      received_at: new Date(),
    } as any);

    // Activate records linked to this transmittal
    const items = await this.transmittalsRepo.getItems(transmittalId);
    const recordIds = items.filter((i: any) => i.record_id).map((i: any) => i.record_id);
    if (recordIds.length > 0) {
      const dbRef = (this.transmittalsRepo as any).db;
      await dbRef('records')
        .whereIn('id', recordIds)
        .whereIn('status', ['draft', 'in_transit'])
        .update({ status: 'active', updated_at: new Date() });
    }

    this.notificationService.send('transmittal_received', { transmittalId }).catch((err) => {
      console.warn(`[WorkflowService] Notification failed (non-blocking):`, err.message);
    });
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

    const { record_ids, ...rest } = data;
    const disposition = await this.dispositionsRepo.create({
      title: rest.title || 'Disposition Request',
      description: rest.description || '',
      disposition_action: rest.disposition_action || 'destroy',
      agency_id: agencyId || 'a1b2c3d4-1111-4000-8000-000000000001',
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

    this.notificationService.send('disposition_initiated', { dispositionId: disposition.id }).catch((err) => {
      console.warn(`[WorkflowService] Notification failed (non-blocking):`, err.message);
    });
    return disposition;
  }

  async approveDisposition(dispositionId: string, userId: string, level: 'first' | 'second' | 'third') {
    const disposition = await this.dispositionsRepo.findById(dispositionId);
    if (!disposition) throw new AppError(404, 'Disposition not found');
    if (disposition.status !== 'pending_approval') throw new AppError(400, 'Disposition is not pending approval');

    if (process.env.ENFORCE_SEPARATION_OF_DUTIES === 'true' && userId === disposition.initiated_by) {
      throw new AppError(403, 'Approver cannot be the same person who initiated the disposition');
    }

    const updateData: any = { updated_at: new Date() };
    if (level === 'first') {
      updateData.first_approver_id = userId;
      updateData.first_approved_at = new Date();
    } else if (level === 'second') {
      if (!disposition.first_approver_id) throw new AppError(400, 'First approval required before second');
      updateData.second_approver_id = userId;
      updateData.second_approved_at = new Date();
    } else {
      // DSP-03: Third level (final) approval
      if (!disposition.second_approver_id) throw new AppError(400, 'Second approval required before third');
      updateData.third_approver_id = userId;
      updateData.third_approved_at = new Date();
      updateData.status = 'approved';
      updateData.completed_at = new Date();

      // DSP-07: Generate disposition certificate on final approval
      updateData.certificate_number = `CERT-${dispositionId.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    }

    const updated = await this.dispositionsRepo.update(dispositionId, updateData);

    // On final approval, update record statuses based on disposition action
    if (level === 'third') {
      const items = await this.dispositionsRepo.getItems(dispositionId);
      const recordIds = items.filter((i: any) => i.record_id).map((i: any) => i.record_id);
      if (recordIds.length > 0) {
        const statusMap: Record<string, string> = {
          destroy: 'destroyed',
          transfer: 'transferred',
          archive: 'archived',
        };
        const newStatus = statusMap[disposition.disposition_action] || 'archived';
        const dbRef = (this.dispositionsRepo as any).db;
        await dbRef('records')
          .whereIn('id', recordIds)
          .update({ status: newStatus, updated_at: new Date() });
      }
    }

    this.notificationService.send('disposition_approved', { dispositionId, level }).catch((err) => {
      console.warn(`[WorkflowService] Notification failed (non-blocking):`, err.message);
    });
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

    this.notificationService.send('disposition_rejected', { dispositionId, reason }).catch((err) => {
      console.warn(`[WorkflowService] Notification failed (non-blocking):`, err.message);
    });
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
