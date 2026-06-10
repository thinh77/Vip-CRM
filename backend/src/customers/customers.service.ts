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
  maKH: string;
};

export type CustomerListFilters = {
  search?: string;
  manager?: string;
};

export type CustomersRepositoryPort = {
  findByCode(maKH: string): Promise<CustomerIdentity | null>;
  findByCodes(maKHs: string[]): Promise<CustomerIdentity[]>;
  findById(id: string): Promise<CustomerRecord | null>;
  list(filters?: CustomerListFilters): Promise<CustomerRecord[]>;
  create(input: CustomerInput): Promise<CustomerRecord>;
  createMany(inputs: CustomerInput[]): Promise<number>;
  update(id: string, input: CustomerInput): Promise<CustomerRecord>;
  delete(id: string): Promise<boolean>;
  createInteraction(customerId: string, input: InteractionInput): Promise<InteractionRecord>;
  deleteInteraction(customerId: string, interactionId: string): Promise<boolean>;
  createNote(customerId: string, noiDung: string): Promise<NoteRecord>;
  deleteNote(customerId: string, noteId: string): Promise<boolean>;
};

function ensureFound(customer: CustomerRecord | null): CustomerRecord {
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
      return ensureFound(await repository.findById(id));
    },

    async createCustomer(input: CustomerInput): Promise<CustomerRecord> {
      const existing = await repository.findByCode(input.maKH);
      if (existing) {
        throw conflict(`Mã khách hàng ${input.maKH} đã tồn tại.`, "maKH");
      }
      return repository.create(input);
    },

    async importCustomers(inputs: CustomerInput[]): Promise<{ importedCount: number }> {
      const seenCodes = new Set<string>();
      for (const input of inputs) {
        if (seenCodes.has(input.maKH)) {
          throw conflict(`Mã khách hàng ${input.maKH} bị trùng trong file Excel.`, "maKH");
        }
        seenCodes.add(input.maKH);
      }

      const existing = await repository.findByCodes(inputs.map((input) => input.maKH));
      if (existing.length > 0) {
        const existingCodes = new Set(existing.map((customer) => customer.maKH));
        const firstDuplicate = inputs.find((input) => existingCodes.has(input.maKH));
        if (firstDuplicate) {
          throw conflict(`Mã khách hàng ${firstDuplicate.maKH} đã tồn tại.`, "maKH");
        }
      }

      return { importedCount: await repository.createMany(inputs) };
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
