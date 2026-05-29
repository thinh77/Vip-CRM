import { buildCareEvents } from "../events/events.service.js";
import type { CustomerRecord } from "../customers/customers.service.js";

export function buildStats(customers: CustomerRecord[], now = new Date()) {
    return {
        totalCustomers: customers.length,
        monthEventsCount: buildCareEvents(customers, now.getMonth() + 1, now).length,
        totalInteractions: customers.reduce((sum, customer) => sum + customer.lichSuTuongTac.length, 0)
    };
}