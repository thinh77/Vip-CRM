export const CHUC_VU_VALUES = ["Giám đốc", "Hiệu trưởng", "Kế toán trưởng"] as const;
export type ChucVu = (typeof CHUC_VU_VALUES)[number];

export const INTERACTION_TYPE_VALUES = ["Call", "Meeting", "Email", "Gift", "Other"] as const;
export type InteractionType = (typeof INTERACTION_TYPE_VALUES)[number];

export type VipInput = {
  id?: string;
  hoTen: string;
  chucVu: ChucVu;
  ngaySinh: string;
  soDienThoai: string;
};

export type CustomerInput = {
  maKH: string;
  tenKH: string;
  ngayThanhLap: string;
  canBoQuanLy: string;
  vips: [VipInput, VipInput];
};

export type InteractionInput = {
  ngayThang: string;
  loaiHinh: InteractionType;
  chiTiet: string;
};
