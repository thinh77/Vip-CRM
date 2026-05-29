import "dotenv/config";
import { pool } from "./pool.js";

type SeedCustomer = {
  maKH: string;
  tenKH: string;
  ngayThanhLap: string;
  canBoQuanLy: string;
  vips: Array<{
    position: 1 | 2;
    hoTen: string;
    chucVu: "Giám đốc" | "Hiệu trưởng" | "Kế toán trưởng";
    ngaySinh: string;
    soDienThoai: string;
  }>;
  interactions: Array<{
    ngayThang: string;
    loaiHinh: "Call" | "Meeting" | "Email" | "Gift" | "Other";
    chiTiet: string;
  }>;
  notes: Array<{
    ngayTao: string;
    noiDung: string;
  }>;
};

const seedCustomers: SeedCustomer[] = [
  {
    maKH: "KH201",
    tenKH: "Công ty TNHH Giải pháp Công nghệ Việt",
    ngayThanhLap: "2018-05-12",
    canBoQuanLy: "Nguyễn Minh Anh",
    vips: [
      {
        position: 1,
        hoTen: "Trần Huy Hoàng",
        chucVu: "Giám đốc",
        ngaySinh: "1985-08-15",
        soDienThoai: "0912345678"
      },
      {
        position: 2,
        hoTen: "Phạm Thùy Chi",
        chucVu: "Kế toán trưởng",
        ngaySinh: "1990-05-25",
        soDienThoai: "0987654321"
      }
    ],
    interactions: [
      {
        ngayThang: "2026-05-12",
        loaiHinh: "Gift",
        chiTiet: "Gửi lẵng hoa chúc mừng kỷ niệm 8 năm ngày thành lập công ty."
      },
      {
        ngayThang: "2026-04-10",
        loaiHinh: "Meeting",
        chiTiet: "Gặp mặt đàm phán gia hạn hợp đồng dịch vụ phần mềm năm 2026. Khách hàng rất hài lòng."
      }
    ],
    notes: [
      {
        ngayTao: "2026-01-15",
        noiDung: "Thích tặng trà mạn mộc và ghét phong cách gói quà quá sặc sỡ."
      }
    ]
  },
  {
    maKH: "KH306",
    tenKH: "Trường Tiểu học Chu Văn An",
    ngayThanhLap: "2010-09-05",
    canBoQuanLy: "Trần Quốc Bảo",
    vips: [
      {
        position: 1,
        hoTen: "Lê Thị Thanh Vân",
        chucVu: "Hiệu trưởng",
        ngaySinh: "1978-05-04",
        soDienThoai: "0905112233"
      },
      {
        position: 2,
        hoTen: "Trần Thanh Sơn",
        chucVu: "Kế toán trưởng",
        ngaySinh: "1982-11-20",
        soDienThoai: "0935445566"
      }
    ],
    interactions: [
      {
        ngayThang: "2026-05-04",
        loaiHinh: "Call",
        chiTiet: "Gọi điện chúc mừng sinh nhật Hiệu trưởng Thanh Vân. Chị Vân gửi lời cảm ơn hệ thống."
      }
    ],
    notes: [
      {
        ngayTao: "2025-11-01",
        noiDung: "Ưu tiên hỗ trợ kỹ thuật nhanh vào dịp chuẩn bị khai giảng (tháng 8, tháng 9)."
      }
    ]
  },
  {
    maKH: "KH511",
    tenKH: "Tập đoàn Đầu tư & Xây dựng An Phát",
    ngayThanhLap: "2015-11-20",
    canBoQuanLy: "Lê Thu Hà",
    vips: [
      {
        position: 1,
        hoTen: "Phan Văn Đạt",
        chucVu: "Giám đốc",
        ngaySinh: "1980-03-10",
        soDienThoai: "0977889900"
      },
      {
        position: 2,
        hoTen: "Nguyễn Bích Ngọc",
        chucVu: "Kế toán trưởng",
        ngaySinh: "1988-05-18",
        soDienThoai: "0944556677"
      }
    ],
    interactions: [
      {
        ngayThang: "2026-05-18",
        loaiHinh: "Email",
        chiTiet: "Gửi thiệp điện tử chúc mừng sinh nhật chị Ngọc - Kế toán trưởng."
      },
      {
        ngayThang: "2026-02-14",
        loaiHinh: "Gift",
        chiTiet: "Gửi quà tặng Tết Nguyên Đán cho Ban giám đốc."
      }
    ],
    notes: [
      {
        ngayTao: "2026-02-15",
        noiDung: "Thường hỏi han về các gói chiết khấu lớn khi thanh toán gộp 2 năm."
      }
    ]
  },
  {
    maKH: "KH088",
    tenKH: "Trường THPT Phan Đình Phùng",
    ngayThanhLap: "1995-10-15",
    canBoQuanLy: "Phạm Đức Long",
    vips: [
      {
        position: 1,
        hoTen: "Đặng Minh Tuấn",
        chucVu: "Hiệu trưởng",
        ngaySinh: "1972-12-30",
        soDienThoai: "0966778899"
      },
      {
        position: 2,
        hoTen: "Vũ Thị Mai",
        chucVu: "Kế toán trưởng",
        ngaySinh: "1984-07-02",
        soDienThoai: "0909001122"
      }
    ],
    interactions: [
      {
        ngayThang: "2025-11-20",
        loaiHinh: "Meeting",
        chiTiet: "Tham dự lễ tri ân ngày Nhà giáo Việt Nam 20/11, gặp gỡ thầy Tuấn và cô Mai."
      }
    ],
    notes: [
      {
        ngayTao: "2025-10-10",
        noiDung: "Cô Mai cực kỳ chi tiết trong khâu đối chiếu hóa đơn tài chính."
      }
    ]
  },
  {
    maKH: "KH144",
    tenKH: "Hợp tác xã Nông nghiệp Đà Lạt Organic",
    ngayThanhLap: "2021-02-28",
    canBoQuanLy: "Đỗ Hồng Nhung",
    vips: [
      {
        position: 1,
        hoTen: "Trương Quốc Khánh",
        chucVu: "Giám đốc",
        ngaySinh: "1992-05-15",
        soDienThoai: "0983111222"
      },
      {
        position: 2,
        hoTen: "Trịnh Phương Thúy",
        chucVu: "Kế toán trưởng",
        ngaySinh: "1995-04-12",
        soDienThoai: "0912112233"
      }
    ],
    interactions: [
      {
        ngayThang: "2026-05-15",
        loaiHinh: "Call",
        chiTiet: "Gọi điện chúc mừng sinh nhật Giám đốc Quốc Khánh."
      }
    ],
    notes: []
  }
];

