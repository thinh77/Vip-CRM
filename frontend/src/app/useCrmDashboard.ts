import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { customersApi } from "../api/customersApi";
import type { CustomerPayload } from "../api/customersApi";
import { eventsApi } from "../api/eventsApi";
import { statsApi } from "../api/statsApi";
import type { CareEvent, DashboardStats, Interaction, KhachHang } from "../types";
import { getCurrentMonth } from "../utils";
import { filterCustomers, getManagerOptions } from "./customerFilters";

export type ToastMessage = {
  message: string;
  type: "success" | "error" | "info";
};

const emptyStats: DashboardStats = {
  totalCustomers: 0,
  monthEventsCount: 0,
  totalInteractions: 0
};

export function useCrmDashboard() {
  const currentMonth = getCurrentMonth();
  const [allCustomers, setAllCustomers] = useState<KhachHang[]>([]);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<KhachHang | undefined>(undefined);
  const [pendingDeleteCustomer, setPendingDeleteCustomer] = useState<KhachHang | null>(null);
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [managerFilter, setManagerFilter] = useState("All");
  const [managerOptions, setManagerOptions] = useState<string[]>([]);
  const [noteFocusCustomerId, setNoteFocusCustomerId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const customers = useMemo(
    () => filterCustomers(allCustomers, searchTerm, managerFilter),
    [allCustomers, searchTerm, managerFilter]
  );

  const activeCustomer = useMemo(
    () => allCustomers.find((customer) => customer.id === activeCustomerId),
    [activeCustomerId, allCustomers]
  );

  const showToast = useCallback((message: string, type: ToastMessage["type"] = "success") => {
    setToast({ message, type });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const loadCustomers = useCallback(async () => {
    const list = await customersApi.list();
    setAllCustomers(list);
    setManagerOptions(getManagerOptions(list));
    setActiveCustomerId((currentId) => {
      if (!currentId) return null;
      return list.some((customer) => customer.id === currentId) ? currentId : null;
    });
  }, []);

  const loadDashboard = useCallback(async () => {
    const [nextEvents, nextStats] = await Promise.all([
      eventsApi.listByMonth(selectedMonth),
      statsApi.get()
    ]);
    setEvents(nextEvents);
    setStats(nextStats);
  }, [selectedMonth]);

  const refreshAll = useCallback(async () => {
    setLoadError(null);
    await Promise.all([loadCustomers(), loadDashboard()]);
  }, [loadCustomers, loadDashboard]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    refreshAll()
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Không thể tải dữ liệu.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshAll]);

  const closeCustomerForm = useCallback(() => {
    setIsFormOpen(false);
    setCustomerToEdit(undefined);
  }, []);

  const openAddCustomerForm = useCallback(() => {
    setCustomerToEdit(undefined);
    setIsFormOpen(true);
    setActiveCustomerId(null);
  }, []);

  const openEditCustomerForm = useCallback((customer: KhachHang) => {
    setCustomerToEdit(customer);
    setIsFormOpen(true);
    setActiveCustomerId(null);
  }, []);

  const submitCustomerForm = useCallback(async (formData: CustomerPayload) => {
    try {
      if (customerToEdit) {
        await customersApi.update(customerToEdit.id, formData);
        showToast(`Đã cập nhật thông tin khách hàng ${formData.maKH} thành công.`);
      } else {
        await customersApi.create(formData);
        showToast(`Đã thêm mới bản ghi khách hàng ${formData.maKH} thành công.`);
      }

      await refreshAll();
      closeCustomerForm();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể lưu khách hàng.", "error");
    }
  }, [closeCustomerForm, customerToEdit, refreshAll, showToast]);

  const requestDeleteCustomer = useCallback((id: string) => {
    const target = allCustomers.find((customer) => customer.id === id);
    if (!target) return;
    setPendingDeleteCustomer(target);
  }, [allCustomers]);

  const cancelDeleteCustomer = useCallback(() => {
    setPendingDeleteCustomer(null);
  }, []);

  const confirmDeleteCustomer = useCallback(async () => {
    if (!pendingDeleteCustomer) return;
    const target = pendingDeleteCustomer;
    setPendingDeleteCustomer(null);

    try {
      await customersApi.remove(target.id);
      await refreshAll();
      showToast(`Đã xóa thành công bản ghi khách hàng ${target.maKH}.`, "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa khách hàng.", "error");
    }
  }, [pendingDeleteCustomer, refreshAll, showToast]);

  const openCustomerDetails = useCallback((customerId: string) => {
    setActiveCustomerId(customerId);
    setIsFormOpen(false);
    setCustomerToEdit(undefined);
  }, []);

  const closeCustomerDetails = useCallback(() => {
    setActiveCustomerId(null);
  }, []);

  const clearNoteFocus = useCallback(() => {
    setNoteFocusCustomerId(null);
  }, []);

  const startCustomerNote = useCallback((customerId: string) => {
    setNoteFocusCustomerId(customerId);
    openCustomerDetails(customerId);
  }, [openCustomerDetails]);

  const addInteraction = useCallback(async (customerId: string, interaction: Omit<Interaction, "id">) => {
    try {
      await customersApi.addInteraction(customerId, interaction);
      await refreshAll();
      showToast("Thêm hoạt động tương tác mới thành công.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể thêm tương tác.", "error");
    }
  }, [refreshAll, showToast]);

  const deleteInteraction = useCallback(async (customerId: string, interactionId: string) => {
    try {
      await customersApi.deleteInteraction(customerId, interactionId);
      await refreshAll();
      showToast("Đã xóa nhật ký hoạt động tương tác.", "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa tương tác.", "error");
    }
  }, [refreshAll, showToast]);

  const addNote = useCallback(async (customerId: string, content: string) => {
    try {
      await customersApi.addNote(customerId, content);
      await refreshAll();
      showToast("Thêm ghi chú khách hàng thành công.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể thêm ghi chú.", "error");
    }
  }, [refreshAll, showToast]);

  const deleteNote = useCallback(async (customerId: string, noteId: string) => {
    try {
      await customersApi.deleteNote(customerId, noteId);
      await refreshAll();
      showToast("Đã xóa ghi chú thành công.", "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa ghi chú.", "error");
    }
  }, [refreshAll, showToast]);

  return {
    activeCustomer,
    activeCustomerId,
    addInteraction,
    addNote,
    allCustomers,
    cancelDeleteCustomer,
    clearNoteFocus,
    closeCustomerDetails,
    closeCustomerForm,
    confirmDeleteCustomer,
    currentMonth,
    customerToEdit,
    customers,
    deleteInteraction,
    deleteNote,
    events,
    isFormOpen,
    isLoading,
    loadError,
    managerFilter,
    managerOptions,
    noteFocusCustomerId,
    openAddCustomerForm,
    openCustomerDetails,
    openEditCustomerForm,
    pendingDeleteCustomer,
    requestDeleteCustomer,
    searchTerm,
    selectedMonth,
    setManagerFilter,
    setSearchTerm,
    setSelectedMonth,
    startCustomerNote,
    stats,
    submitCustomerForm,
    toast
  };
}
