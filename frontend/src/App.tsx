import { AppHeader } from "./app/AppHeader";
import { AppToast, DeleteCustomerConfirmToast } from "./app/AppFeedback";
import { CustomerModalLayer } from "./app/CustomerModalLayer";
import { useCrmDashboard } from "./app/useCrmDashboard";
import CustomerList from "./components/CustomerList";
import MonthlyEvents from "./components/MonthlyEvents";

export default function App() {
  const crm = useCrmDashboard();

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans pb-16 antialiased" id="main-applet-root">
      <AppToast toast={crm.toast} />
      <DeleteCustomerConfirmToast
        customer={crm.pendingDeleteCustomer}
        onCancel={crm.cancelDeleteCustomer}
        onConfirm={crm.confirmDeleteCustomer}
      />
      <CustomerModalLayer
        activeCustomer={crm.activeCustomer}
        allCustomers={crm.allCustomers}
        customerToEdit={crm.customerToEdit}
        isFormOpen={crm.isFormOpen}
        noteFocusCustomerId={crm.noteFocusCustomerId}
        onAddInteraction={crm.addInteraction}
        onAddNote={crm.addNote}
        onCloseDetails={crm.closeCustomerDetails}
        onCloseForm={crm.closeCustomerForm}
        onDeleteInteraction={crm.deleteInteraction}
        onDeleteNote={crm.deleteNote}
        onNoteFocusHandled={crm.clearNoteFocus}
        onSubmitForm={crm.submitCustomerForm}
      />

      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {crm.loadError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {crm.loadError}
          </div>
        )}

        {crm.isLoading && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
            Đang tải dữ liệu CRM...
          </div>
        )}

        <section id="banner-events-this-month">
          <MonthlyEvents
            events={crm.events}
            selectedMonth={crm.selectedMonth}
            currentMonth={crm.currentMonth}
            onSelectedMonthChange={crm.setSelectedMonth}
            onSelectCustomer={crm.openCustomerDetails}
            onStartNote={crm.startCustomerNote}
          />
        </section>

        <section id="main-list-crm-panel">
          <CustomerList
            customers={crm.customers}
            onSelectCustomer={crm.openCustomerDetails}
            onEditCustomer={crm.openEditCustomerForm}
            onDeleteCustomer={crm.requestDeleteCustomer}
            searchTerm={crm.searchTerm}
            managerFilter={crm.managerFilter}
            managerOptions={crm.managerOptions}
            onSearchTermChange={crm.setSearchTerm}
            onManagerFilterChange={crm.setManagerFilter}
            onAddNewClick={crm.openAddCustomerForm}
            onImportCustomers={crm.importCustomersFromExcel}
            isImportingCustomers={crm.isImportingCustomers}
          />
        </section>
      </main>
    </div>
  );
}
