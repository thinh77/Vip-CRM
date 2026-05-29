/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ChucVu {
  GiamDoc = "Giám đốc",
  HieuTruong = "Hiệu trưởng",
  KeToanTruong = "Kế toán trưởng"
}

export interface VIP {
  id: string;
  hoTen: string;
  chucVu: ChucVu;
  ngaySinh: string; // ISO format string YYYY-MM-DD
  soDienThoai: string;
}

export interface Interaction {
  id: string;
  ngayThang: string; // ISO format string YYYY-MM-DD
  loaiHinh: "Call" | "Meeting" | "Email" | "Gift" | "Other";
  chiTiet: string;
}

export interface GhiChu {
  id: string;
  ngayTao: string; // ISO format string YYYY-MM-DD
  noiDung: string;
}

export interface KhachHang {
  id: string;
  maKH: string; // Customer Code, e.g., KH001
  tenKH: string;
  ngayThanhLap: string; // ISO format string YYYY-MM-DD
  vips: [VIP, VIP]; // Exactly 2 VIPs per customer
  lichSuTuongTac: Interaction[];
  ghiChuList: GhiChu[];
}