export async function seedDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("begin");

    for (const customer of seedCustomers) {
      const customerResult = await client.query<{ id: string }>(
        `
          insert into customers (ma_kh, ten_kh, ngay_thanh_lap, can_bo_quan_ly, updated_at)
          values ($1, $2, $3, $4, now())
          on conflict (ma_kh) do update set
            ten_kh = excluded.ten_kh,
            ngay_thanh_lap = excluded.ngay_thanh_lap,
            can_bo_quan_ly = excluded.can_bo_quan_ly,
            updated_at = now()
          returning id
        `,
        [customer.maKH, customer.tenKH, customer.ngayThanhLap, customer.canBoQuanLy]
      );
      const customerId = customerResult.rows[0].id;

      await client.query("delete from vips where customer_id = $1", [customerId]);
      await client.query("delete from interactions where customer_id = $1", [customerId]);
      await client.query("delete from notes where customer_id = $1", [customerId]);

      for (const vip of customer.vips) {
        await client.query(
          `
            insert into vips (customer_id, position, ho_ten, chuc_vu, ngay_sinh, so_dien_thoai)
            values ($1, $2, $3, $4, $5, $6)
          `,
          [
            customerId,
            vip.position,
            vip.hoTen,
            vip.chucVu,
            vip.ngaySinh,
            vip.soDienThoai
          ]
        );
      }

      for (const interaction of customer.interactions) {
        await client.query(
          `
            insert into interactions (customer_id, ngay_thang, loai_hinh, chi_tiet)
            values ($1, $2, $3, $4)
          `,
          [
            customerId,
            interaction.ngayThang,
            interaction.loaiHinh,
            interaction.chiTiet
          ]
        );
      }

      for (const note of customer.notes) {
        await client.query(
          `
            insert into notes (customer_id, ngay_tao, noi_dung)
            values ($1, $2, $3)
          `,
          [customerId, note.ngayTao, note.noiDung]
        );
      }
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await seedDatabase();
    console.log("Seed data inserted.");
  } finally {
    await pool.end();
  }
}
