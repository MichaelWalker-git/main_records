import { v4 as uuidv4 } from 'uuid';
import bwipjs from 'bwip-js';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { RecordsRepository } from '../repositories/RecordsRepository';
import { TemplatesRepository } from '../repositories/TemplatesRepository';
import { RetentionSchedulesRepository } from '../repositories/RetentionSchedulesRepository';
import { AIService } from './AIService';
import { EmbeddingService } from './EmbeddingService';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';

export class RecordsService {
  private embeddingService = new EmbeddingService();
  private s3Client = new S3Client({ region: config.bedrock.region });

  constructor(
    private recordsRepo: RecordsRepository,
    private templatesRepo: TemplatesRepository,
    private retentionRepo: RetentionSchedulesRepository,
    private aiService: AIService
  ) {}

  async create(data: any, userId: string, agencyId: string) {
    if (data.template_id) {
      const template = await this.templatesRepo.findById(data.template_id);
      if (!template) throw new AppError(404, 'Template not found');
      if (!template.is_active) throw new AppError(400, 'Template is inactive');
    }

    // Resolve agency: agencyId may be UUID (from Cognito) or empty (dev mode)
    const dbRef = this.recordsRepo['db'];
    let agency = agencyId ? await dbRef('agencies').where({ id: agencyId }).first() : null;
    // Fallback: frontend may send agency code (e.g. "SOS")
    if (!agency && data.agency_id) {
      agency = await dbRef('agencies').where({ code: data.agency_id }).first();
    }
    // Fallback: use first agency in DB (for upload mode where no agency is specified)
    if (!agency) {
      agency = await dbRef('agencies').first();
    }
    const resolvedAgencyId = agency?.id || agencyId || data.agency_id;
    const agencyCode = agency?.code || data.agency_id || 'UNK';

    // Map series_id (e.g. "GRS-1") to series_title
    const seriesTitle = data.series_id || data.series_title || null;

    const { series_id: _si, agency_id: _ai, ...rest } = data;

    const trackingNumber = this.generateTrackingNumber();
    const record = await this.recordsRepo.create({
      ...rest,
      id: uuidv4(),
      tracking_number: trackingNumber,
      barcode: trackingNumber,
      agency_id: resolvedAgencyId,
      agency_code: agencyCode,
      series_title: seriesTitle,
      created_by: userId,
      status: 'active',
      tags: data.tags || [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Generate embedding async (non-blocking)
    this.embeddingService.embedRecord(record.id).catch(() => {});

    return record;
  }

  async batchImport(records: any[], userId: string, agencyId: string) {
    const prepared = records.map((r) => {
      const trackingNumber = this.generateTrackingNumber();
      return {
        ...r,
        id: uuidv4(),
        tracking_number: trackingNumber,
        barcode: trackingNumber,
        agency_id: agencyId,
        created_by: userId,
        status: 'active',
        tags: r.tags || [],
        created_at: new Date(),
        updated_at: new Date(),
      };
    });
    return this.recordsRepo.batchCreate(prepared);
  }

  async triggerClassification(recordId: string) {
    const record = await this.recordsRepo.findById(recordId);
    if (!record) throw new AppError(404, 'Record not found');
    await this.aiService.publishClassification(recordId, record);
    return { status: 'classification_initiated', recordId };
  }

  async generateBarcodeSvg(recordId: string, format: 'code128' | 'qrcode' = 'code128'): Promise<string> {
    const record = await this.recordsRepo.findById(recordId);
    if (!record) throw new AppError(404, 'Record not found');

    const svg = bwipjs.toSVG({
      bcid: format === 'qrcode' ? 'qrcode' : 'code128',
      text: record.barcode,
      scale: 3,
      height: format === 'qrcode' ? 30 : 10,
      includetext: true,
      textxalign: 'center',
    });

    return svg;
  }

  async lookupByBarcode(barcode: string) {
    const record = await this.recordsRepo.findByBarcode(barcode);
    if (!record) throw new AppError(404, 'Record not found for barcode');
    return record;
  }

  async assignRetention(recordId: string, scheduleId: string) {
    const schedule = await this.retentionRepo.findById(scheduleId);
    if (!schedule) throw new AppError(404, 'Retention schedule not found');

    const record = await this.recordsRepo.findById(recordId);
    if (!record) throw new AppError(404, 'Record not found');

    // RET-01: Calculate disposition date from record creation + retention years
    const dispositionDate = new Date(record.created_at);
    dispositionDate.setFullYear(dispositionDate.getFullYear() + schedule.retention_years);

    return this.recordsRepo.update(recordId, {
      retention_schedule_id: scheduleId,
      disposition_date: dispositionDate,
    } as any);
  }

  async getUploadUrl(recordId: string, filename: string, contentType: string) {
    const record = await this.recordsRepo.findById(recordId);
    if (!record) throw new AppError(404, 'Record not found');

    // Sanitize filename: keep original name but make it safe for S3
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const agencyCode = record.agency_code || 'UNK';
    const trackingNumber = record.tracking_number || recordId;
    const s3Key = `documents/${agencyCode}/${trackingNumber}/${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: config.s3.documentsBucket,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 600 });

    return { uploadUrl, s3Key, expiresIn: 600 };
  }

  async getDownloadUrl(recordId: string) {
    const record = await this.recordsRepo.findById(recordId);
    if (!record) throw new AppError(404, 'Record not found');
    if (!record.document_key) throw new AppError(404, 'No document attached to this record');

    const command = new GetObjectCommand({
      Bucket: config.s3.documentsBucket,
      Key: record.document_key,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 600 });
    const filename = record.document_key.split('/').pop() || 'document';

    return { downloadUrl, filename, expiresIn: 600 };
  }

  async confirmUpload(recordId: string, s3Key: string) {
    const record = await this.recordsRepo.findById(recordId);
    if (!record) throw new AppError(404, 'Record not found');

    // Store the document reference and mark as digital
    await this.recordsRepo.update(recordId, {
      document_key: s3Key,
      has_document: true,
      media_type: 'DIGITAL',
    } as any);

    // Trigger OCR + classification pipeline in background (non-blocking)
    this.aiService.publishOcr(recordId, s3Key).catch((err) => {
      console.error(`[RecordsService] Background OCR failed for ${recordId}:`, err);
    });

    return { status: 'ocr_initiated', recordId, s3Key };
  }

  private generateTrackingNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    return `RMS-${dateStr}-${seq}`;
  }
}
