import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

test("App is a thin composition shell", () => {
  assert.match(source, /import \{ useCrmDashboard \} from "\.\/app\/useCrmDashboard"/);
  assert.match(source, /import \{ useAppNavigation \} from "\.\/app\/useAppNavigation"/);
  assert.match(source, /<AppSidebar/);
  assert.match(source, /<AppHeader/);
  assert.match(source, /<AppToast toast=\{crm\.toast\} \/>/);
  assert.match(source, /<DeleteCustomerConfirmToast/);
  assert.match(source, /<CustomerModalLayer/);

  assert.doesNotMatch(source, /customersApi/);
  assert.doesNotMatch(source, /eventsApi/);
  assert.doesNotMatch(source, /statsApi/);
  assert.doesNotMatch(source, /useState|useEffect|useMemo/);
  assert.doesNotMatch(source, /function getManagerOptions|function filterCustomers/);
  assert.doesNotMatch(source, /const loadCustomers|const refreshAll|handleFormSubmit/);
});

test("App renders exactly one typed CRM view at a time", () => {
  assert.match(source, /const navigation = useAppNavigation\(\)/);
  assert.match(source, /navigation\.activeView === "events"/);
  assert.match(source, /navigation\.activeView === "customers"/);
  assert.match(source, /navigation\.activeView === "import"/);
  assert.match(source, /onSelectView=\{navigation\.selectView\}/);
  assert.match(source, /onOpenMenu=\{navigation\.openDrawer\}/);
  assert.match(source, /onClose=\{navigation\.closeDrawer\}/);
});

test("App wires monthly events to the extracted CRM controller", () => {
  assert.match(source, /events=\{crm\.events\}/);
  assert.match(source, /selectedMonth=\{crm\.selectedMonth\}/);
  assert.match(source, /currentMonth=\{crm\.currentMonth\}/);
  assert.match(source, /onSelectedMonthChange=\{crm\.setSelectedMonth\}/);
  assert.match(source, /onSelectCustomer=\{crm\.openCustomerDetails\}/);
  assert.match(source, /onStartNote=\{crm\.startCustomerNote\}/);
  assert.doesNotMatch(source, /onQuickInteract/);
});

test("App still wires customer list filters and actions to the extracted CRM controller", () => {
  const customerListBlock = source.match(/<CustomerList[\s\S]*?\/>/)?.[0] ?? "";

  assert.match(source, /customers=\{crm\.customers\}/);
  assert.match(source, /onSelectCustomer=\{crm\.openCustomerDetails\}/);
  assert.match(source, /onEditCustomer=\{crm\.openEditCustomerForm\}/);
  assert.match(source, /onDeleteCustomer=\{crm\.requestDeleteCustomer\}/);
  assert.match(source, /searchTerm=\{crm\.searchTerm\}/);
  assert.match(source, /managerFilter=\{crm\.managerFilter\}/);
  assert.match(source, /managerOptions=\{crm\.managerOptions\}/);
  assert.match(source, /onSearchTermChange=\{crm\.setSearchTerm\}/);
  assert.match(source, /onManagerFilterChange=\{crm\.setManagerFilter\}/);
  assert.match(source, /onAddNewClick=\{crm\.openAddCustomerForm\}/);
  assert.doesNotMatch(customerListBlock, /onImportCustomers=/);
  assert.doesNotMatch(customerListBlock, /customerImportState=/);
  assert.doesNotMatch(source, /roleFilter/);
  assert.doesNotMatch(source, /onRoleFilterChange/);
});

test("App wires the dedicated import page and customer-list navigation", () => {
  assert.match(source, /<CustomerImportPage/);
  assert.match(source, /customerImportState=\{crm\.customerImportState\}/);
  assert.match(source, /onImportCustomers=\{crm\.importCustomersFromExcel\}/);
  assert.match(source, /onViewCustomers=\{\(\) => navigation\.selectView\("customers"\)\}/);
});

test("App keeps loading and error display at the shell level", () => {
  assert.match(source, /\{crm\.loadError && \(/);
  assert.match(source, /\{crm\.isLoading && \(/);
  assert.match(source, /Đang tải dữ liệu CRM/);
});
