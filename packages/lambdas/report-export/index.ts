import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Client } from "pg";
import ExcelJS from "exceljs";
import PdfPrinter from "pdfmake";

interface ExportRequest {
  format: "pdf" | "excel" | "csv";
  reportType: string;
  parameters: Record<string, string>;
}

const s3 = new S3Client({});

async function getDbClient(): Promise<Client> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

function getQueryForReport(
  reportType: string,
  parameters: Record<string, string>
): { query: string; params: string[] } {
  switch (reportType) {
    case "records-by-category":
      return {
        query: `SELECT r.id, r.title, r.category, r.classification_status, r.created_at
                FROM records r
                WHERE ($1 = '' OR r.category = $1)
                ORDER BY r.created_at DESC`,
        params: [parameters.category || ""],
      };
    case "retention-schedule":
      return {
        query: `SELECT r.id, r.title, r.disposition_date, r.disposition_status, r.custodian_id
                FROM records r
                WHERE r.disposition_date IS NOT NULL
                AND ($1 = '' OR r.disposition_status = $1)
                ORDER BY r.disposition_date ASC`,
        params: [parameters.status || ""],
      };
    case "circulation-history":
      return {
        query: `SELECT ce.id, r.title, u.name AS borrower, ce.type, ce.created_at, ce.expected_return_date, ce.actual_return_date
                FROM circulation_events ce
                JOIN records r ON r.id = ce.record_id
                JOIN users u ON u.id = ce.borrower_id
                WHERE ($1 = '' OR ce.type = $1)
                ORDER BY ce.created_at DESC`,
        params: [parameters.eventType || ""],
      };
    case "audit-log":
      return {
        query: `SELECT al.id, al.action, al.entity_type, al.entity_id, u.name AS user_name, al.created_at
                FROM audit_log al
                JOIN users u ON u.id = al.user_id
                WHERE al.created_at BETWEEN $1 AND $2
                ORDER BY al.created_at DESC`,
        params: [
          parameters.startDate || new Date(0).toISOString(),
          parameters.endDate || new Date().toISOString(),
        ],
      };
    default:
      return {
        query: `SELECT id, title, category, created_at FROM records ORDER BY created_at DESC LIMIT 1000`,
        params: [],
      };
  }
}

async function generatePdf(
  rows: Record<string, unknown>[],
  reportType: string
): Promise<Buffer> {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const tableBody = [
    columns.map((col) => ({ text: col, bold: true })),
    ...rows.map((row) => columns.map((col) => String(row[col] ?? ""))),
  ];

  const docDefinition = {
    defaultStyle: { font: "Helvetica" },
    content: [
      { text: `Report: ${reportType}`, style: "header" },
      { text: `Generated: ${new Date().toISOString()}`, margin: [0, 0, 0, 10] as [number, number, number, number] },
      {
        table: {
          headerRows: 1,
          body: tableBody,
        },
      },
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] as [number, number, number, number] },
    },
  };

  return new Promise((resolve, reject) => {
    const doc = printer.createPdfKitDocument(docDefinition as any);
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

async function generateExcel(
  rows: Record<string, unknown>[],
  reportType: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(reportType);

  if (rows.length > 0) {
    const columns = Object.keys(rows[0]);
    sheet.columns = columns.map((col) => ({
      header: col,
      key: col,
      width: 20,
    }));

    for (const row of rows) {
      sheet.addRow(row);
    }

    sheet.getRow(1).font = { bold: true };
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function generateCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";

  const columns = Object.keys(rows[0]);
  const header = columns.join(",");
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const value = String(row[col] ?? "");
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",")
  );

  return [header, ...lines].join("\n");
}

export const handler: APIGatewayProxyHandler = async (
  event
): Promise<APIGatewayProxyResult> => {
  const db = await getDbClient();

  try {
    const body: ExportRequest = JSON.parse(event.body || "{}");

    if (!body.format || !body.reportType) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "format and reportType are required" }),
      };
    }

    const { query, params } = getQueryForReport(body.reportType, body.parameters || {});
    const { rows } = await db.query(query, params);

    let fileContent: Buffer | string;
    let contentType: string;
    let extension: string;

    switch (body.format) {
      case "pdf":
        fileContent = await generatePdf(rows, body.reportType);
        contentType = "application/pdf";
        extension = "pdf";
        break;
      case "excel":
        fileContent = await generateExcel(rows, body.reportType);
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        extension = "xlsx";
        break;
      case "csv":
        fileContent = generateCsv(rows);
        contentType = "text/csv";
        extension = "csv";
        break;
      default:
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid format. Use pdf, excel, or csv" }),
        };
    }

    const key = `exports/${body.reportType}/${Date.now()}.${extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.EXPORTS_BUCKET,
        Key: key,
        Body: typeof fileContent === "string" ? Buffer.from(fileContent) : fileContent,
        ContentType: contentType,
      })
    );

    const presignedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.EXPORTS_BUCKET,
        Key: key,
      }),
      { expiresIn: 3600 }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: presignedUrl, key, format: body.format }),
    };
  } catch (error) {
    console.error("Report export error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  } finally {
    await db.end();
  }
};
