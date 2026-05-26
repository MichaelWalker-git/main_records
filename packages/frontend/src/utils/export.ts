import api from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      const str = val == null ? '' : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function generatePdf(title: string, headers: string[], rows: string[][], filename: string) {
  const doc = new jsPDF({ orientation: rows[0]?.length > 5 ? 'landscape' : 'portrait' });

  // Header
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102); // navy-500
  doc.text('MAINE STATE ARCHIVES', 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(title, 14, 26);
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  // Table
  autoTable(doc, {
    startY: 38,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 51, 102], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(filename);
}

export async function exportRecords(format: 'pdf' | 'excel' | 'csv') {
  const { data: resp } = await api.get('/records', { params: { page: 1, pageSize: 1000 } });
  const records = resp?.data ?? resp ?? [];

  const exportData = records.map((r: any) => ({
    tracking_number: r.trackingNumber || '',
    title: r.title || '',
    series: r.seriesTitle || '',
    status: r.status || '',
    media_type: r.mediaType || '',
    agency: r.agencyName || r.agencyCode || '',
    location: r.locationCode || '',
    created_at: r.createdAt || '',
  }));

  if (format === 'csv') {
    downloadFile(toCsv(exportData), 'records-export.csv', 'text/csv');
  } else if (format === 'excel') {
    const headers = Object.keys(exportData[0] || {});
    const rows = exportData.map((r: any) => headers.map((h) => r[h] ?? '').join('\t'));
    downloadFile([headers.join('\t'), ...rows].join('\n'), 'records-export.xls', 'application/vnd.ms-excel');
  } else {
    const headers = ['Tracking #', 'Title', 'Series', 'Status', 'Media Type', 'Agency', 'Location', 'Created'];
    const rows = exportData.map((r: any) => [
      r.tracking_number, r.title, r.series, r.status, r.media_type, r.agency, r.location, r.created_at,
    ]);
    generatePdf('Records Export', headers, rows, 'records-export.pdf');
  }
}

export async function exportAuditLog(format: 'pdf' | 'excel' | 'csv') {
  const { data: resp } = await api.get('/admin/audit-log', { params: { page: 1, pageSize: 1000 } });
  const events = resp?.data ?? resp ?? [];

  const exportData = events.map((e: any) => ({
    timestamp: e.createdAt || '',
    user: e.userEmail || '',
    action: e.action || '',
    resource_type: e.resourceType || '',
    resource_id: e.resourceId || '',
  }));

  if (format === 'csv') {
    downloadFile(toCsv(exportData), 'audit-log-export.csv', 'text/csv');
  } else if (format === 'excel') {
    const headers = Object.keys(exportData[0] || {});
    const rows = exportData.map((r: any) => headers.map((h) => r[h] ?? '').join('\t'));
    downloadFile([headers.join('\t'), ...rows].join('\n'), 'audit-log-export.xls', 'application/vnd.ms-excel');
  } else {
    const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID'];
    const rows = exportData.map((r: any) => [r.timestamp, r.user, r.action, r.resource_type, r.resource_id]);
    generatePdf('Audit Log Export', headers, rows, 'audit-log-export.pdf');
  }
}

export async function exportReport(reportType: string, format: 'pdf' | 'excel' | 'csv') {
  try {
    const typeMap: Record<string, string> = {
      'retention-compliance': 'retention',
      'disposition-summary': 'activity',
      'agency-activity': 'activity',
      'inventory-status': 'dashboard',
      'audit-trail': 'activity',
      'legal-holds': 'retention',
    };
    const reportNames: Record<string, string> = {
      'retention-compliance': 'Retention Compliance Report',
      'disposition-summary': 'Disposition Summary Report',
      'agency-activity': 'Agency Activity Report',
      'inventory-status': 'Inventory Status Report',
      'audit-trail': 'Audit Trail Report',
      'legal-holds': 'Legal Holds Report',
    };
    const backendType = typeMap[reportType] || reportType;
    const { data: resp } = await api.get(`/analytics/export/${backendType}`);
    const reportData = resp?.data ?? resp ?? {};

    if (format === 'csv') {
      if (Array.isArray(reportData)) {
        downloadFile(toCsv(reportData), `${reportType}-report.csv`, 'text/csv');
      } else {
        // Flatten object to array of key-value pairs
        const flat = Object.entries(reportData).map(([key, value]) => ({
          metric: key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
        }));
        downloadFile(toCsv(flat), `${reportType}-report.csv`, 'text/csv');
      }
    } else if (format === 'excel') {
      if (Array.isArray(reportData) && reportData.length > 0) {
        const headers = Object.keys(reportData[0]);
        const rows = reportData.map((r: any) => headers.map((h) => r[h] ?? '').join('\t'));
        downloadFile([headers.join('\t'), ...rows].join('\n'), `${reportType}-report.xls`, 'application/vnd.ms-excel');
      } else {
        const headers = ['Metric', 'Value'];
        const rows = Object.entries(reportData).map(([k, v]) => `${k}\t${typeof v === 'object' ? JSON.stringify(v) : v}`);
        downloadFile([headers.join('\t'), ...rows].join('\n'), `${reportType}-report.xls`, 'application/vnd.ms-excel');
      }
    } else {
      const reportName = reportNames[reportType] || 'Report';
      if (Array.isArray(reportData) && reportData.length > 0) {
        const headers = Object.keys(reportData[0]).map((h) => h.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()));
        const keys = Object.keys(reportData[0]);
        const rows = reportData.map((r: any) => keys.map((k) => String(r[k] ?? '')));
        generatePdf(reportName, headers, rows, `${reportType}-report.pdf`);
      } else {
        const headers = ['Metric', 'Value'];
        const rows = Object.entries(reportData).map(([k, v]) => [
          k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
          typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
        ]);
        generatePdf(reportName, headers, rows, `${reportType}-report.pdf`);
      }
    }
  } catch {
    alert('Failed to generate report export');
  }
}