import type { CustomerPayload } from "../api/customersApi";
import CustomerDetails from "../components/CustomerDetails";
import CustomerForm from "../components/CustomerForm";
import type { Interaction, KhachHang } from "../types";

interface CustomerModalLayerProps {
  activeCustomer?: KhachHang;
  allCustomers: KhachHang[];
  customerToEdit?: KhachHang;
  isFormOpen: boolean;
  noteFocusCustomerId: string | null;
  onAddInteraction: (customerId: string, interaction: Omit<Interaction, "id">) => void;
  onAddNote: (customerId: string, content: string) => void;
  onCloseDetails: () => void;
  onCloseForm: () => void;
  onDeleteInteraction: (customerId: string, interactionId: string) => void;
  onDeleteNote: (customerId: string, noteId: string) => void;
  onNoteFocusHandled: () => void;
  onSubmitForm: (formData: CustomerPayload) => void;
}

export function CustomerModalLayer({
  activeCustomer,
  allCustomers,
  customerToEdit,
  isFormOpen,
  noteFocusCustomerId,
  onAddInteraction,
  onAddNote,
  onCloseDetails,
  onCloseForm,
  onDeleteInteraction,
  onDeleteNote,
  onNoteFocusHandled,
  onSubmitForm
}: CustomerModalLayerProps) {
  const existingCodes = allCustomers.map((customer) => customer.maKH);

  return (
    <>
      {isFormOpen && !customerToEdit && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/45 px-4 py-6 sm:py-8 overflow-y-auto"
          id="add-customer-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Thêm mới khách hàng"
        >
          <div className="min-h-[calc(100dvh-3rem)] sm:min-h-[calc(100dvh-4rem)] flex items-center justify-center">
            <div className="w-full max-w-5xl max-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto" id="add-customer-modal-panel">
              <CustomerForm
                existingCodes={existingCodes}
                onCancel={onCloseForm}
                onSubmit={onSubmitForm}
              />
            </div>
          </div>
        </div>
      )}

      {isFormOpen && customerToEdit && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/45 px-4 py-6 sm:py-8 overflow-y-auto"
          id="edit-customer-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Chỉnh sửa khách hàng"
        >
          <div className="min-h-[calc(100dvh-3rem)] sm:min-h-[calc(100dvh-4rem)] flex items-center justify-center">
            <div className="w-full max-w-5xl max-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto" id="edit-customer-modal-panel">
              <CustomerForm
                initialData={customerToEdit}
                existingCodes={existingCodes}
                onCancel={onCloseForm}
                onSubmit={onSubmitForm}
              />
            </div>
          </div>
        </div>
      )}

      {activeCustomer && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/45 px-4 py-6 sm:py-8 overflow-y-auto"
          id="customer-detail-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết khách hàng ${activeCustomer.tenKH}`}
        >
          <div className="min-h-[calc(100dvh-3rem)] sm:min-h-[calc(100dvh-4rem)] flex items-center justify-center">
            <div className="w-full max-w-6xl max-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto" id="customer-detail-modal-panel">
              <CustomerDetails
                customer={activeCustomer}
                onClose={onCloseDetails}
                shouldFocusNote={noteFocusCustomerId === activeCustomer.id}
                onNoteFocusHandled={onNoteFocusHandled}
                onAddInteraction={onAddInteraction}
                onDeleteInteraction={onDeleteInteraction}
                onAddNote={onAddNote}
                onDeleteNote={onDeleteNote}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
