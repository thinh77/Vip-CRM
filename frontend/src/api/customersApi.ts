import type { Interaction, KhachHang, VIP } from "../types";
import { apiRequest } from "./client";

export type CustomerPayload = {
  maKH: string;
  tenKH: string;
  ngayThanhLap: string;
  canBoQuanLy: string;
  vips: [Omit<VIP, "id"> & { id?: string }, Omit<VIP, "id"> & { id?: string }];
};

export const customersApi = {
  list: (params: { search?: string; manager?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.manager && params.manager !== "All") query.set("manager", params.manager);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<KhachHang[]>(`/customers${suffix}`);
  },
  getById: (id: string) => apiRequest<KhachHang>(`/customers/${id}`),
  create: (payload: CustomerPayload) => apiRequest<KhachHang>("/customers", { method: "POST", body: JSON.stringify(payload) }),
  importMany: (customers: CustomerPayload[]) =>
    apiRequest<{ importedCount: number }>("/customers/import", {
      method: "POST",
      body: JSON.stringify({ customers })
    }),
  update: (id: string, payload: CustomerPayload) => apiRequest<KhachHang>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => apiRequest<void>(`/customers/${id}`, { method: "DELETE" }),
  addInteraction: (customerId: string, interaction: Omit<Interaction, "id">) =>
    apiRequest<Interaction>(`/customers/${customerId}/interactions`, { method: "POST", body: JSON.stringify(interaction) }),
  deleteInteraction: (customerId: string, interactionId: string) =>
    apiRequest<void>(`/customers/${customerId}/interactions/${interactionId}`, { method: "DELETE" }),
  addNote: (customerId: string, noiDung: string) =>
    apiRequest(`/customers/${customerId}/notes`, { method: "POST", body: JSON.stringify({ noiDung }) }),
  deleteNote: (customerId: string, noteId: string) =>
    apiRequest<void>(`/customers/${customerId}/notes/${noteId}`, { method: "DELETE" })
};
