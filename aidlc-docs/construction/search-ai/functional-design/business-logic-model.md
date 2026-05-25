# Business Logic Model - Unit 4: Search & AI

## Search Orchestration

### Metadata Search
```
POST /api/search
Body: { filters: { agency, type, status, dateRange, tags[], location }, facets: ["agency","type","status"], page, size, sort }
  │
  ├─ 1. Build OpenSearch query:
  │     ├─ Apply filters as term/range queries
  │     ├─ Apply agency scoping (non-admin users)
  │     ├─ Add aggregations for requested facets
  │     └─ Apply pagination (from/size) and sort
  ├─ 2. Execute OpenSearch query
  ├─ 3. Extract hits + aggregation results
  ├─ 4. Enrich results with DB data if needed (e.g., location name)
  └─ 5. Return { results[], total, facets: { field: [{ value, count }] }, page }
```

### Full-Text Search
```
POST /api/search/fulltext
Body: { query: "free text string", filters?, page, size }
  │
  ├─ 1. Build OpenSearch multi_match query:
  │     ├─ Fields: seriesTitle^3, fileName^2, ocrText, tags^2, agencyName
  │     ├─ Type: best_fields with cross_fields fallback
  │     └─ Apply filters + agency scoping
  ├─ 2. Execute query
  ├─ 3. Return results with relevance scores + highlights
  └─ 4. Include matched field name in each result for UI indication
```

### AI Semantic Search
```
POST /api/search/semantic
Body: { query: "natural language question", filters?, page, size }
  │
  ├─ 1. Generate embedding for query text:
  │     └─ Invoke Bedrock (Titan Embeddings V2): input=query → output=vector[1024]
  ├─ 2. Execute OpenSearch KNN query:
  │     ├─ Field: embedding (knn_vector)
  │     ├─ k: size (default 20)
  │     └─ Apply pre-filter for agency scoping + any filters
  ├─ 3. For top results, generate relevance explanation:
  │     └─ Invoke Bedrock (Claude): "Explain why this record matches: {query}"
  │        Input: query + record metadata
  │        Output: 1-sentence explanation per result
  ├─ 4. Return results with:
  │     ├─ Relevance score (cosine similarity)
  │     ├─ Explanation text
  │     └─ Indication: "AI-powered result"
  └─ 5. Fallback: if KNN returns <3 results, also run full-text search and merge
```

### OCR Search
```
POST /api/search/ocr
Body: { query: "text to find in scanned docs", documentTypes?, page, size }
  │
  ├─ 1. Build OpenSearch query targeting ocrText field:
  │     ├─ Match phrase with slop=2 for flexibility
  │     └─ Filter to records where ocrText IS NOT NULL
  ├─ 2. Execute query
  ├─ 3. For each result, extract text snippet around match (highlight)
  └─ 4. Return results with: snippet, page number (if available), confidence
```

## AI Classification Pipeline

```
Lambda: ai-classify
Trigger: SQS message { recordId, documentUrl }
  │
  ├─ 1. Fetch record from DB (metadata context)
  ├─ 2. Fetch classification prompt from S3:
  │     s3://{prompts-bucket}/prompts/classify-v1.txt
  │     Prompt includes: categories list, tag taxonomy, output schema
  ├─ 3. If documentUrl (digital record):
  │     ├─ Download first 5 pages from S3
  │     └─ Convert to base64 for Bedrock vision input
  ├─ 4. Invoke Bedrock (Claude Sonnet):
  │     System: classification prompt
  │     User: { metadata: {...}, document_content: base64 OR null }
  │     Tool: classify_record { category, tags[], confidence, reasoning }
  ├─ 5. Parse tool use response
  ├─ 6. Update record in DB:
  │     ├─ classificationConfidence = result.confidence
  │     ├─ classificationStatus = confidence >= 0.85 ? 'CLASSIFIED' : 'PENDING'
  │     └─ Insert record_tags: result.tags.map(t => { name: t, source: 'AI', confidence })
  ├─ 7. Generate embedding for record (for semantic search):
  │     ├─ Input: seriesTitle + tags + fileName + ocrText(first 2000 chars)
  │     └─ Store in OpenSearch: record.embedding = vector
  ├─ 8. Re-index record in OpenSearch
  └─ 9. If confidence < 0.85: enqueue notification to Archives Staff
```

