import { FiAlertTriangle } from 'react-icons/fi'
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
        <FiAlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal
