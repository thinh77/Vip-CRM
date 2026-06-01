export function AppHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-[#B01137] flex items-center justify-center text-white font-extrabold text-base tracking-wider shadow-sm">
            A
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-sans tracking-tight text-slate-900 flex items-center gap-2">
              CRM Connect
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wide">
              Hệ thống Quản lý chăm sóc khách hàng tổ chức
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
  );
}
