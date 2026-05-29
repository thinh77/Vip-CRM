/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KhachHang, ChucVu } from "./types";

export const initialCustomers: KhachHang[] = [
  {
    id: "1",
    maKH: "KH201",
    tenKH: "Công ty TNHH Giải pháp Công nghệ Việt",
    ngayThanhLap: "2018-05-12", // May (Current Month!)
    canBoQuanLy: "Nguyễn Minh Anh",
    vips: [
      {
        id: "vip_1_1",
        hoTen: "Trần Huy Hoàng",
        chucVu: ChucVu.GiamDoc,
        ngaySinh: "1985-08-15",
        soDienThoai: "0912345678"
      },
      {
        id: "vip_1_2",
        hoTen: "Phạm Thùy Chi",
        chucVu: ChucVu.KeToanTruong,
        ngaySinh: "1990-05-25", // May (Current Month!)
        soDienThoai: "0987654321"
      }
    ],
    lichSuTuongTac: [
      {
        id: "int_1_1",
        ngayThang: "2026-05-12",
        loaiHinh: "Gift",
        chiTiet: "Gửi lẵng hoa chúc mừng kỷ niệm 8 năm ngày thành lập công ty."
      },
      {
        id: "int_1_2",
        ngayThang: "2026-04-10",
        loaiHinh: "Meeting",
        chiTiet: "Gặp mặt đàm phán gia hạn hợp đồng dịch vụ phần mềm năm 2026. Khách hàng rất hài lòng."
      }
    ],
    ghiChuList: [
      {
        id: "note_1_1",
        ngayTao: "2026-01-15",
        noiDung: "Thích tặng trà mạn mộc và ghét phong cách gói quà quá sặc sỡ."
      }
    ]
  },
  {
    id: "2",
    maKH: "KH306",
    tenKH: "Trường Tiểu học Chu Văn An",
    ngayThanhLap: "2010-09-05",
    canBoQuanLy: "Trần Quốc Bảo",
    vips: [
      {
        id: "vip_2_1",
        hoTen: "Lê Thị Thanh Vân",
        chucVu: ChucVu.HieuTruong,
        ngaySinh: "1978-05-04", // May (Current Month!)
        soDienThoai: "0905112233"
      },
      {
        id: "vip_2_2",
        hoTen: "Trần Thanh Sơn",
        chucVu: ChucVu.KeToanTruong,
        ngaySinh: "1982-11-20",
        soDienThoai: "0935445566"
      }
    ],
    lichSuTuongTac: [
      {
        id: "int_2_1",
        ngayThang: "2026-05-04",
        loaiHinh: "Call",
        chiTiet: "Gọi điện chúc mừng sinh nhật Hiệu trưởng Thanh Vân. Chị Vân gửi lời cảm ơn hệ thống."
      }
    ],
    ghiChuList: [
      {
        id: "note_2_1",
        ngayTao: "2025-11-01",
        noiDung: "Ưu tiên hỗ trợ kỹ thuật nhanh vào dịp chuẩn bị khai giảng (tháng 8, tháng 9)."
      }
    ]
  },
  {
    id: "3",
    maKH: "KH511",
    tenKH: "Tập đoàn Đầu tư & Xây dựng An Phát",
    ngayThanhLap: "2015-11-20",
    canBoQuanLy: "Lê Thu Hà",
    vips: [
      {
        id: "vip_3_1",
        hoTen: "Phan Văn Đạt",
        chucVu: ChucVu.GiamDoc,
        ngaySinh: "1980-03-10",
        soDienThoai: "0977889900"
      },
      {
        id: "vip_3_2",
        hoTen: "Nguyễn Bích Ngọc",
        chucVu: ChucVu.KeToanTruong,
        ngaySinh: "1988-05-18", // May (Current Month!)
        soDienThoai: "0944556677"
      }
    ],
    lichSuTuongTac: [
      {
        id: "int_3_1",
        ngayThang: "2026-05-18",
        loaiHinh: "Email",
        chiTiet: "Gửi thiệp điện tử chúc mừng sinh nhật chị Ngọc - Kế toán trưởng."
      },
      {
        id: "int_3_2",
        ngayThang: "2026-02-14",
        loaiHinh: "Gift",
        chiTiet: "Gửi quà tặng Tết Nguyên Đán cho Ban giám đốc."
      }
    ],
    ghiChuList: [
      {
        id: "note_3_1",
        ngayTao: "2026-02-15",
        noiDung: "Thường hỏi han về các gói chiết khấu lớn khi thanh toán gộp 2 năm."
      }
    ]
  },
  {
    id: "4",
    maKH: "KH088",
    tenKH: "Trường THPT Phan Đình Phùng",
    ngayThanhLap: "1995-10-15",
    canBoQuanLy: "Phạm Đức Long",
    vips: [
      {
        id: "vip_4_1",
        hoTen: "Đặng Minh Tuấn",
        chucVu: ChucVu.HieuTruong,
        ngaySinh: "1972-12-30",
        soDienThoai: "0966778899"
      },
      {
        id: "vip_4_2",
        hoTen: "Vũ Thị Mai",
        chucVu: ChucVu.KeToanTruong,
        ngaySinh: "1984-07-02",
        soDienThoai: "0909001122"
      }
    ],
    lichSuTuongTac: [
      {
        id: "int_4_1",
        ngayThang: "2025-11-20",
        loaiHinh: "Meeting",
        chiTiet: "Tham dự lễ tri ân ngày Nhà giáo Việt Nam 20/11, gặp gỡ thầy Tuấn và cô Mai."
      }
    ],
    ghiChuList: [
      {
        id: "note_4_1",
        ngayTao: "2025-10-10",
        noiDung: "Cô Mai cực kỳ chi tiết trong khâu đối chiếu hóa đơn tài chính."
      }
    ]
  },
  {
    id: "5",
    maKH: "KH144",
    tenKH: "Hợp tác xã Nông nghiệp Đà Lạt Organic",
    ngayThanhLap: "2021-02-28",
    canBoQuanLy: "Đỗ Hồng Nhung",
    vips: [
      {
        id: "vip_5_1",
        hoTen: "Trương Quốc Khánh",
        chucVu: ChucVu.GiamDoc,
        ngaySinh: "1992-05-15", // May (Current Month!)
        soDienThoai: "0983111222"
      },
      {
        id: "vip_5_2",
        hoTen: "Trịnh Phương Thúy",
        chucVu: ChucVu.KeToanTruong,
        ngaySinh: "1995-04-12",
        soDienThoai: "0912112233"
      }
    ],
    lichSuTuongTac: [
      {
        id: "int_5_1",
        ngayThang: "2026-05-15",
        loaiHinh: "Call",
        chiTiet: "Gọi điện chúc mừng sinh nhật Giám đốc Quốc Khánh."
      }
    ],
    ghiChuList: []
  }
];
