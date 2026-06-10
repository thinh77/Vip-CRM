import { assertIsoDate } from "../shared/date.js";
import { badRequest, HttpError } from "../shared/errors.js";
import {
  CHUC_VU_VALUES,
  INTERACTION_TYPE_VALUES,
  type CustomerInput,
  type InteractionInput
} from "../shared/types.js";

function requireText(value: unknown, field: string, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`${label} là bắt buộc.`, field);
  }
  return value.trim();
}

function requireObject(value: unknown, field: string, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw badRequest(`${label} không hợp lệ.`, field);
  }
  return value as Record<string, unknown>;
}

export function validateCustomerInput(value: unknown): CustomerInput {
  const input = requireObject(value, "customer", "Dữ liệu khách hàng");
  const maKH = requireText(input.maKH, "maKH", "Mã khách hàng").toUpperCase();
  const tenKH = requireText(input.tenKH, "tenKH", "Tên khách hàng");
  const ngayThanhLap = requireText(input.ngayThanhLap, "ngayThanhLap", "Ngày thành lập");
  const canBoQuanLy = requireText(input.canBoQuanLy, "canBoQuanLy", "Cán bộ quản lý");
  assertIsoDate(ngayThanhLap, "ngayThanhLap");

  if (!Array.isArray(input.vips) || input.vips.length !== 2) {
    throw badRequest("Khách hàng phải có đúng 2 VIP.", "vips");
  }

  const vips = input.vips.map((item, index) => {
    const vip = requireObject(item, `vips.${index}`, "VIP");
    const chucVu = requireText(vip.chucVu, `vips.${index}.chucVu`, "Chức vụ VIP");
    if (!CHUC_VU_VALUES.includes(chucVu as never)) {
      throw badRequest("Chức vụ VIP không hợp lệ.", `vips.${index}.chucVu`);
    }
    const ngaySinh = requireText(vip.ngaySinh, `vips.${index}.ngaySinh`, "Ngày sinh VIP");
    assertIsoDate(ngaySinh, `vips.${index}.ngaySinh`);
    return {
      id: typeof vip.id === "string" ? vip.id : undefined,
      hoTen: requireText(vip.hoTen, `vips.${index}.hoTen`, "Họ tên VIP"),
      chucVu: chucVu as CustomerInput["vips"][number]["chucVu"],
      ngaySinh,
      soDienThoai: requireText(vip.soDienThoai, `vips.${index}.soDienThoai`, "Số điện thoại VIP")
    };
  }) as CustomerInput["vips"];

  return { maKH, tenKH, ngayThanhLap, canBoQuanLy, vips };
}

export function validateCustomerImportInput(value: unknown): CustomerInput[] {
  const input = requireObject(value, "import", "Dữ liệu import");
  if (!Array.isArray(input.customers)) {
    throw badRequest("Danh sách khách hàng không hợp lệ.", "customers");
  }
  if (input.customers.length === 0) {
    throw badRequest("File import phải có ít nhất 1 khách hàng.", "customers");
  }
  if (input.customers.length > 5000) {
    throw badRequest("Mỗi lần import không được vượt quá 5000 khách hàng.", "customers");
  }

  return input.customers.map((customer, index) => {
    try {
      return validateCustomerInput(customer);
    } catch (error) {
      if (error instanceof HttpError) {
        throw badRequest(`Dòng ${index + 2}: ${error.message}`, error.field);
      }
      throw error;
    }
  });
}

export function validateInteractionInput(value: unknown): InteractionInput {
  const input = requireObject(value, "interaction", "Dữ liệu tương tác");
  const ngayThang = requireText(input.ngayThang, "ngayThang", "Ngày tương tác");
  assertIsoDate(ngayThang, "ngayThang");
  const loaiHinh = requireText(input.loaiHinh, "loaiHinh", "Loại hình tương tác");
  if (!INTERACTION_TYPE_VALUES.includes(loaiHinh as never)) {
    throw badRequest("Loại hình tương tác không hợp lệ.", "loaiHinh");
  }
  return {
    ngayThang,
    loaiHinh: loaiHinh as InteractionInput["loaiHinh"],
    chiTiet: requireText(input.chiTiet, "chiTiet", "Chi tiết tương tác")
  };
}

export function validateNoteInput(value: unknown): string {
  const input = requireObject(value, "note", "Dữ liệu ghi chú");
  return requireText(input.noiDung, "noiDung", "Nội dung ghi chú");
}
