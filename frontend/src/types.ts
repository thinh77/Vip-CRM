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
  maKH: string;
  tenKH: string;
  ngayThanhLap: string;
  canBoQuanLy: string;
  vips: [VIP, VIP];
  lichSuTuongTac: Interaction[];
  ghiChuList: GhiChu[];
}

export interface CareEvent {
  id: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  type: "FOUNDING" | "VIP_BIRTHDAY";
  title: string;
  vipName?: string;
  vipPhone?: string;
  vipRole?: string;
  originalYear: number;
  dateStr: string;
  day: number;
  daysRemaining: number;
  isToday: boolean;
  age: number;
}

export interface DashboardStats {
  totalCustomers: number;
  monthEventsCount: number;
  totalInteractions: number;
}
