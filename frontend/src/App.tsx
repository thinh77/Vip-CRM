/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { KhachHang, VIP, Interaction, GhiChu } from "./types";
import { initialCustomers } from "./initialData";
import { getCurrentMonth, getCareEventsInMonth } from "./utils";
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
  
  // App Toast Messages
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Load from local storage on render
  useEffect(() => {
    const stored = localStorage.getItem("crm_customers");
    if (stored) {
      try {
        setCustomers(JSON.parse(stored));
      } catch (e) {
        console.error("Lỗi phân tích cú pháp dữ liệu cũ, tải lại dữ liệu mẫu.");
        setCustomers(initialCustomers);
        localStorage.setItem("crm_customers", JSON.stringify(initialCustomers));
      }
    } else {
      setCustomers(initialCustomers);
      localStorage.setItem("crm_customers", JSON.stringify(initialCustomers));
    }
  }, []);

  // Show auto-dismissing notifications
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Helper to persist state
  const saveAndSync = (newCustomers: KhachHang[]) => {
    setCustomers(newCustomers);
    localStorage.setItem("crm_customers", JSON.stringify(newCustomers));
  };

  // CREATE or UPDATE customer
  const handleFormSubmit = (formData: {
    maKH: string;
    tenKH: string;
    ngayThanhLap: string;
    vips: [Omit<VIP, 'id'> & { id?: string }, Omit<VIP, 'id'> & { id?: string }];
  }) => {
    if (customerToEdit) {
      // UPDATE Operation (U in CRUD)
      const updatedList = customers.map((kh) => {
        if (kh.id === customerToEdit.id) {
          // preserve interactions list & notes
          return {
            ...kh,
            maKH: formData.maKH,
            tenKH: formData.tenKH,
            ngayThanhLap: formData.ngayThanhLap,
            vips: [
              {
                id: formData.vips[0].id || `vip_1_${Date.now()}`,
                hoTen: formData.vips[0].hoTen,
                chucVu: formData.vips[0].chucVu,
                ngaySinh: formData.vips[0].ngaySinh,
                soDienThoai: formData.vips[0].soDienThoai
              },
              {
                id: formData.vips[1].id || `vip_2_${Date.now()}`,
                hoTen: formData.vips[1].hoTen,
                chucVu: formData.vips[1].chucVu,
                ngaySinh: formData.vips[1].ngaySinh,
                soDienThoai: formData.vips[1].soDienThoai
              }
            ] as [VIP, VIP]
          };
        }
        return kh;
      });
      saveAndSync(updatedList);
      showToast(`Đã cập nhật thông tin khách hàng ${formData.maKH} thành công.`);
    } else {
      // CREATE Operation (C in CRUD)
      const newCustomer: KhachHang = {
        id: `cust_${Date.now()}`,
        maKH: formData.maKH,
        tenKH: formData.tenKH,
        ngayThanhLap: formData.ngayThanhLap,
        vips: [
          {
            id: `vip_${Date.now()}_1`,
            hoTen: formData.vips[0].hoTen,
            chucVu: formData.vips[0].chucVu,
            ngaySinh: formData.vips[0].ngaySinh,
            soDienThoai: formData.vips[0].soDienThoai
          },
          {
            id: `vip_${Date.now()}_2`,
            hoTen: formData.vips[1].hoTen,
            chucVu: formData.vips[1].chucVu,
            ngaySinh: formData.vips[1].ngaySinh,
            soDienThoai: formData.vips[1].soDienThoai
          }
        ] as [VIP, VIP],
        lichSuTuongTac: [],
        ghiChuList: []
      };
      const updatedList = [...customers, newCustomer];
      saveAndSync(updatedList);
      showToast(`Đã thêm mới bản ghi khách hàng ${formData.maKH} thành công.`);
    }

    setIsFormOpen(false);
    setCustomerToEdit(undefined);
  };

  // DELETE customer (D in CRUD)
  const handleDeleteCustomer = (id: string) => {
    const target = customers.find((kh) => kh.id === id);
    if (!target) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn khách hàng "${target.maKH} - ${target.tenKH}"? Hành động này không thể hoàn tác.`)) {
      const updatedList = customers.filter((kh) => kh.id !== id);
      saveAndSync(updatedList);
      showToast(`Đã xóa thành công bản ghi khách hàng ${target.maKH}.`, "info");
      
      if (activeCustomerId === id) {
        setActiveCustomerId(null);
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
    const newInt: Interaction = {
      id: `int_${Date.now()}`,
      ngayThang: todayStr,
      loaiHinh: prepopulatedType,
      chiTiet: prepopulatedDetail
    };

    const updatedList = customers.map((kh) => {
      if (kh.id === customerId) {
        return {
          ...kh,
          lichSuTuongTac: [newInt, ...kh.lichSuTuongTac]
        };
      }
      return kh;
    });

    saveAndSync(updatedList);
    showToast(`Đã ghi nhanh nhật ký tương tác chăm sóc khách hàng ngày hôm nay.`);
    setActiveCustomerId(customerId); // switch preview to this client
  };

  // Interaction logs CRUD
  const handleAddInteraction = (customerId: string, intData: Omit<Interaction, "id">) => {
    const newInt: Interaction = {
      id: `int_${Date.now()}`,
      ...intData
    };
    const updatedList = customers.map((kh) => {
      if (kh.id === customerId) {
        return {
          ...kh,
          lichSuTuongTac: [newInt, ...kh.lichSuTuongTac]
        };
      }
      return kh;
    });
    saveAndSync(updatedList);
    showToast("Thêm hoạt động tương tác mới thành công.");
  };

  const handleDeleteInteraction = (customerId: string, interactionId: string) => {
    const updatedList = customers.map((kh) => {
      if (kh.id === customerId) {
        return {
          ...kh,
          lichSuTuongTac: kh.lichSuTuongTac.filter((i) => i.id !== interactionId)
        };
      }
      return kh;
    });
    saveAndSync(updatedList);
    showToast("Đã xóa nhật ký hoạt động tương tác.", "info");
  };

  // Notes logs CRUD
  const handleAddNote = (customerId: string, content: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newNote: GhiChu = {
      id: `note_${Date.now()}`,
      ngayTao: todayStr,
      noiDung: content
    };
    const updatedList = customers.map((kh) => {
      if (kh.id === customerId) {
        return {
          ...kh,
          ghiChuList: [newNote, ...kh.ghiChuList]
        };
      }
      return kh;
    });
    saveAndSync(updatedList);
    showToast("Thêm ghi chú khách hàng thành công.");
  };

  const handleDeleteNote = (customerId: string, noteId: string) => {
    const updatedList = customers.map((kh) => {
      if (kh.id === customerId) {
        return {
          ...kh,
          ghiChuList: kh.ghiChuList.filter((n) => n.id !== noteId)
        };
      }
      return kh;
    });
    saveAndSync(updatedList);
    showToast("Đã xóa ghi chú thành công.", "info");
  };

  // Active customer finder
  const activeCustomer = customers.find((kh) => kh.id === activeCustomerId);

  // Compute stats for overview widget
  const totalCustomers = customers.length;
  const currentMonthNum = getCurrentMonth();
  const monthEventsCount = getCareEventsInMonth(customers, currentMonthNum).length;
  const totalInteractions = customers.reduce((sum, kh) => sum + kh.lichSuTuongTac.length, 0);

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
        
        {/* 1. Monthly Events - First Section: "Màn hình chính vào web là thấy luôn" */}
        <section id="banner-events-this-month">
          <MonthlyEvents 
            customers={customers}
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
