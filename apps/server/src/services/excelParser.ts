import ExcelJS from "exceljs";
import * as XLSX from "xlsx";

const INCOME_매입구분 = ["결제취소", "승인취소"];

export interface ParsedRow {
  date: Date;
  amount: number;
  memo: string | null;
  type: "INCOME" | "EXPENSE";
}

export interface ParseResult {
  rows: ParsedRow[];
  skipped: number;
}

/** .xlsx is ZIP-based; first two bytes are PK. Otherwise treat as .xls. */
function isXlsxBuffer(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 4) return false;
  return buffer[0] === 0x50 && buffer[1] === 0x4b; // PK
}

/**
 * Parse bank/card Excel. First sheet only. Supports .xlsx (exceljs) and .xls (xlsx/SheetJS).
 * Columns: 거래일|카드구분|이용카드|가맹점명|승인번호|금액|매입구분|...
 * - date format "2026.02.28 15:17" or Excel serial
 * - 매입구분 "결제취소" or "승인취소" -> INCOME, else EXPENSE
 * - memo = 가맹점명
 * - Last row is excluded (summary row).
 */
export async function parseTransactionExcel(buffer: Buffer): Promise<ParseResult> {
  if (!buffer?.length) {
    throw new Error("파일 내용이 비어 있습니다.");
  }

  if (isXlsxBuffer(buffer)) {
    return parseXlsx(buffer);
  }
  return parseXls(buffer);
}

async function parseXlsx(buffer: Buffer): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ExcelJS Buffer type conflicts with Node Buffer
  await workbook.xlsx.load(buffer as any);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error("워크시트를 찾을 수 없습니다.");
  }

  const rowCount = sheet.rowCount ?? 0;
  if (rowCount < 2) {
    return { rows: [], skipped: 0 };
  }

  const headerRow = sheet.getRow(1);
  const colIndex: Record<string, number> = {};
  headerRow.eachCell((cell, colNumber) => {
    const v = cell.value;
    const text = typeof v === "string" ? v.trim() : String(v ?? "").trim();
    if (text) colIndex[text] = colNumber;
  });

  const idx거래일 = colIndex["거래일"] ?? 1;
  const idx가맹점명 = colIndex["가맹점명"] ?? 4;
  const idx금액 = colIndex["금액"] ?? 6;
  const idx매입구분 = colIndex["매입구분"] ?? 7;

  const rows: ParsedRow[] = [];
  let skipped = 0;
  const lastDataRow = rowCount - 1;

  for (let r = 2; r <= lastDataRow; r++) {
    const row = sheet.getRow(r);
    const dateVal = row.getCell(idx거래일).value;
    const amountVal = row.getCell(idx금액).value;
    const memoVal = row.getCell(idx가맹점명).value;
    const 매입구분Val = row.getCell(idx매입구분).value;

    const date = parseDateFromUnknown(dateVal);
    const amount = parseAmountFromUnknown(amountVal);
    if (!date || amount == null || amount <= 0) {
      skipped++;
      continue;
    }

    const memo =
      memoVal != null && String(memoVal).trim() !== ""
        ? String(memoVal).trim()
        : null;
    const 매입구분Str =
      매입구분Val != null ? String(매입구분Val).trim() : "";
    const type = INCOME_매입구분.includes(매입구분Str) ? "INCOME" : "EXPENSE";

    rows.push({ date, amount, memo, type });
  }

  return { rows, skipped };
}

function parseXls(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("워크시트를 찾을 수 없습니다.");
  }

  const sheet = workbook.Sheets[sheetName];
  const data: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: "",
  });

  if (!Array.isArray(data) || data.length < 2) {
    return { rows: [], skipped: 0 };
  }

  const headerRow = data[0] as unknown[];
  const colIndex: Record<string, number> = {};
  headerRow.forEach((cell, i) => {
    const text = String(cell ?? "").trim();
    if (text) colIndex[text] = i;
  });

  const idx거래일 = colIndex["거래일"] ?? 0;
  const idx가맹점명 = colIndex["가맹점명"] ?? 3;
  const idx금액 = colIndex["금액"] ?? 5;
  const idx매입구분 = colIndex["매입구분"] ?? 6;

  const rows: ParsedRow[] = [];
  let skipped = 0;
  const lastDataRow = data.length - 2; // exclude last (summary)

  for (let r = 1; r <= lastDataRow; r++) {
    const row = data[r];
    if (!Array.isArray(row)) {
      skipped++;
      continue;
    }

    const dateVal = row[idx거래일];
    const amountVal = row[idx금액];
    const memoVal = row[idx가맹점명];
    const 매입구분Val = row[idx매입구분];

    const date = parseDateFromUnknown(dateVal);
    const amount = parseAmountFromUnknown(amountVal);
    if (!date || amount == null || amount <= 0) {
      skipped++;
      continue;
    }

    const memo =
      memoVal != null && String(memoVal).trim() !== ""
        ? String(memoVal).trim()
        : null;
    const 매입구분Str =
      매입구분Val != null ? String(매입구분Val).trim() : "";
    const type = INCOME_매입구분.includes(매입구분Str) ? "INCOME" : "EXPENSE";

    rows.push({ date, amount, memo, type });
  }

  return { rows, skipped };
}

function parseDateFromUnknown(val: unknown): Date | null {
  if (val == null) return null;
  if (val instanceof Date) return val;
  if (typeof val === "number") {
    return excelSerialToDate(val);
  }
  const s = String(val).trim();
  if (!s) return null;
  const match = s.match(
    /^(\d{4})\.(\d{1,2})\.(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (!match) return null;
  const [, y, m, d, h = "0", min = "0", sec = "0"] = match;
  const date = new Date(
    parseInt(y!, 10),
    parseInt(m!, 10) - 1,
    parseInt(d!, 10),
    parseInt(h, 10),
    parseInt(min, 10),
    parseInt(sec, 10)
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function excelSerialToDate(serial: number): Date | null {
  if (Number.isNaN(serial) || serial < 0) return null;
  const utc = (serial - 25569) * 86400 * 1000;
  const d = new Date(utc);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseAmountFromUnknown(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  const s = String(val).trim().replace(/,/g, "");
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}
