import { Menu } from "lucide-react";
import type { AppView } from "./useAppNavigation";

interface AppHeaderProps {
  activeView: AppView;
  onOpenMenu: () => void;
}

const viewContent: Record<AppView, { title: string; description: string }> = {
  events: {
    title: "Sự kiện chăm sóc",
    description: "Theo dõi các ngày kỷ niệm và sự kiện khách hàng quan trọng"
  },
  customers: {
    title: "Danh sách khách hàng",
    description: "Tìm kiếm, cập nhật và quản lý khách hàng tổ chức"
  },
  import: {
    title: "Import khách hàng",
    description: "Thêm nhiều khách hàng từ file Excel theo đúng cấu trúc dữ liệu"
  }
};

export function AppHeader({ activeView, onOpenMenu }: AppHeaderProps) {
  const content = viewContent[activeView];
  const systemDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 lg:hidden"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
              {content.title}
            </h1>
            <p className="hidden truncate text-[11px] font-medium text-slate-500 sm:block">
              {content.description}
            </p>
          </div>
        </div>

        <div className="hidden items-center sm:flex">
          <div className="text-right">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Thời gian hệ thống
            </span>
            <span className="mt-0.5 inline-block rounded border border-slate-200/60 bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
              {systemDate}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
