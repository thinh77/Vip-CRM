/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CareEvent, ChucVu } from "../types";
import { getEventStatusText } from "../utils";
import { BellRing, Calendar, Phone, Cake, Building, ChevronLeft, ChevronRight, Plus } from "lucide-react";

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

  const isCurrentMonthView = selectedMonth === currentMonth;
  const isCareEventToday = (event: CareEvent) => event.isToday && isCurrentMonthView;
  const todayEvents = events.filter(isCareEventToday);
  const prioritizedEvents = [...events].sort((a, b) => {
    const todayPriority = Number(isCareEventToday(b)) - Number(isCareEventToday(a));
    if (todayPriority !== 0) return todayPriority;
    return a.day - b.day;
  });

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
            {isCurrentMonthView && (
              <p className="text-[11px] text-slate-400 mt-0.5">Hãy thử thêm khách hàng có ngày kỷ niệm trong tháng này.</p>
            )}
          </div>
        ) : (
          <>
            {todayEvents.length > 0 && (
              <div
                className="mb-5 rounded-xl border border-red-200 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 p-[1px] shadow-lg shadow-red-100"
                id="today-events-priority-banner"
              >
                <div className="flex flex-col gap-3 rounded-[11px] bg-white/95 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-md shadow-red-200">
                      <BellRing className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                        Ưu tiên chăm sóc
                      </p>
                      <p className="mt-0.5 text-sm font-extrabold text-slate-950">
                        Hôm nay có {todayEvents.length} sự kiện cần xử lý
                      </p>
                      <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                        Các sự kiện hôm nay đã được đưa lên đầu danh sách và đánh dấu bằng nền đỏ để nhìn thấy ngay.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-red-700">
                    HÔM NAY
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="events-grid-container">
              {prioritizedEvents.map((event) => {
                const statusText = getEventStatusText(event.daysRemaining, event.isToday, selectedMonth, currentMonth);
                const isEventToday = isCareEventToday(event);
                const isEventUpcoming = event.daysRemaining > 0 && isCurrentMonthView;

                let cardBorderClass = "border-slate-200 hover:border-slate-300 bg-slate-50/50";
                let statusBadgeClass = "bg-slate-100 text-slate-600 border-slate-200";
                let dayBadgeClass = "text-[10px] text-slate-500 font-bold tracking-wider bg-white border border-slate-200 px-2 py-0.5 rounded-md";
                let actionRowBorderClass = "border-slate-200";
                let quickActionButtonClass = "flex items-center space-x-1 text-[11px] bg-[#B01137] hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-md transition-all shadow-sm cursor-pointer";

                if (isEventToday) {
                  cardBorderClass = "relative border-red-500 ring-4 ring-red-200/80 hover:border-red-600 bg-red-50 bg-gradient-to-br from-red-50 via-white to-amber-50 shadow-lg shadow-red-100/90 overflow-hidden";
                  statusBadgeClass = "bg-red-700 text-white border-red-700 font-extrabold shadow-sm ring-2 ring-red-100";
                  dayBadgeClass = "text-[10px] text-red-700 font-extrabold tracking-wider bg-white border border-red-300 px-2.5 py-1 rounded-md shadow-sm";
                  actionRowBorderClass = "border-red-100";
                  quickActionButtonClass = "flex items-center space-x-1 text-[11px] bg-red-700 hover:bg-red-800 text-white font-extrabold px-2.5 py-1.5 rounded-md transition-all shadow-md shadow-red-100 ring-2 ring-red-100 cursor-pointer";
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
                    {isEventToday && (
                      <div className="-mx-4 -mt-4 mb-4 flex items-center gap-2 bg-gradient-to-r from-red-700 via-rose-600 to-amber-500 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                        <BellRing className="h-3.5 w-3.5 shrink-0" />
                        <span>Cần chăm sóc hôm nay</span>
                      </div>
                    )}

                    {/* Card Event Type Header */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border tracking-wide uppercase ${statusBadgeClass}`}>
                        {statusText}
                      </span>
                      <span className={dayBadgeClass}>
                        Ngày {event.day}
                      </span>
                    </div>

                    {/* Main Event Title */}
                    <div className="flex items-start space-x-3 mb-4">
                      <div className={`p-2 rounded-lg mt-0.5 shrink-0 border ${
                        isEventToday
                          ? "bg-white text-red-700 border-red-300 shadow-sm ring-2 ring-red-100"
                          : event.type === "FOUNDING"
                          ? "bg-rose-50 text-[#B01137] border-rose-100"
                          : "bg-blue-50 text-[#B01137] border-blue-100"
                      }`}>
                        {event.type === "FOUNDING" ? <Building className="w-4 h-4" /> : <Cake className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-xs uppercase tracking-wider block ${isEventToday ? "text-red-700" : "text-slate-500"}`}>
                          {event.type === "FOUNDING" ? (
                            <span>Kỷ niệm thành lập ({event.age} năm)</span>
                          ) : (
                            <span>Sinh nhật {event.vipRole} (Tuổi: {event.age})</span>
                          )}
                        </h3>
                        {event.type === "VIP_BIRTHDAY" && (
                          <p className={`font-bold text-sm mt-1 ${isEventToday ? "text-red-950" : "text-slate-800"}`}>
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
                    <div className={`mt-auto pt-3 border-t ${actionRowBorderClass} flex items-center justify-between gap-2`}>
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

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            const logDetail = event.type === "FOUNDING"
                              ? `Ghi nhận chúc mừng kỷ niệm ${event.age} năm ngày thành lập ${event.customerName}.`
                              : `Ghi nhận liên hệ chúc mừng sinh nhật ${event.vipRole} ${event.vipName} tròn ${event.age} tuổi.`;
                            onQuickInteract(event.customerId, event.type === "FOUNDING" ? "Gift" : "Call", logDetail);
                          }}
                          className={quickActionButtonClass}
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
          </>
        )}
      </div>
    </div>
  );
}
