import { assertIsoDate } from "../shared/date.js";
import { badRequest } from "../shared/errors.js";
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

export function validateCustomerInput(value: unknown): CustomerInput {
  const input = value as Record<string, unknown>;
  const maKH = requireText(input.maKH, "maKH", "Mã khách hàng").toUpperCase();
  const tenKH = requireText(input.tenKH, "tenKH", "Tên khách hàng");
  const ngayThanhLap = requireText(input.ngayThanhLap, "ngayThanhLap", "Ngày thành lập");
  const canBoQuanLy = requireText(input.canBoQuanLy, "canBoQuanLy", "Cán bộ quản lý");
  assertIsoDate(ngayThanhLap, "ngayThanhLap");

  if (!Array.isArray(input.vips) || input.vips.length !== 2) {
    throw badRequest("Khách hàng phải có đúng 2 VIP.", "vips");
  }

  const vips = input.vips.map((item, index) => {
    const vip = item as Record<string, unknown>;
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

export function validateInteractionInput(value: unknown): InteractionInput {
  const input = value as Record<string, unknown>;
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
  return requireText((value as Record<string, unknown>).noiDung, "noiDung", "Nội dung ghi chú");
}