## OCR Pipeline

```
Lambda: ai-ocr
Trigger: SQS message { recordId, documentUrl }
  │
  ├─ 1. Invoke Textract StartDocumentTextDetection:
  │     Input: S3 object (documentUrl)
  │     Output: JobId
  ├─ 2. Poll GetDocumentTextDetection until complete (max 5 min)
  ├─ 3. Collect all text blocks, ordered by page/position
  ├─ 4. Concatenate into full text string
  ├─ 5. Update record in DB: ocrText = extractedText
  ├─ 6. Re-index record in OpenSearch (ocrText field)
  ├─ 7. Trigger classification (enqueue to classify-queue) if not already classified
  └─ 8. Log: "OCR complete for record {id}: {pageCount} pages, {wordCount} words"
```

## Notification Pipeline

```
Lambda: notification-send
Trigger: SQS message { type, recipientId, templateId, data }
  │
  ├─ 1. Load recipient from DB (email, preferences)
  ├─ 2. Load email template (hardcoded templates for demo):
  │     ├─ retention-alert: "Records approaching disposition"
  │     ├─ overdue-notice: "Overdue record return"
  │     ├─ workflow-update: "Transmittal/Disposition status change"
  │     └─ reference-ready: "Your reference request is ready"
  ├─ 3. Render template with data (Handlebars-style)
  ├─ 4. Send via SES:
  │     From: noreply@maine-rms.example.com
  │     To: recipient.email
  │     Subject: template.subject
  │     Body: rendered HTML
  ├─ 5. Store in-app notification:
  │     INSERT INTO notifications (userId, type, title, message, read, createdAt)
  └─ 6. Log: "Notification sent: {type} to {email}"
```

## Retention Alert Scheduler

```
Lambda: retention-alerts
Trigger: EventBridge (daily at 6:00 AM ET)
  │
  ├─ 1. Query records with upcoming dispositions:
  │     WHERE disposition_date IS NOT NULL
  │     AND status = 'ACTIVE'
  │     AND disposition_date BETWEEN today AND today + 90 days
  ├─ 2. For each record, check alert thresholds:
  │     ├─ 90-day: if disposition_date - today <= 90 AND no alert sent
  │     ├─ 30-day: if disposition_date - today <= 30 AND no alert sent
  │     └─ 7-day: if disposition_date - today <= 7 AND no alert sent
  ├─ 3. For qualifying records:
  │     ├─ Insert schedule_alert (sentAt = now)
  │     ├─ Find Records Officer for record's agency
  │     └─ Enqueue notification: retention-alert
  ├─ 4. Also check overdue (disposition_date < today):
  │     └─ Insert alert type=OVERDUE if not already sent
  └─ 5. Log: "Processed {n} retention alerts"
```

## Analytics Dashboard Metrics

```
GET /api/analytics/dashboard
Query: { dateRange, agencyId?, warehouseId? }
  │
  Returns:
  {
    activeRecords: count,
    pendingDispositions: count,
    openTransmittals: count,
    openReferenceRequests: count,
    recordsByAgency: [{ agency, count }],
    recordsByType: [{ type, count }],
    upcomingDispositions: [{ month, count }],
    recentActivity: [{ date, created, disposed, transferred }],
    warehouseUtilization: [{ warehouse, utilized%, total, occupied }],
    overdueItems: count,
    legalHolds: count
  }
  
  Implementation:
  - Cache results with 5-minute TTL (node-cache)
  - Aggregate from PostgreSQL (COUNT/GROUP BY queries)
  - Warehouse utilization from locations table
```

## Report Export

```
Lambda: report-export
Trigger: API Gateway POST /api/analytics/reports/:id/export
Body: { format: "pdf" | "excel" | "csv", parameters }
  │
  ├─ 1. Load report template (type determines queries)
  ├─ 2. Execute queries with parameters
  ├─ 3. Generate output:
  │     ├─ PDF: pdfmake library → buffer
  │     ├─ Excel: exceljs library → buffer
  │     └─ CSV: papaparse → string
  ├─ 4. Upload to S3: exports/{userId}/{reportId}-{timestamp}.{format}
  ├─ 5. Generate presigned URL (expires in 1 hour)
  └─ 6. Return { downloadUrl, expiresAt }
```
