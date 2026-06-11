import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  LoaderCircle,
  UploadCloud,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "./appRoutes";
import {
  getCustomerImportLabel,
  isSupportedCustomerImportFile
} from "./customerImport";
import type { CustomerImportState } from "./customerImport";

interface CustomerImportPageProps {
  customerImportState: CustomerImportState;
  onImportCustomers: (file: File) => Promise<number>;
}

const importColumns = [
  "Mã KH",
  "Tên đơn vị",
  "Cán bộ quản lý",
  "Họ tên lãnh đạo",
  "Số điện thoại lãnh đạo",
  "Sinh nhật lãnh đạo",
  "Họ tên kế toán",
  "Số điện thoại kế toán",
  "Sinh nhật kế toán",
  "Ngày thành lập"
];

export function CustomerImportPage({
  customerImportState,
  onImportCustomers
}: CustomerImportPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const isBusy = customerImportState.phase !== "idle";

  const selectFile = (file?: File) => {
    setImportedCount(null);

    if (!file) {
      return;
    }

    if (!isSupportedCustomerImportFile(file)) {
      setSelectedFile(null);
      setInlineError("Chỉ hỗ trợ file Excel có định dạng .xlsx hoặc .xls.");
      return;
    }

    setInlineError(null);
    setSelectedFile(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isBusy) return;

    const files = event.dataTransfer.files;
    if (files.length !== 1) {
      setSelectedFile(null);
      setImportedCount(null);
      setInlineError("Vui lòng chỉ chọn một file Excel cho mỗi lần import.");
      return;
    }

    selectFile(files?.[0]);
  };

  const handleImport = async () => {
    if (!selectedFile || isBusy) return;

    setInlineError(null);
    setImportedCount(null);

    try {
      const count = await onImportCustomers(selectedFile);
      setImportedCount(count);
      setSelectedFile(null);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Không thể import khách hàng từ Excel.");
    }
  };

  const clearSelectedFile = () => {
    if (isBusy) return;
    setSelectedFile(null);
    setInlineError(null);
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]" id="customer-import-page">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-[#B01137]">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Tải file dữ liệu khách hàng</h2>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                Chọn một file Excel đúng cấu trúc để thêm nhiều khách hàng trong một lần.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isBusy}
            id="customer-import-file-input"
          />

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`rounded-xl border-2 border-dashed px-5 py-10 text-center transition-colors ${
              isBusy
                ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70"
                : "border-slate-300 bg-slate-50/70 hover:border-[#B01137] hover:bg-rose-50/30"
            }`}
          >
            <FileSpreadsheet className="mx-auto h-10 w-10 text-[#B01137]" />
            <p className="mt-4 text-sm font-extrabold text-slate-800">Kéo và thả file Excel vào đây</p>
            <p className="mt-1 text-xs font-medium text-slate-500">hoặc chọn file từ máy tính</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isBusy}
              className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:border-rose-200 hover:text-[#B01137] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Chọn file Excel
            </button>
            <p className="mt-3 text-[11px] font-semibold text-slate-400">Hỗ trợ .xlsx và .xls</p>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-700" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-emerald-950">{selectedFile.name}</p>
                  <p className="text-[11px] font-medium text-emerald-700">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelectedFile}
                disabled={isBusy}
                className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed"
                aria-label="Bỏ file đã chọn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {inlineError && (
            <div
              className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
              id="customer-import-error"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{inlineError}</span>
            </div>
          )}

          {importedCount !== null && (
            <div
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"
              id="customer-import-success"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-sm font-extrabold text-emerald-950">
                    Đã import thành công {importedCount} khách hàng.
                  </p>
                  <Link
                    to={APP_ROUTES.customers}
                    className="mt-2 text-xs font-extrabold text-emerald-800 underline underline-offset-4 hover:text-emerald-950"
                  >
                    Xem danh sách khách hàng
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isBusy && (
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>{getCustomerImportLabel(customerImportState)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedFile || isBusy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B01137] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-rose-900/15 transition-colors hover:bg-[#950f30] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {isBusy && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isBusy ? getCustomerImportLabel(customerImportState) : "Bắt đầu import"}
          </button>
        </div>
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="text-sm font-extrabold text-slate-900">Cấu trúc file Excel bắt buộc</h2>
        <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
          Dòng đầu tiên là tên cột. Hệ thống không phân biệt chữ hoa, chữ thường và tự loại bỏ khoảng trắng thừa.
        </p>

        <ol className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          {importColumns.map((column, index) => (
            <li
              key={column}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-200 text-[10px] font-extrabold text-slate-600">
                {index + 1}
              </span>
              <span className="text-xs font-bold text-slate-700">{column}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-extrabold text-amber-900">Định dạng ngày hỗ trợ</p>
          <p className="mt-1 text-xs font-medium leading-5 text-amber-800">
            Dùng DD/MM/YYYY, YYYY-MM-DD hoặc ô ngày chuẩn của Excel.
          </p>
        </div>
      </aside>
    </section>
  );
}
