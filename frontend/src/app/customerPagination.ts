export const CUSTOMER_PAGE_SIZE = 25;

export type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

export function getCustomerPageCount(
  totalCustomers: number,
  pageSize = CUSTOMER_PAGE_SIZE
): number {
  return Math.max(1, Math.ceil(Math.max(0, totalCustomers) / pageSize));
}

export function clampCustomerPage(
  page: number,
  totalCustomers: number,
  pageSize = CUSTOMER_PAGE_SIZE
): number {
  const normalizedPage = Number.isFinite(page) ? Math.trunc(page) : 1;
  return Math.min(Math.max(1, normalizedPage), getCustomerPageCount(totalCustomers, pageSize));
}

export function paginateCustomers<T>(
  customers: T[],
  page: number,
  pageSize = CUSTOMER_PAGE_SIZE
) {
  const currentPage = clampCustomerPage(page, customers.length, pageSize);
  const totalPages = getCustomerPageCount(customers.length, pageSize);

  if (customers.length === 0) {
    return {
      items: [] as T[],
      page: currentPage,
      totalPages,
      start: 0,
      end: 0
    };
  }

  const startIndex = (currentPage - 1) * pageSize;
  const items = customers.slice(startIndex, startIndex + pageSize);

  return {
    items,
    page: currentPage,
    totalPages,
    start: startIndex + 1,
    end: startIndex + items.length
  };
}

export function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  const safeTotalPages = Math.max(1, Math.trunc(totalPages));
  const currentPage = Math.min(Math.max(1, Math.trunc(page)), safeTotalPages);

  if (safeTotalPages <= 7) {
    return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
  }

  const windowStart = Math.max(1, Math.min(currentPage - 2, safeTotalPages - 4));
  const windowEnd = windowStart + 4;
  const items: PaginationItem[] = [];

  if (windowStart > 1) {
    items.push(1);
    if (windowStart > 2) {
      items.push("ellipsis-left");
    }
  }

  for (let pageNumber = windowStart; pageNumber <= windowEnd; pageNumber += 1) {
    items.push(pageNumber);
  }

  if (windowEnd < safeTotalPages) {
    if (windowEnd < safeTotalPages - 1) {
      items.push("ellipsis-right");
    }
    items.push(safeTotalPages);
  }

  return items;
}
