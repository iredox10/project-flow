import { FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi'
const NotificationModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;
  const icons = { success: <FiCheckCircle className="mx-auto text-green-500 mb-4" size={48} />, error: <FiAlertTriangle className="mx-auto text-red-500 mb-4" size={48} />, info: <FiInfo className="mx-auto text-blue-500 mb-4" size={48} /> };
  const buttonColors = { success: 'bg-green-600 hover:bg-green-700', error: 'bg-red-600 hover:bg-red-700', info: 'bg-blue-600 hover:bg-blue-700' };
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
        {icons[type]}
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-8 flex justify-center"><button onClick={onClose} className={`text-white px-8 py-2.5 rounded-lg font-semibold ${buttonColors[type]}`}>OK</button></div>
      </div>
    </div>
  );
};

export default NotificationModal
