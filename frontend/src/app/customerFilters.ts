import type { KhachHang } from "../types";

export function getManagerOptions(list: KhachHang[]): string[] {
  return Array.from(
    new Set(list.map((customer) => customer.canBoQuanLy.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "vi"));
}

function normalizeCustomerText(value: string): string {
  return value.trim().toLocaleLowerCase("vi");
}

export function filterCustomers(
  list: KhachHang[],
  searchTerm: string,
  managerFilter: string
): KhachHang[] {
  const search = normalizeCustomerText(searchTerm);
  const manager = managerFilter.trim();

  return list.filter((customer) => {
    if (manager !== "All" && customer.canBoQuanLy.trim() !== manager) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [
      customer.maKH,
      customer.tenKH,
      customer.canBoQuanLy,
      ...customer.vips.map((vip) => vip.hoTen)
    ].some((value) => normalizeCustomerText(value).includes(search));
  });
}
