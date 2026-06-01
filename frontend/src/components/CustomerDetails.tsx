/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { KhachHang, Interaction, GhiChu, ChucVu } from "../types";
import { formatDateVN, getCurrentMonth } from "../utils";
import { 
  X, Phone, MessageSquare, Plus, Trash2, Calendar, ClipboardList, 
  User, Mail, ArrowRight, BookOpen, Clock, Tag 
} from "lucide-react";

interface CustomerDetailsProps {
  customer: KhachHang;
  onClose: () => void;
  shouldFocusNote?: boolean;
  onNoteFocusHandled?: () => void;
  onAddInteraction: (customerId: string, interaction: Omit<Interaction, "id">) => void;
  onDeleteInteraction: (customerId: string, interactionId: string) => void;
  onAddNote: (customerId: string, content: string) => void;
  onDeleteNote: (customerId: string, noteId: string) => void;
}

export default function CustomerDetails({
  customer,
  onClose,
  shouldFocusNote = false,
  onNoteFocusHandled,
  onAddInteraction,
  onDeleteInteraction,
  onAddNote,
  onDeleteNote
}: CustomerDetailsProps) {
  // Interaction form state
  const [intDate, setIntDate] = useState(new Date().toISOString().split("T")[0]);
  const [intType, setIntType] = useState<Interaction["loaiHinh"]>("Call");
  const [intDetails, setIntDetails] = useState("");
  
  // Notes form state
  const [newNoteText, setNewNoteText] = useState("");
  const noteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shouldFocusNote) return;

    noteInputRef.current?.focus();
    noteInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    onNoteFocusHandled?.();
  }, [shouldFocusNote, onNoteFocusHandled, customer.id]);

  const handleAddInteractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intDetails.trim()) return;
    onAddInteraction(customer.id, {
      ngayThang: intDate,
      loaiHinh: intType,
      chiTiet: intDetails.trim()
    });
    setIntDetails("");
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(customer.id, newNoteText.trim());
    setNewNoteText("");
  };

  const getRoleColor = (role: ChucVu) => {
    switch (role) {
      case ChucVu.LanhDaoDonVi:
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", prefix: "💼" };
      case ChucVu.KeToanTruong:
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", prefix: "📊" };
    }
  };

  const getLogIcon = (type: Interaction["loaiHinh"]) => {
    switch (type) {
      case "Call":
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case "Meeting":
        return <User className="w-4 h-4 text-indigo-600" />;
      case "Email":
        return <Mail className="w-4 h-4 text-sky-600" />;
      case "Gift":
        return <Tag className="w-4 h-4 text-amber-600" />;
      default:
        return <ClipboardList className="w-4 h-4 text-slate-600" />;
    }
  };

  const getLogTypeLabel = (type: Interaction["loaiHinh"]) => {
    switch (type) {
      case "Call": return "Điện thoại";
      case "Meeting": return "Hợp tác / Gặp mặt";
      case "Email": return "Thư điện tử";
      case "Gift": return "Quà / Khuyến mãi";
      default: return "Hoạt động chăm sóc";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden" id={`details-container-${customer.id}`}>
      {/* Detail Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-50 border border-blue-200/50 text-[10px] text-blue-700 font-extrabold px-1.5 py-0.5 rounded-md font-mono tracking-widest uppercase">
              {customer.maKH}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold font-mono">
              Kỷ niệm TL: {formatDateVN(customer.ngayThanhLap)}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold font-sans mt-1 tracking-tight text-slate-800">
            {customer.tenKH}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          title="Đóng chi tiết"
          id="btn-close-details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: VIP list & notes */}
        <div className="lg:col-span-1 space-y-6" id="left-sec-vip-notes">
          {/* 2 VIP Profiles */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150 pb-2">
              Chân dung 2 VIP liên hệ
            </h3>

            {customer.vips.map((vip, idx) => {
              const styles = getRoleColor(vip.chucVu);
              return (
                <div 
                  key={vip.id || idx}
                  className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col hover:border-slate-300 transition-all"
                  id={`vip-subcard-${idx}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${styles?.bg}`}>
                      {styles?.prefix} {vip.chucVu}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{vip.hoTen}</h4>
                  <div className="text-[11px] text-slate-500 mt-1 space-y-1">
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Ngày sinh: <span className="font-semibold text-slate-705 font-mono">{formatDateVN(vip.ngaySinh)}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Điện thoại:{" "}
                      <a href={`tel:${vip.soDienThoai}`} className="text-blue-600 hover:underline font-semibold font-mono">
                        {vip.soDienThoai}
                      </a>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Customer Unstructured Notes */}
          <div className="bg-slate-50/30 rounded-xl p-4 border border-slate-200 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center justify-between">
              <span>Ghi chú nội bộ</span>
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            </h3>

            {/* Note Entry form */}
            <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
              <input
                ref={noteInputRef}
                type="text"
                placeholder="Nhập ghi chú mới..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 focus:border-blue-500"
                id="input-new-note"
              />
              <button
                type="submit"
                className="bg-[#B01137] text-white rounded-lg p-2 hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
                title="Lưu ghi chú"
                id="btn-add-note"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1" id="notes-list-box">
              {customer.ghiChuList.length === 0 ? (
                <p className="text-slate-400 text-xs italic py-2 text-center">Chưa có ghi chú nội bộ.</p>
              ) : (
                customer.ghiChuList.map((note) => (
                  <div 
                    key={note.id} 
                    className="p-3 bg-white border border-slate-200 rounded-lg text-xs hover:border-slate-300 transition-all flex justify-between items-start gap-2"
                    id={`note-row-${note.id}`}
                  >
                    <div className="flex-1">
                      <p className="text-slate-700 leading-snug break-words whitespace-pre-wrap">{note.noiDung}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                        {formatDateVN(note.ngayTao)}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteNote(customer.id, note.id)}
                      className="text-slate-400 hover:text-red-650 p-0.5 rounded transition-colors cursor-pointer"
                      title="Xóa ghi chú"
                      id={`delete-note-btn-${note.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Interactive Logs Timeline */}
        <div className="lg:col-span-2 space-y-6 flex flex-col" id="right-sec-interaction-logs">
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center justify-between">
              <span>Lịch sử tương tác & chăm sóc</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </h3>

            {/* Add interaction timeline record form */}
            <form onSubmit={handleAddInteractionSubmit} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 mt-4 space-y-3">
              <span className="text-[11px] font-bold text-slate-650 uppercase tracking-wider block">
                Ghi nhận hoạt động chăm sóc mới:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">Loại hình</label>
                  <select
                    value={intType}
                    onChange={(e) => setIntType(e.target.value as Interaction["loaiHinh"])}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-105"
                    id="select-interaction-type"
                  >
                    <option value="Call">📞 Gọi điện</option>
                    <option value="Meeting">🤝 Gặp mặt trực tiếp</option>
                    <option value="Email">📧 Thư điện tử</option>
                    <option value="Gift">🎁 Gửi quà / Khen thưởng</option>
                    <option value="Other">💼 Hoạt động khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">Ngày diễn ra</label>
                  <input
                    type="date"
                    value={intDate}
                    onChange={(e) => setIntDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 font-mono"
                    required
                    id="input-interaction-date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">Mô tả chi tiết nội dung tương tác</label>
                <textarea
                  value={intDetails}
                  onChange={(e) => setIntDetails(e.target.value)}
                  placeholder="Nhập ghi nhận chi tiết, phản hồi của giám đốc/hiệu trưởng, quà tặng gì..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 min-h-[60px]"
                  required
                  id="textarea-interaction-detail"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#B01137] border border-transparent hover:bg-blue-700 text-white rounded-lg px-4 py-1.5 text-xs font-bold flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
                  id="btn-submit-interaction"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lưu hoạt động</span>
                </button>
              </div>
            </form>
          </div>

          {/* Interactive Timeline Display */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 flex-1" id="interaction-timeline-box">
            {customer.lichSuTuongTac.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl" id="empty-timeline-state">
                <p className="text-slate-400 text-xs italic font-medium">Chưa có lịch sử tương tác chăm sóc nào cho khách hàng này.</p>
                <p className="text-[11px] text-slate-400 mt-1">Ghi nhận thông tin cuộc gọi hoặc gửi quà của bạn bằng biểu mẫu trên.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 pl-4 ml-3 py-2 space-y-4">
                {customer.lichSuTuongTac
                  .slice()
                  .sort((a, b) => b.ngayThang.localeCompare(a.ngayThang)) // Show latest interactions first
                  .map((log) => (
                    <div key={log.id} className="relative group" id={`interaction-timeline-row-${log.id}`}>
                      {/* Timeline Dot Indicator */}
                      <span className="absolute -left-[24px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-slate-100 shadow-sm transition-colors group-hover:bg-slate-250">
                        {getLogIcon(log.loaiHinh)}
                      </span>

                      <div className="bg-white border border-slate-200 p-3.5 rounded-xl hover:border-slate-300 shadow-xs relative pr-10">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-800">
                            {getLogTypeLabel(log.loaiHinh)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold font-mono">
                            {formatDateVN(log.ngayThang)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-650 leading-relaxed font-normal whitespace-pre-wrap break-words">
                          {log.chiTiet}
                        </p>

                        {/* Inline Delete Button for history log */}
                        <button
                          onClick={() => onDeleteInteraction(customer.id, log.id)}
                          className="absolute right-3 top-3.5 text-slate-300 hover:text-red-650 transition-colors p-1 rounded hover:bg-slate-50 opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Xóa dòng tương tác"
                          id={`delete-interaction-btn-${log.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
