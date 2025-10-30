import { CustomOffer, Order } from "@/app/types/app";

export default function ConfirmationModal({
  isOpen,
  onCancel,
  offer,
  onConfirm,
  orders,
  message,
  isLoading,
}: {
  isOpen: boolean;
  onCancel: () => void;
  offer?: CustomOffer | null;
  onConfirm: () => void;
  orders?: Order[];
  message: string;
  isLoading?: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {isLoading ? "Canceling" : "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            {isLoading ? "Confirming" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
