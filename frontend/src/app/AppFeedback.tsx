import { AlertCircle, Bookmark, CheckCircle2 } from "lucide-react";
import type { KhachHang } from "../types";
import type { ToastMessage } from "./useCrmDashboard";

interface AppToastProps {
  toast: ToastMessage | null;
}

export function AppToast({ toast }: AppToastProps) {
  if (!toast) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-xl border flex items-center space-x-3 max-w-sm animate-bounce text-sm font-semibold bg-white border-slate-200"
      id="global-alert-toast"
    >
      {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
      {toast.type === "info" && <Bookmark className="w-5 h-5 text-indigo-500 shrink-0" />}
      {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
      <span className="text-slate-800">{toast.message}</span>
    </div>
  );
}

interface DeleteCustomerConfirmToastProps {
  customer: KhachHang | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteCustomerConfirmToast({
  customer,
  onCancel,
  onConfirm
}: DeleteCustomerConfirmToastProps) {
  if (!customer) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 w-[min(92vw,420px)] rounded-xl border border-rose-200 bg-white p-4 shadow-xl"
      id="delete-customer-confirm-toast"
      role="alertdialog"
      aria-modal="false"
      aria-label="Xác nhận xóa khách hàng"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">Xóa khách hàng?</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
            {customer.maKH} - {customer.tenKH}
          </p>
          <p className="mt-1 text-xs text-slate-500">Hành động này không thể hoàn tác.</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
              id="btn-cancel-delete-customer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-700 cursor-pointer"
              id="btn-confirm-delete-customer"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
