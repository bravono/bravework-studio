export default function ConfirmationModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
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
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom modal for confirming deletion
// const ConfirmationModal = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   message,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   message: string;
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 animate-fade-in-down">
//       <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm relative transition-all duration-300 transform scale-95 opacity-0 animate-scale-in">
//         <div className="flex flex-col items-center justify-center space-y-4">
//           <AlertTriangle size={48} className="text-red-500" />
//           <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
//           <p className="text-center text-gray-600">{message}</p>
//           <div className="flex justify-center w-full space-x-4">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex-1"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={onConfirm}
//               className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors flex-1"
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
