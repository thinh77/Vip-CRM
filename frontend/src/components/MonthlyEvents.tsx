/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CareEvent, ChucVu } from "../types";
import { getEventStatusText } from "../utils";
import { Calendar, Phone, Cake, Building, ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface MonthlyEventsProps {
  events: CareEvent[];
  selectedMonth: number;
  currentMonth: number;
  onSelectedMonthChange: (month: number) => void;
  onSelectCustomer: (id: string) => void;
  onQuickInteract: (customerId: string, prepopulatedType: "Call" | "Gift" | "Email", prepopulatedDetail: string) => void;
}

export default function MonthlyEvents({
  events,
  selectedMonth,
  currentMonth,
  onSelectedMonthChange,
  onSelectCustomer,
  onQuickInteract
}: MonthlyEventsProps) {
  const handlePrevMonth = () => {
    onSelectedMonthChange(selectedMonth === 1 ? 12 : selectedMonth - 1);
  };

  const handleNextMonth = () => {
    onSelectedMonthChange(selectedMonth === 12 ? 1 : selectedMonth + 1);
  };

  // Helper colors for VIP titles
  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case ChucVu.LanhDaoDonVi:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case ChucVu.KeToanTruong:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="monthly-events-panel">
      {/* Panel Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between text-slate-900">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100/50">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">
              Sự kiện ngày kỷ niệm
            </span>
            <h2 className="text-sm font-bold font-sans tracking-tight text-slate-800">
              Sự Kiện Nổi Bật Tháng {selectedMonth}
            </h2>
          </div>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200 p-0.5 rounded-lg">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
            title="Tháng trước"
            id="prev-month-btn"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold px-2 min-w-[76px] text-center text-slate-700">
            Tháng {selectedMonth}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
            title="Tháng sau"
            id="next-month-btn"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Events Body */}
      <div className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-10 px-4" id="empty-events-state">
            <p className="text-slate-400 text-xs font-medium">Không có sự kiện sinh nhật hay ngày thành lập nào trong tháng {selectedMonth}.</p>
            {selectedMonth === currentMonth && (
              <p className="text-[11px] text-slate-400 mt-0.5">Hãy thử thêm khách hàng có ngày kỷ niệm trong tháng này.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="events-grid-container">
            {events.map((event) => {
              const statusText = getEventStatusText(event.daysRemaining, event.isToday, selectedMonth, currentMonth);
              const isEventToday = event.isToday && selectedMonth === currentMonth;
              const isEventUpcoming = event.daysRemaining > 0 && selectedMonth === currentMonth;

              let cardBorderClass = "border-slate-200 hover:border-slate-300 bg-slate-50/50";
              let statusBadgeClass = "bg-slate-100 text-slate-600 border-slate-200";
              
              if (isEventToday) {
                cardBorderClass = "border-red-300 ring-2 ring-red-50 hover:border-red-400 bg-red-50/10";
                statusBadgeClass = "bg-red-50 text-red-700 border-red-200 font-semibold";
              } else if (isEventUpcoming) {
                cardBorderClass = "border-amber-200 hover:border-amber-300 bg-amber-50/10";
                statusBadgeClass = "bg-amber-50 text-amber-800 border-amber-200 font-medium";
              }

              return (
                <div 
                  key={event.id}
                  className={`flex flex-col flex-1 p-4 rounded-xl border transition-all duration-200 ${cardBorderClass}`}
                  id={`event-card-${event.id}`}
                >
                  {/* Card Event Type Header */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wide uppercase ${statusBadgeClass}`}>
                      {statusText}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold tracking-wider bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      Ngày {event.day}
                    </span>
                  </div>

                  {/* Main Event Title */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 border ${
                      event.type === "FOUNDING" 
                        ? "bg-rose-50 text-[#B01137] border-rose-100" 
                        : "bg-blue-50 text-[#B01137] border-blue-100"
                    }`}>
                      {event.type === "FOUNDING" ? <Building className="w-4 h-4" /> : <Cake className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider block">
                        {event.type === "FOUNDING" ? (
                          <span>Kỷ niệm thành lập ({event.age} năm)</span>
                        ) : (
                          <span>Sinh nhật {event.vipRole} (Tuổi: {event.age})</span>
                        )}
                      </h3>
                      {event.type === "VIP_BIRTHDAY" && (
                        <p className="font-bold text-sm text-slate-800 mt-1">
                          {event.vipName}
                        </p>
                      )}
                      <button
                        onClick={() => onSelectCustomer(event.customerId)}
                        className="text-xs text-slate-500 hover:text-blue-600 text-left hover:underline mt-1 font-medium block"
                      >
                        {event.customerName}
                      </button>
                    </div>
                  </div>

                  {/* Action row at bottom of event card */}
                  <div className="mt-auto pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    {event.type === "VIP_BIRTHDAY" && event.vipPhone ? (
                      <a 
                        href={`tel:${event.vipPhone}`}
                        className="flex items-center space-x-1 px-2 py-1 border border-slate-200 rounded-md text-[11px] font-mono font-semibold text-slate-600 hover:text-dark hover:border-slate-300 hover:bg-white transition-all"
                        title={`Gọi cho ${event.vipName}`}
                        id={`call-vip-btn-${event.id}`}
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{event.vipPhone}</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Doanh nghiệp</span>
                    )}

                    <div className="flex items-center space-x-1.55">
                      <button
                        onClick={() => {
                          const logDetail = event.type === "FOUNDING"
                            ? `Ghi nhận chúc mừng kỷ niệm ${event.age} năm ngày thành lập ${event.customerName}.`
                            : `Ghi nhận liên hệ chúc mừng sinh nhật ${event.vipRole} ${event.vipName} tròn ${event.age} tuổi.`;
                          onQuickInteract(event.customerId, event.type === "FOUNDING" ? "Gift" : "Call", logDetail);
                        }}
                        className="flex items-center space-x-1 text-[11px] bg-[#B01137] hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-md transition-all shadow-sm cursor-pointer"
                        title="Ghi nhận tương tác chăm sóc khách hàng"
                        id={`quick-interact-btn-${event.id}`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Ghi nhanh</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
