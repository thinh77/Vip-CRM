import type { CustomerPayload } from "../api/customersApi";
import { ChucVu } from "../types";

export type CustomerImportState =
  | { phase: "idle"; count: 0 }
  | { phase: "parsing"; count: 0 }
  | { phase: "saving"; count: number }
  | { phase: "refreshing"; count: number };

export function getCustomerImportLabel(state: CustomerImportState): string {
  switch (state.phase) {
    case "parsing":
      return "Đang đọc file...";
    case "saving":
      return `Đang lưu ${state.count} khách hàng...`;
    case "refreshing":
      return "Đang cập nhật dữ liệu...";
    default:
      return "Import Excel";
  }
}

export function isSupportedCustomerImportFile(file: File): boolean {
  return /\.(xlsx|xls)$/i.test(file.name);
}

const REQUIRED_HEADERS = [
  "mã kh",
  "tên đơn vị",
  "cán bộ quản lý",
  "họ tên lãnh đạo",
  "số điện thoại lãnh đạo",
  "sinh nhật lãnh đạo",
  "họ tên kế toán",
  "số điện thoại kế toán",
  "sinh nhật kế toán",
  "ngày thành lập"
] as const;

type ImportHeader = typeof REQUIRED_HEADERS[number];

export function normalizeImportHeaders(headers: unknown[]): string[] {
  return headers.map((header) => String(header ?? "").trim().toLowerCase());
}

function textValue(value: unknown): string {
  return String(value ?? "").trim();
}

function assertRequiredHeaders(headers: string[]) {
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Thiếu cột bắt buộc: ${missingHeaders.join(", ")}.`);
  }
}

function requireCell(row: Record<ImportHeader, unknown>, header: ImportHeader, label: string, rowNumber: number): string {
  const value = textValue(row[header]);
  if (!value) {
    throw new Error(`Dòng ${rowNumber}: ${label} là bắt buộc.`);
  }
  return value;
}

function buildIsoDate(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("invalid date");
  }
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function excelSerialToIsoDate(serial: number): string {
  if (!Number.isFinite(serial) || serial <= 0) {
    throw new Error("invalid date");
  }
  const utcMs = Math.round((serial - 25569) * 86400 * 1000);
  const date = new Date(utcMs);
  return buildIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

function parseImportDate(value: unknown, label: string, rowNumber: number): string {
  try {
    if (value instanceof Date) {
      return buildIsoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
    }

    const text = textValue(value);
    if (!text) {
      throw new Error("missing date");
    }

    if (/^\d+(\.\d+)?$/.test(text)) {
      return excelSerialToIsoDate(Number(text));
    }

    const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      return buildIsoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
    }

    const viMatch = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2}|\d{4})$/);
    if (viMatch) {
      const year = Number(viMatch[3].length === 2 ? `20${viMatch[3]}` : viMatch[3]);
      return buildIsoDate(year, Number(viMatch[2]), Number(viMatch[1]));
    }

    throw new Error("unsupported date");
  } catch {
    throw new Error(`Dòng ${rowNumber}: ${label} không hợp lệ.`);
  }
}

function hasAnyCell(row: unknown[]): boolean {
  return row.some((cell) => textValue(cell));
}

function rowToObject(headers: string[], row: unknown[]): Record<ImportHeader, unknown> {
  return REQUIRED_HEADERS.reduce((result, header) => {
    result[header] = row[headers.indexOf(header)];
    return result;
  }, {} as Record<ImportHeader, unknown>);
}

export function mapCustomerImportSheet(sheetRows: unknown[][]): CustomerPayload[] {
  if (sheetRows.length === 0) {
    throw new Error("File Excel không có dòng header.");
  }

  const headers = normalizeImportHeaders(sheetRows[0]);
  assertRequiredHeaders(headers);

  return sheetRows.slice(1).flatMap((row, index) => {
    const rowNumber = index + 2;
    if (!hasAnyCell(row)) {
      return [];
    }

    const rowObject = rowToObject(headers, row);
    const maKH = requireCell(rowObject, "mã kh", "Mã KH", rowNumber).toUpperCase();

    return [{
      maKH,
      tenKH: requireCell(rowObject, "tên đơn vị", "Tên đơn vị", rowNumber),
      canBoQuanLy: requireCell(rowObject, "cán bộ quản lý", "Cán bộ quản lý", rowNumber),
      ngayThanhLap: parseImportDate(rowObject["ngày thành lập"], "Ngày thành lập", rowNumber),
      vips: [
        {
          hoTen: requireCell(rowObject, "họ tên lãnh đạo", "Họ tên lãnh đạo", rowNumber),
          chucVu: ChucVu.LanhDaoDonVi,
          soDienThoai: requireCell(rowObject, "số điện thoại lãnh đạo", "Số điện thoại lãnh đạo", rowNumber),
          ngaySinh: parseImportDate(rowObject["sinh nhật lãnh đạo"], "Sinh nhật lãnh đạo", rowNumber)
        },
        {
          hoTen: requireCell(rowObject, "họ tên kế toán", "Họ tên kế toán", rowNumber),
          chucVu: ChucVu.KeToanTruong,
          soDienThoai: requireCell(rowObject, "số điện thoại kế toán", "Số điện thoại kế toán", rowNumber),
          ngaySinh: parseImportDate(rowObject["sinh nhật kế toán"], "Sinh nhật kế toán", rowNumber)
        }
      ]
    }];
  });
}

export async function parseCustomerImportFile(file: File): Promise<CustomerPayload[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("File Excel không có worksheet.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false
  });

  return mapCustomerImportSheet(sheetRows);
}
