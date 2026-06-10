import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./useCrmDashboard.ts", import.meta.url), "utf8");

test("CRM dashboard hook owns API loading and keeps App free of API clients", () => {
  assert.match(source, /import \{ customersApi \} from "\.\.\/api\/customersApi"/);
  assert.match(source, /import \{ eventsApi \} from "\.\.\/api\/eventsApi"/);
  assert.match(source, /import \{ statsApi \} from "\.\.\/api\/statsApi"/);
  assert.match(source, /customersApi\.list\(\)/);
  assert.match(source, /eventsApi\.listByMonth\(selectedMonth\)/);
  assert.match(source, /statsApi\.get\(\)/);
  assert.match(source, /Promise\.all\(\[loadCustomers\(\), loadDashboard\(\)\]\)/);
});

test("CRM dashboard hook owns customer filtering and manager options", () => {
  assert.match(source, /const \[allCustomers, setAllCustomers\] = useState<KhachHang\[\]>\(\[\]\)/);
  assert.match(source, /const \[managerFilter, setManagerFilter\] = useState\("All"\)/);
  assert.match(source, /const \[managerOptions, setManagerOptions\] = useState<string\[\]>\(\[\]\)/);
  assert.match(source, /setManagerOptions\(getManagerOptions\(list\)\)/);
  assert.match(source, /filterCustomers\(allCustomers, searchTerm, managerFilter\)/);
  assert.doesNotMatch(source, /customersApi\.list\(\{ search: searchTerm, manager: managerFilter \}\)/);
});

test("CRM dashboard hook owns modal and note-focus control flow", () => {
  assert.match(source, /const \[activeCustomerId, setActiveCustomerId\] = useState<string \| null>\(null\)/);
  assert.match(source, /const \[noteFocusCustomerId, setNoteFocusCustomerId\] = useState<string \| null>\(null\)/);
  assert.match(source, /const openCustomerDetails = useCallback\(\(customerId: string\) => \{/);
  assert.match(source, /const startCustomerNote = useCallback\(\(customerId: string\) => \{/);
  assert.match(source, /setNoteFocusCustomerId\(customerId\)/);
  assert.match(source, /clearNoteFocus/);
});

test("CRM dashboard hook owns customer and log mutations", () => {
  assert.match(source, /customersApi\.create\(formData\)/);
  assert.match(source, /customersApi\.update\(customerToEdit\.id, formData\)/);
  assert.match(source, /customersApi\.remove\(target\.id\)/);
  assert.match(source, /customersApi\.addInteraction\(customerId, interaction\)/);
  assert.match(source, /customersApi\.deleteInteraction\(customerId, interactionId\)/);
  assert.match(source, /customersApi\.addNote\(customerId, content\)/);
  assert.match(source, /customersApi\.deleteNote\(customerId, noteId\)/);
  assert.match(source, /showToast/);
});

test("CRM dashboard hook owns Excel customer import flow", () => {
  assert.match(source, /import \{[^}]*parseCustomerImportFile[^}]*\} from "\.\/customerImport"/s);
  assert.match(source, /const \[customerImportState, setCustomerImportState\]/);
  assert.match(source, /const importCustomersFromExcel = useCallback\(async \(file: File\): Promise<number> => \{/);
  assert.match(source, /setCustomerImportState\(\{ phase: "parsing", count: 0 \}\)/);
  assert.match(source, /parseCustomerImportFile\(file\)/);
  assert.match(source, /setCustomerImportState\(\{ phase: "saving", count: importedCustomers\.length \}\)/);
  assert.match(source, /customersApi\.importMany\(importedCustomers\)/);
  assert.match(source, /setCustomerImportState\(\{ phase: "refreshing", count: result\.importedCount \}\)/);
  assert.match(source, /await refreshAll\(\)/);
  assert.match(source, /return result\.importedCount/);
  assert.match(source, /showToast\(message, "error"\)/);
  assert.match(source, /throw error instanceof Error \? error : new Error\(message\)/);
  assert.doesNotMatch(source, /for \(const customer of importedCustomers\)/);
  assert.doesNotMatch(source, /customersApi\.create\(customer\)/);
  assert.match(source, /importCustomersFromExcel,/);
  assert.match(source, /customerImportState,/);
});
