/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { KhachHang, VIP, ChucVu } from "../types";
import { Save, X, PlusCircle, Sparkles, AlertCircle } from "lucide-react";

interface CustomerFormProps {
  initialData?: KhachHang;
  onSubmit: (data: {
    maKH: string;
    tenKH: string;
    ngayThanhLap: string;
    canBoQuanLy: string;
    vips: [Omit<VIP, 'id'> & { id?: string }, Omit<VIP, 'id'> & { id?: string }];
  }) => void;
  onCancel: () => void;
  existingCodes: string[];
}

export default function CustomerForm({ initialData, onSubmit, onCancel, existingCodes }: CustomerFormProps) {
  const [maKH, setMaKH] = useState("");
  const [tenKH, setTenKH] = useState("");
  const [ngayThanhLap, setNgayThanhLap] = useState("");
  const [canBoQuanLy, setCanBoQuanLy] = useState("");

  const [vip1, setVip1] = useState<Omit<VIP, 'id'> & { id?: string }>({
    hoTen: "",
    chucVu: ChucVu.LanhDaoDonVi,
    ngaySinh: "",
    soDienThoai: ""
  });

  const [vip2, setVip2] = useState<Omit<VIP, 'id'> & { id?: string }>({
    hoTen: "",
    chucVu: ChucVu.KeToanTruong,
    ngaySinh: "",
    soDienThoai: ""
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setMaKH(initialData.maKH);
      setTenKH(initialData.tenKH);
      setNgayThanhLap(initialData.ngayThanhLap);
      setCanBoQuanLy(initialData.canBoQuanLy);
      if (initialData.vips[0]) {
        setVip1({ ...initialData.vips[0] });
      }
      if (initialData.vips[1]) {
        setVip2({ ...initialData.vips[1] });
      }
    } else {
      // Set a suggested next code
      const nextNum = existingCodes.length + 101;
      setMaKH(`KH${nextNum}`);
      setTenKH("");
      setNgayThanhLap("");
      setCanBoQuanLy("");
    }
  }, [initialData, existingCodes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!maKH.trim() || !tenKH.trim() || !ngayThanhLap || !canBoQuanLy.trim()) {
      setError("Vui lòng điền đầy đủ Mã, Tên khách hàng, Cán bộ quản lý và Ngày thành lập.");
      return;
    }

    // Check code duplication (only if not editing or changed code)
    if (!initialData || initialData.maKH !== maKH) {
      if (existingCodes.includes(maKH.trim().toUpperCase())) {
        setError(`Mã khách hàng "${maKH}" đã tồn tại trên hệ thống.`);
        return;
      }
    }

    // VIP validations
    if (!vip1.hoTen.trim() || !vip1.ngaySinh || !vip1.soDienThoai.trim()) {
      setError("Vui lòng điền đầy đủ họ tên, ngày sinh, và số điện thoại của khách VIP 1.");
      return;
    }

    if (!vip2.hoTen.trim() || !vip2.ngaySinh || !vip2.soDienThoai.trim()) {
      setError("Vui lòng điền đầy đủ họ tên, ngày sinh, và số điện thoại của khách VIP 2.");
      return;
    }

    onSubmit({
      maKH: maKH.trim().toUpperCase(),
      tenKH: tenKH.trim(),
      ngayThanhLap,
      canBoQuanLy: canBoQuanLy.trim(),
      vips: [vip1, vip2]
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden" id="customer-form-panel">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold font-sans text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B01137] inline-block shrink-0" />
            {initialData ? "Cập Nhật Thông Tin Khách Hàng" : "Thêm Mới Khách Hàng Chăm Sóc"}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Mỗi đối tác/cơ quan bao gồm thông tin đơn vị và thông tin chính xác của 2 khách hàng VIP
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          title="Đóng bản ghi"
          id="btn-close-form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6" id="customer-form-element">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2 animate-shake" id="form-error-msg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Section 1: Customer info */}
        <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-xl space-y-4">
          <div className="flex border-b border-slate-200 pb-2 mb-2">
            <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              1. Thông Tin Doanh Nghiệp/Đơn Vị
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Mã khách hàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={maKH}
                onChange={(e) => setMaKH(e.target.value)}
                placeholder="Ví dụ: KH102"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-semibold font-mono"
                required
                id="input-ma-kh"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Tên khách hàng / Cơ quan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={tenKH}
                onChange={(e) => setTenKH(e.target.value)}
                placeholder="Ví dụ: Công ty TNHH XYZ hoặc Trường Tiểu học Chu Văn An"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-medium"
                required
                id="input-ten-kh"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Cán bộ quản lý <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={canBoQuanLy}
                onChange={(e) => setCanBoQuanLy(e.target.value)}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-medium"
                required
                id="input-can-bo-quan-ly"
              />
            </div>

            <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Ngày thành lập <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={ngayThanhLap}
              onChange={(e) => setNgayThanhLap(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-mono"
              required
              id="input-ngay-tl"
            />
            <p className="text-[11px] text-slate-400 mt-1 italic">
              Định dạng kỷ niệm ngày thành lập doanh nghiệp
            </p>
            </div>
          </div>
        </div>

        {/* Section 2: VIP 1 */}
        <div className="bg-white border border-slate-250 p-5 rounded-xl space-y-4">
          <div className="flex border-b border-slate-150 pb-2 mb-2 justify-between items-center">
            <h3 className="text-xs font-bold text-slate-705 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-150 text-xs font-black rounded">1</span>
              Thông Tin Khách VIP Thứ Nhất
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-505 mb-1.5 uppercase tracking-wider">
                Họ và Tên VIP <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={vip1.hoTen}
                onChange={(e) => setVip1({ ...vip1, hoTen: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-medium"
                required
                id="input-vip1-hoten"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-505 mb-1.5 uppercase tracking-wider">
                Chức vụ <span className="text-rose-500">*</span>
              </label>
              <select
                value={vip1.chucVu}
                onChange={(e) => setVip1({ ...vip1, chucVu: e.target.value as ChucVu })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all cursor-pointer font-medium text-slate-700"
                id="select-vip1-chucvu"
              >
                <option value={ChucVu.LanhDaoDonVi}>Lãnh đạo đơn vị</option>
                <option value={ChucVu.KeToanTruong}>Kế toán trưởng</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-505 mb-1.5 uppercase tracking-wider">
                Ngày sinh nhật <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={vip1.ngaySinh}
                onChange={(e) => setVip1({ ...vip1, ngaySinh: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-mono"
                required
                id="input-vip1-ngaysinh"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-505 mb-1.5 uppercase tracking-wider">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={vip1.soDienThoai}
                onChange={(e) => setVip1({ ...vip1, soDienThoai: e.target.value })}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-mono font-semibold"
                required
                id="input-vip1-phone"
              />
            </div>
          </div>
        </div>

        {/* Section 3: VIP 2 */}
        <div className="bg-white border border-slate-250 p-5 rounded-xl space-y-4">
          <div className="flex border-b border-slate-150 pb-2 mb-2 justify-between items-center">
            <h3 className="text-xs font-bold text-slate-705 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-5 h-5 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-150 text-xs font-black rounded">2</span>
              Thông Tin Khách VIP Thứ Hai
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-505 mb-1.5 uppercase tracking-wider">
                Họ và Tên VIP <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={vip2.hoTen}
                onChange={(e) => setVip2({ ...vip2, hoTen: e.target.value })}
                placeholder="Ví dụ: Trần Thị B"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-medium"
                required
                id="input-vip2-hoten"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-505 mb-1.5 uppercase tracking-wider">
                Chức vụ <span className="text-rose-500">*</span>
              </label>
              <select
                value={vip2.chucVu}
                onChange={(e) => setVip2({ ...vip2, chucVu: e.target.value as ChucVu })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all cursor-pointer font-medium text-slate-700"
                id="select-vip2-chucvu"
              >
                <option value={ChucVu.LanhDaoDonVi}>Lãnh đạo đơn vị</option>
                <option value={ChucVu.KeToanTruong}>Kế toán trưởng</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-505 mb-1.5 uppercase tracking-wider">
                Ngày sinh nhật <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={vip2.ngaySinh}
                onChange={(e) => setVip2({ ...vip2, ngaySinh: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-mono"
                required
                id="input-vip2-ngaysinh"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-505 mb-1.5 uppercase tracking-wider">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={vip2.soDienThoai}
                onChange={(e) => setVip2({ ...vip2, soDienThoai: e.target.value })}
                placeholder="Ví dụ: 0987112233"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500 transition-all font-mono font-semibold"
                required
                id="input-vip2-phone"
              />
            </div>
          </div>
        </div>

        {/* Buttons Action */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
            id="btn-cancel-submit"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#B01137] border border-transparent text-xs font-bold rounded-lg text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-xs cursor-pointer"
            id="btn-submit-form"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{initialData ? "Lưu thay đổi" : "Lưu khách hàng"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
