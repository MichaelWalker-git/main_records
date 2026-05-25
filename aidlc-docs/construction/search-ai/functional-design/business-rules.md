# Business Rules - Unit 4: Search & AI

## Search Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| SRH-01 | All search results are agency-scoped for non-admin users | Mandatory filter on queries |
| SRH-02 | Maximum 100 results per page | Cap size parameter |
| SRH-03 | Semantic search requires minimum 3-word query | Validation |
| SRH-04 | Facets only returned for requested fields | Reduce payload |
| SRH-05 | OCR search only queries records with ocrText present | Filter: ocrText exists |
| SRH-06 | Search queries logged in audit trail | Log query text, user, result count |
| SRH-07 | Sensitive record content never returned in search snippets | Only return metadata + highlight |

## AI Classification Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| AI-01 | Classification is async and non-blocking | SQS queue, not synchronous |
| AI-02 | Confidence threshold for auto-accept: 0.85 | Configurable in environment |
| AI-03 | Below threshold requires staff review | Status = PENDING, notification sent |
| AI-04 | Classification prompt versioned in S3 | Fetch from s3://prompts/classify-v{n}.txt |
| AI-05 | Maximum 5 tags per classification | Truncate to top 5 by confidence |
| AI-06 | Re-classification replaces all AI tags | Delete source=AI before inserting new |
| AI-07 | Manual overrides never auto-replaced | source=MANUAL tags preserved |
| AI-08 | Bedrock invocations rate-limited | Concurrency = 5 per Lambda |
| AI-09 | Failed classification logged + retried (3x) | SQS retry with DLQ |
| AI-10 | State data not used for model training | Bedrock inference-only, no fine-tuning |

## OCR Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| OCR-01 | Only PDF and image files processed | Check MIME type before submitting |
| OCR-02 | Maximum file size: 50MB | Reject larger files |
| OCR-03 | Textract async API used (not sync) for >5 pages | StartDocumentTextDetection |
| OCR-04 | OCR text stored in DB and indexed in OpenSearch | Dual storage for query flexibility |
| OCR-05 | Failed OCR logged to DLQ, not retried infinitely | 3 retries max |
| OCR-06 | OCR completion triggers classification | Enqueue to classify-queue |

## Notification Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| NTF-01 | Emails sent from verified SES domain | noreply@maine-rms.example.com |
| NTF-02 | In-app notifications always created (even if email fails) | Insert regardless of SES result |
| NTF-03 | Retention alerts: 90, 30, 7 day thresholds | Configurable per schedule |
| NTF-04 | Each threshold fires only once per record | Check schedule_alerts.sentAt |
| NTF-05 | Overdue notices: day 1 (borrower) + day 7 (escalation) | Two-tier notification |
| NTF-06 | Failed notifications retried 3x then DLQ | SQS retry policy |

## Analytics Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| ANA-01 | Dashboard data cached 5 minutes | node-cache TTL |
| ANA-02 | Agency-scoped users only see their agency metrics | Filter in query |
| ANA-03 | Report exports stored in S3 with 1-hour expiry | Presigned URL TTL |
| ANA-04 | Maximum report size: 10,000 rows | Cap query results |
| ANA-05 | PDF reports include header with date range and filters | Template includes context |
| ANA-06 | Scheduled reports run max once per day | EventBridge rule limit |

## Audit Trail Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| AUD-01 | Audit events are immutable (no update, no delete) | No UPDATE/DELETE routes; DB role restriction |
| AUD-02 | All mutations across all modules generate audit events | Express middleware |
| AUD-03 | Audit export supports JSON and CSV formats | Format parameter |
| AUD-04 | Audit query respects agency scoping for non-admins | Filter by user's agency |
| AUD-05 | Audit retention: minimum 7 years | No auto-delete policy |
| AUD-06 | Timestamps synchronized to UTC | All servers use UTC |
