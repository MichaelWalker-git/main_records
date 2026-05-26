import { v4 as uuidv4 } from 'uuid';
import bwipjs from 'bwip-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

    const barcode = this.generateBarcodeValue();
    const record = await this.recordsRepo.create({
      ...data,
      id: uuidv4(),
      barcode,
      agency_id: agencyId,
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
    const prepared = records.map((r) => ({
      ...r,
      id: uuidv4(),
      barcode: this.generateBarcodeValue(),
      agency_id: agencyId,
      created_by: userId,
      status: 'active',
      tags: r.tags || [],
      created_at: new Date(),
      updated_at: new Date(),
    }));
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
    return this.recordsRepo.update(recordId, { retention_schedule_id: scheduleId } as any);
  }

  async getUploadUrl(recordId: string, filename: string, contentType: string) {
    const record = await this.recordsRepo.findById(recordId);
    if (!record) throw new AppError(404, 'Record not found');

    const ext = filename.split('.').pop() || 'bin';
    const s3Key = `documents/${record.agency_id}/${recordId}/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: config.s3.documentsBucket,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 600 });

    return { uploadUrl, s3Key, expiresIn: 600 };
  }

  async confirmUpload(recordId: string, s3Key: string) {
    const record = await this.recordsRepo.findById(recordId);
    if (!record) throw new AppError(404, 'Record not found');

    // Store the document reference
    await this.recordsRepo.update(recordId, {
      document_key: s3Key,
      has_document: true,
    } as any);

    // Trigger OCR pipeline (async)
    await this.aiService.publishOcr(recordId, s3Key);

    // Generate embedding after OCR completes (handled by Lambda)
    return { status: 'ocr_initiated', recordId, s3Key };
  }

  private generateBarcodeValue(): string {
    const prefix = 'MRS';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
