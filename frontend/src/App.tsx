/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { KhachHang, Interaction } from "./types";
import { customersApi } from "./api/customersApi";
import type { CustomerPayload } from "./api/customersApi";
import { eventsApi } from "./api/eventsApi";
import { statsApi } from "./api/statsApi";
import type { CareEvent, DashboardStats } from "./types";
import { getCurrentMonth } from "./utils";
import MonthlyEvents from "./components/MonthlyEvents";
import CustomerList from "./components/CustomerList";
import CustomerForm from "./components/CustomerForm";
import CustomerDetails from "./components/CustomerDetails";
import {
  Users, Calendar, ClipboardList, Database, Sparkles, AlertCircle,
  HelpCircle, CheckCircle2, Bookmark, HeartHandshake, LogIn
} from "lucide-react";

export default function App() {
  const [customers, setCustomers] = useState<KhachHang[]>([]);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<KhachHang | undefined>(undefined);
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalCustomers: 0, monthEventsCount: 0, totalInteractions: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // App Toast Messages
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Fetch events and stats on initial load
  const loadCustomers = async () => {
    const list = await customersApi.list({ search: searchTerm, role: roleFilter });
    setCustomers(list);
    if (activeCustomerId) {
      const stillExists = list.some((customer) => customer.id === activeCustomerId);
      if (!stillExists) setActiveCustomerId(null);
    }
  };

  const loadDashboard = async () => {
    const [nextEvents, nextStats] = await Promise.all([
      eventsApi.listByMonth(selectedMonth),
      statsApi.get()
    ]);
    setEvents(nextEvents);
    setStats(nextStats);
  };

  const refreshAll = async () => {
    setLoadError(null);
    await Promise.all([loadCustomers(), loadDashboard()]);
  };

  useEffect(() => {
    setIsLoading(true);
    refreshAll()
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Không thể tải dữ liệu."))
      .finally(() => setIsLoading(false));
  }, [searchTerm, roleFilter, selectedMonth]);

  // Show auto-dismissing notifications
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // CREATE or UPDATE customer
  const handleFormSubmit = async (formData: CustomerPayload) => {
    try {
      if (customerToEdit) {
        await customersApi.update(customerToEdit.id, formData);
        showToast(`Đã cập nhật thông tin khách hàng ${formData.maKH} thành công.`);
      } else {
        await customersApi.create(formData);
        showToast(`Đã thêm mới bản ghi khách hàng ${formData.maKH} thành công.`);
      }

      await refreshAll();
      setIsFormOpen(false);
      setCustomerToEdit(undefined);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể lưu khách hàng.", "error");
    }
  };

  // DELETE customer (D in CRUD)
  const handleDeleteCustomer = async (id: string) => {
    const target = customers.find((kh) => kh.id === id);
    if (!target) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn khách hàng "${target.maKH} - ${target.tenKH}"? Hành động này không thể hoàn tác.`)) {
      try {
        await customersApi.remove(id);
        await refreshAll();
        showToast(`Đã xóa thành công bản ghi khách hàng ${target.maKH}.`, "info");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Không thể xóa khách hàng.", "error");
      }
    }
  };

  // Quick Interaction Log Shortcut from Events Panel
  const handleQuickInteraction = (
    customerId: string,
    prepopulatedType: "Call" | "Gift" | "Email",
    prepopulatedDetail: string
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];
    customersApi.addInteraction(customerId, {
      ngayThang: todayStr,
      loaiHinh: prepopulatedType,
      chiTiet: prepopulatedDetail
    })
      .then(refreshAll)
      .then(() => {
        showToast("Đã ghi nhanh nhật ký tương tác chăm sóc khách hàng ngày hôm nay.");
        setActiveCustomerId(customerId);
      })
      .catch((error) => showToast(error instanceof Error ? error.message : "Không thể ghi nhanh tương tác.", "error"));
  };

  // Interaction logs CRUD
  const handleAddInteraction = async (customerId: string, intData: Omit<Interaction, "id">) => {
    try {
      await customersApi.addInteraction(customerId, intData);
      await refreshAll();
      showToast("Thêm hoạt động tương tác mới thành công.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể thêm tương tác.", "error");
    }
  };

  const handleDeleteInteraction = async (customerId: string, interactionId: string) => {
    try {
      await customersApi.deleteInteraction(customerId, interactionId);
      await refreshAll();
      showToast("Đã xóa nhật ký hoạt động tương tác.", "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa tương tác.", "error");
    }
  };

  // Notes logs CRUD
  const handleAddNote = async (customerId: string, content: string) => {
    try {
      await customersApi.addNote(customerId, content);
      await refreshAll();
      showToast("Thêm ghi chú khách hàng thành công.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể thêm ghi chú.", "error");
    }
  };

  const handleDeleteNote = async (customerId: string, noteId: string) => {
    try {
      await customersApi.deleteNote(customerId, noteId);
      await refreshAll();
      showToast("Đã xóa ghi chú thành công.", "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa ghi chú.", "error");
    }
  };

  // Active customer finder
  const activeCustomer = customers.find((kh) => kh.id === activeCustomerId);

  // Backend-owned dashboard stats
  const totalCustomers = stats.totalCustomers;
  const monthEventsCount = stats.monthEventsCount;
  const totalInteractions = stats.totalInteractions;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans pb-16 antialiased" id="main-applet-root">

      {/* Toast Notification Box */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-xl border flex items-center space-x-3 max-w-sm animate-bounce text-sm font-semibold bg-white border-slate-200"
          id="global-alert-toast"
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          {toast.type === "info" && <Bookmark className="w-5 h-5 text-indigo-500 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
          <span className="text-slate-800">{toast.message}</span>
        </div>
      )}

      {/* Main Header navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center text-white font-extrabold text-base tracking-wider shadow-sm">
              C
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold font-sans tracking-tight text-slate-900 flex items-center gap-2">
                CRM Connect
                <span className="text-[10px] uppercase tracking-widest bg-blue-50 text-blue-700 font-extrabold border border-blue-200/50 px-1.5 py-0.5 rounded-md hidden md:inline">
                  PRO
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">
                Hệ thống Quản lý đối tác và VIP chăm sóc
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                Thời gian hệ thống
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-150 border border-slate-200/60 px-2 mt-0.5 inline-block py-0.5 rounded">
                20/05/2026 (Tháng 5)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Core Area: Container layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {loadError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {loadError}
          </div>
        )}

        {isLoading && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
            Đang tải dữ liệu CRM...
          </div>
        )}

        {/* 1. Monthly Events - First Section: "Màn hình chính vào web là thấy luôn" */}
        <section id="banner-events-this-month">
          <MonthlyEvents
            events={events}
            selectedMonth={selectedMonth}
            currentMonth={getCurrentMonth()}
            onSelectedMonthChange={setSelectedMonth}
            onSelectCustomer={(id) => {
              setActiveCustomerId(id);
              setIsFormOpen(false);
              // scroll dynamically to detail element
              setTimeout(() => {
                document.getElementById(`details-container-${id}`)?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            onQuickInteract={handleQuickInteraction}
          />
        </section>

        {/* 2. Interactive action row workspace - Handles Adding, Editing, Profiles */}
        {(isFormOpen || activeCustomerId) && (
          <section className="animate-fadeIn" id="workspace-action-panel">
            {isFormOpen ? (
              <CustomerForm
                initialData={customerToEdit}
                existingCodes={customers.map((c) => c.maKH)}
                onCancel={() => {
                  setIsFormOpen(false);
                  setCustomerToEdit(undefined);
                }}
                onSubmit={handleFormSubmit}
              />
            ) : (
              activeCustomer && (
                <CustomerDetails
                  customer={activeCustomer}
                  onClose={() => setActiveCustomerId(null)}
                  onAddInteraction={handleAddInteraction}
                  onDeleteInteraction={handleDeleteInteraction}
                  onAddNote={handleAddNote}
                  onDeleteNote={handleDeleteNote}
                />
              )
            )}
          </section>
        )}

        {/* 3. Customer Data Table & Operations list */}
        <section id="main-list-crm-panel">
          <CustomerList
            customers={customers}
            onSelectCustomer={(id) => {
              setActiveCustomerId(id);
              setIsFormOpen(false); // prioritize details profile
              setTimeout(() => {
                document.getElementById(`details-container-${id}`)?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            onEditCustomer={(kh) => {
              setCustomerToEdit(kh);
              setIsFormOpen(true);
              setActiveCustomerId(null); // maximize focus on edit form
              setTimeout(() => {
                document.getElementById("customer-form-panel")?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
            onDeleteCustomer={handleDeleteCustomer}
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            onSearchTermChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onAddNewClick={() => {
              setCustomerToEdit(undefined);
              setIsFormOpen(true);
              setActiveCustomerId(null); // maximize focus on add form
              setTimeout(() => {
                document.getElementById("customer-form-panel")?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
          />
        </section>

      </main>
    </div>
  );
}
