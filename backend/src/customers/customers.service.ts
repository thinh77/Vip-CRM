import { conflict, notFound } from "../shared/errors.js";
import type { CustomerInput, InteractionInput } from "../shared/types.js";

export type InteractionRecord = InteractionInput & {
  id: string;
};

export type NoteRecord = {
  id: string;
  ngayTao: string;
  noiDung: string;
};

export type CustomerRecord = CustomerInput & {
  id: string;
  lichSuTuongTac: InteractionRecord[];
  ghiChuList: NoteRecord[];
};

export type CustomerIdentity = {
  id: string;
};

export type CustomerListFilters = {
  search?: string;
  role?: string;
};

export type CustomersRepositoryPort = {
  findByCode(maKH: string): Promise<CustomerIdentity | null>;
  findById(id: string): Promise<CustomerRecord | CustomerIdentity | null>;
  list(filters?: CustomerListFilters): Promise<CustomerRecord[]>;
  create(input: CustomerInput): Promise<CustomerRecord>;
  update(id: string, input: CustomerInput): Promise<CustomerRecord>;
  delete(id: string): Promise<boolean>;
  createInteraction(customerId: string, input: InteractionInput): Promise<InteractionRecord>;
  deleteInteraction(customerId: string, interactionId: string): Promise<boolean>;
  createNote(customerId: string, noiDung: string): Promise<NoteRecord>;
  deleteNote(customerId: string, noteId: string): Promise<boolean>;
};

function ensureFound(customer: CustomerRecord | CustomerIdentity | null): CustomerRecord | CustomerIdentity {
  if (!customer) {
    throw notFound("Không tìm thấy khách hàng.");
  }
  return customer;
}

export function createCustomersService(repository: CustomersRepositoryPort) {
  return {
    listCustomers(filters?: CustomerListFilters): Promise<CustomerRecord[]> {
      return repository.list(filters);
    },

    async getCustomer(id: string): Promise<CustomerRecord> {
      const customer = ensureFound(await repository.findById(id));
      if (!("maKH" in customer)) {
        throw notFound("Không tìm thấy khách hàng.");
      }
      return customer;
    },

    async createCustomer(input: CustomerInput): Promise<CustomerRecord> {
      const existing = await repository.findByCode(input.maKH);
      if (existing) {
        throw conflict(`Mã khách hàng ${input.maKH} đã tồn tại.`, "maKH");
      }
      return repository.create(input);
    },

    async updateCustomer(id: string, input: CustomerInput): Promise<CustomerRecord> {
      ensureFound(await repository.findById(id));
      const existing = await repository.findByCode(input.maKH);
      if (existing && existing.id !== id) {
        throw conflict(`Mã khách hàng ${input.maKH} đã tồn tại.`, "maKH");
      }
      return repository.update(id, input);
    },

    async deleteCustomer(id: string): Promise<void> {
      const deleted = await repository.delete(id);
      if (!deleted) {
        throw notFound("Không tìm thấy khách hàng.");
      }
    },

    async addInteraction(customerId: string, input: InteractionInput): Promise<InteractionRecord> {
      ensureFound(await repository.findById(customerId));
      return repository.createInteraction(customerId, input);
    },

    async deleteInteraction(customerId: string, interactionId: string): Promise<void> {
      const deleted = await repository.deleteInteraction(customerId, interactionId);
      if (!deleted) {
        throw notFound("Không tìm thấy khách hàng.");
      }
    },

    async addNote(customerId: string, noiDung: string): Promise<NoteRecord> {
      ensureFound(await repository.findById(customerId));
      return repository.createNote(customerId, noiDung);
    },

    async deleteNote(customerId: string, noteId: string): Promise<void> {
      const deleted = await repository.deleteNote(customerId, noteId);
      if (!deleted) {
        throw notFound("Không tìm thấy khách hàng.");
      }
    }
  };
}
