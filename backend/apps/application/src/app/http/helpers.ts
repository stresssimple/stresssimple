import * as fs from 'fs';
import * as path from 'path';

export function getAuditLogRecords(
  testId: string,
  runId: string,
  page = 1,
  pageSize = 10,
) {
  const auditDir = process.env['AUDIT_FOLDER'];
  const logDir = path.join(auditDir, testId, runId);
  if (!fs.existsSync(logDir)) {
    return [];
  }
  let files = fs.readdirSync(logDir);
  files = files.splice((page - 1) * pageSize, pageSize);
  const result = files.map((filename) => {
    const data = getAuditLogRecord(testId, runId, filename);
    const states = fs.statSync(path.join(logDir, filename));
    return {
      filename,
      size: states?.size,
      timestamp: new Date(Number(filename.slice(1, -9))),
      method: data.request['method'],
      url: data.request['url'],
      statusCode: data.response['status'],
    };
  });
  return { total: files.length, data: result };
}

export function getAuditLogRecord(
  testId: string,
  runId: string,
  filename: string,
): { request: unknown; response: unknown } {
  const auditDir = process.env['AUDIT_FOLDER'];
  const logDir = path.join(auditDir, testId, runId);
  if (!fs.existsSync(logDir)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(path.join(logDir, filename), 'utf-8'));
}
