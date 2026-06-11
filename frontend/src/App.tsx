import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppToast, DeleteCustomerConfirmToast } from "./app/AppFeedback";
import { AppHeader } from "./app/AppHeader";
import { AppSidebar } from "./app/AppSidebar";
import { CustomerImportPage } from "./app/CustomerImportPage";
import { CustomerModalLayer } from "./app/CustomerModalLayer";
import { APP_ROUTES, getAppView } from "./app/appRoutes";
import { useAppNavigation } from "./app/useAppNavigation";
import { useCrmDashboard } from "./app/useCrmDashboard";
import CustomerList from "./components/CustomerList";
import MonthlyEvents from "./components/MonthlyEvents";

export default function App() {
  const crm = useCrmDashboard();
  const navigation = useAppNavigation();
  const location = useLocation();
  const activeView = getAppView(location.pathname);
  const shouldReduceMotion = useReducedMotion();
  const pageOffset = shouldReduceMotion ? 0 : 8;

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-900 antialiased" id="main-applet-root">
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

      <AppSidebar
        isDrawerOpen={navigation.isDrawerOpen}
        onNavigate={navigation.closeDrawer}
        onClose={navigation.closeDrawer}
      />

      <div className="min-h-screen lg:pl-64">
        <AppHeader activeView={activeView} onOpenMenu={navigation.openDrawer} />

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
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

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: pageOffset }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: shouldReduceMotion ? 0.08 : 0.2,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
              exit={{
                opacity: 0,
                y: 0,
                transition: {
                  duration: shouldReduceMotion ? 0.08 : 0.1,
                  ease: "easeOut"
                }
              }}
            >
              <Routes location={location}>
                <Route
                  path={APP_ROUTES.events}
                  element={
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
                  }
                />
                <Route
                  path={APP_ROUTES.customers}
                  element={
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
                      />
                    </section>
                  }
                />
                <Route
                  path={APP_ROUTES.import}
                  element={
                    <CustomerImportPage
                      customerImportState={crm.customerImportState}
                      onImportCustomers={crm.importCustomersFromExcel}
                    />
                  }
                />
                <Route path="/" element={<Navigate to={APP_ROUTES.events} replace />} />
                <Route path="*" element={<Navigate to={APP_ROUTES.events} replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
