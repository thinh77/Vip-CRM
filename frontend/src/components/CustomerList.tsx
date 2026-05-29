/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KhachHang, ChucVu } from "../types";
import { formatDateVN, isDateInMonth, getCurrentMonth } from "../utils";
import { 
  Search, Eye, Edit2, Trash2, Phone, Building, User, Filter, 
  Sparkles, CheckCircle, GraduationCap, Percent, Award, Cake 
} from "lucide-react";

interface CustomerListProps {
  customers: KhachHang[];
  onSelectCustomer: (id: string) => void;
  onEditCustomer: (customer: KhachHang) => void;
  onDeleteCustomer: (id: string) => void;
  onAddNewClick: () => void;
}

export default function CustomerList({
  customers,
  onSelectCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddNewClick
}: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const currentMonth = getCurrentMonth();

  // Search filter
  const filteredCustomers = customers.filter((kh) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    
    // Search by code or customer name
    const matchCode = kh.maKH.toLowerCase().includes(term);
    const matchName = kh.tenKH.toLowerCase().includes(term);
    
    // Also support searching by VIP name to make it extremely premium
    const matchVip = kh.vips.some(
      (vip) => vip && vip.hoTen.toLowerCase().includes(term)
    );

    return matchCode || matchName || matchVip;
  });

  // Role filter on VIP profiles
  const finalCustomers = filteredCustomers.filter((kh) => {
    if (roleFilter === "All") return true;
    return kh.vips.some((vip) => vip && vip.chucVu === roleFilter);
  });

  // Check if anything has event in May
  const hasEventInMont = (kh: KhachHang) => {
    const foundingEvent = isDateInMonth(kh.ngayThanhLap, currentMonth);
    const vip1Event = kh.vips[0] && isDateInMonth(kh.vips[0].ngaySinh, currentMonth);
    const vip2Event = kh.vips[1] && isDateInMonth(kh.vips[1].ngaySinh, currentMonth);
    return foundingEvent || vip1Event || vip2Event;
  };

  const getVipRoleIcon = (role: ChucVu) => {
    switch (role) {
      case ChucVu.GiamDoc:
        return <Award className="w-3.5 h-3.5 text-amber-600" title={ChucVu.GiamDoc} />;
      case ChucVu.HieuTruong:
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-600" title={ChucVu.HieuTruong} />;
      case ChucVu.KeToanTruong:
        return <Percent className="w-3.5 h-3.5 text-emerald-600" title={ChucVu.KeToanTruong} />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="customer-list-panel">
      {/* Search & Filter Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col space-y-1 self-start md:self-auto">
          <h3 className="text-base font-bold font-sans text-slate-800">
            Danh Sách Khách Hàng Chăm Sóc ({finalCustomers.length})
          </h3>
          <p className="text-xs text-slate-500">
            Tìm kiếm khách hàng theo Tên, Mã số, hoặc Tên VIP
          </p>
        </div>

        {/* Action controllers */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập tên, mã số khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              id="search-input-field"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative w-full sm:w-auto flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-2">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-transparent focus:outline-none focus:ring-0 font-medium text-slate-700 cursor-pointer pr-1"
              id="filter-role-select"
            >
              <option value="All">Tất cả chức vụ</option>
              <option value={ChucVu.GiamDoc}>Có Giám đốc</option>
              <option value={ChucVu.HieuTruong}>Có Hiệu trưởng</option>
              <option value={ChucVu.KeToanTruong}>Có Kế toán</option>
            </select>
          </div>

          {/* New Customer Button */}
          <button
            onClick={onAddNewClick}
            className="w-full sm:w-auto bg-blue-600 text-white font-bold text-xs rounded-lg px-4 py-2.5 hover:bg-blue-700 transition-all flex items-center justify-center space-x-1 shadow-xs shrink-0 cursor-pointer"
            id="btn-add-customer-trigger"
          >
            <span>+ Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* Main lists */}
      {finalCustomers.length === 0 ? (
        <div className="text-center py-16 px-4" id="empty-customer-state">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-medium">Không tìm thấy khách hàng nào khớp với bộ lọc.</p>
          <p className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc lọc tất cả chức vụ.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table view */}
          <div className="hidden md:block overflow-x-auto" id="customers-table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-3.5">Mã số</th>
                  <th className="px-6 py-3.5">Tên Khách Hàng / Cơ Quan</th>
                  <th className="px-6 py-3.5">Thành lập</th>
                  <th className="px-6 py-3.5">Thông tin VIP 1</th>
                  <th className="px-6 py-3.5">Thông tin VIP 2</th>
                  <th className="px-6 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {finalCustomers.map((kh) => {
                  const hasEventsThisMonth = hasEventInMont(kh);
                  
                  return (
                    <tr 
                      key={kh.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        hasEventsThisMonth ? "bg-amber-50/10" : ""
                      }`}
                      id={`customer-tr-${kh.id}`}
                    >
                      {/* Code */}
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span>{kh.maKH}</span>
                          {hasEventsThisMonth && (
                            <span 
                              className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-100 block" 
                              title="Có sự kiện kỷ niệm hoặc sinh nhật VIP trong tháng này"
                            />
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4 max-w-[240px]">
                        <div>
                          <button
                            onClick={() => onSelectCustomer(kh.id)}
                            className="font-bold text-slate-800 text-sm hover:text-blue-600 transition-colors inline-block text-left font-sans cursor-pointer"
                          >
                            {kh.tenKH}
                          </button>
                          
                          {/* Log quick badge if interactions inside */}
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] text-slate-400">
                              Lịch sử: {kh.lichSuTuongTac.length} tương tác
                            </span>
                            {kh.ghiChuList.length > 0 && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                {kh.ghiChuList.length} ghi chú
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Founding Anniversary */}
                      <td className="px-6 py-4 whitespace-nowrap font-sans text-xs text-slate-650">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 font-mono">
                            {formatDateVN(kh.ngayThanhLap)}
                          </span>
                          {isDateInMonth(kh.ngayThanhLap, currentMonth) && (
                            <span className="text-[9px] text-rose-600 font-extrabold mt-0.5 uppercase tracking-wide flex items-center gap-0.5">
                              <Building className="w-2.5 h-2.5 shrink-0" />
                              Lập tháng này
                            </span>
                          )}
                        </div>
                      </td>

                      {/* VIP 1 info */}
                      <td className="px-6 py-4 text-xs">
                        {kh.vips[0] ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 font-semibold text-slate-800">
                              {getVipRoleIcon(kh.vips[0].chucVu)}
                              <span>{kh.vips[0].hoTen}</span>
                            </div>
                            <div className="text-slate-500 text-[10px] font-mono flex items-center gap-1.5">
                              <span>SN: {formatDateVN(kh.vips[0].ngaySinh)}</span>
                              {isDateInMonth(kh.vips[0].ngaySinh, currentMonth) && (
                                <span className="font-bold text-rose-500 flex items-center gap-0.5">
                                  <Cake className="w-2.5 h-2.5 shrink-0" /> SN Tháng 5
                                </span>
                              )}
                            </div>
                            <a 
                              href={`tel:${kh.vips[0].soDienThoai}`} 
                              className="text-slate-500 hover:text-blue-600 font-mono text-[10px] flex items-center space-x-1"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{kh.vips[0].soDienThoai}</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa nhập</span>
                        )}
                      </td>

                      {/* VIP 2 info */}
                      <td className="px-6 py-4 text-xs">
                        {kh.vips[1] ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 font-semibold text-slate-800">
                              {getVipRoleIcon(kh.vips[1].chucVu)}
                              <span>{kh.vips[1].hoTen}</span>
                            </div>
                            <div className="text-slate-500 text-[10px] font-mono flex items-center gap-1.5">
                              <span>SN: {formatDateVN(kh.vips[1].ngaySinh)}</span>
                              {isDateInMonth(kh.vips[1].ngaySinh, currentMonth) && (
                                <span className="font-bold text-rose-500 flex items-center gap-0.5">
                                  <Cake className="w-2.5 h-2.5 shrink-0" /> SN Tháng 5
                                </span>
                              )}
                            </div>
                            <a 
                              href={`tel:${kh.vips[1].soDienThoai}`} 
                              className="text-slate-500 hover:text-blue-600 font-mono text-[10px] flex items-center space-x-1"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{kh.vips[1].soDienThoai}</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa nhập</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectCustomer(kh.id)}
                            className="p-1.5 bg-slate-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-md hover:bg-blue-50/25 transition-all cursor-pointer"
                            title="Xem chi tiết & lịch sử tương tác"
                            id={`btn-view-${kh.id}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditCustomer(kh)}
                            className="p-1.5 bg-slate-50 text-slate-600 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-md hover:bg-amber-50/25 transition-all cursor-pointer"
                            title="Sửa bản ghi khách hàng"
                            id={`btn-edit-${kh.id}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(kh.id)}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-650 border border-slate-200 hover:border-red-200 rounded-md hover:bg-red-50/25 transition-all cursor-pointer"
                            title="Xóa khách hàng"
                            id={`btn-delete-${kh.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards list */}
          <div className="block md:hidden p-4 space-y-4" id="customers-mobile-container">
            {finalCustomers.map((kh) => {
              const hasEventsThisMonth = hasEventInMont(kh);

              return (
                <div 
                  key={kh.id}
                  className={`border rounded-xl p-4 space-y-3 bg-white hover:shadow-xs transition-all ${
                    hasEventsThisMonth ? "border-amber-200 bg-amber-50/10" : "border-slate-200"
                  }`}
                  id={`customer-mobile-card-${kh.id}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-600 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-md">
                      {kh.maKH}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      TL: {formatDateVN(kh.ngayThanhLap)}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={() => onSelectCustomer(kh.id)}
                      className="font-bold text-slate-800 text-sm leading-snug hover:text-blue-600 text-left cursor-pointer"
                    >
                      {kh.tenKH}
                    </button>
                    {hasEventsThisMonth && (
                      <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 rounded-md px-2 py-0.5 font-bold mt-1.5 inline-block">
                        Có sự kiện trong tháng 🎂
                      </span>
                    )}
                  </div>

                  {/* 2 VIP detail cards stacked in mobile */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100">
                    <div className="text-xs">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">VIP 1</span>
                      <p className="font-bold text-slate-800 leading-snug truncate mt-0.5">{kh.vips[0]?.hoTen}</p>
                      <p className="text-slate-500 text-[10px] ml-0">{kh.vips[0]?.chucVu}</p>
                      <a href={`tel:${kh.vips[0]?.soDienThoai}`} className="text-blue-600 font-mono text-[10px] font-semibold flex items-center gap-1 mt-1">
                        <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{kh.vips[0]?.soDienThoai}</span>
                      </a>
                    </div>
                    
                    <div className="text-xs">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">VIP 2</span>
                      <p className="font-bold text-slate-800 leading-snug truncate mt-0.5">{kh.vips[1]?.hoTen}</p>
                      <p className="text-slate-500 text-[10px] ml-0">{kh.vips[1]?.chucVu}</p>
                      <a href={`tel:${kh.vips[1]?.soDienThoai}`} className="text-blue-600 font-mono text-[10px] font-semibold flex items-center gap-1 mt-1">
                        <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{kh.vips[1]?.soDienThoai}</span>
                      </a>
                    </div>
                  </div>

                  {/* Mobile Actions tray */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-150">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {kh.lichSuTuongTac.length} HĐ | {kh.ghiChuList.length} ghi chú
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => onSelectCustomer(kh.id)}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg flex items-center space-x-1 border border-slate-200 cursor-pointer"
                        id={`mob-view-${kh.id}`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem</span>
                      </button>
                      <button
                        onClick={() => onEditCustomer(kh)}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg flex items-center space-x-1 border border-slate-200 cursor-pointer"
                        id={`mob-edit-${kh.id}`}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => onDeleteCustomer(kh.id)}
                        className="p-1 bg-slate-50 hover:bg-red-50 hover:text-red-650 text-slate-400 border border-slate-200 rounded-lg cursor-pointer"
                        id={`mob-del-${kh.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
