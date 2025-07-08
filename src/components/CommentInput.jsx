
const CommentInput = ({ onSubmit, placeholder, submitLabel }) => {
  const [text, setText] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm" autoFocus />
      <button type="submit" className="p-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700" aria-label={submitLabel}><FiSend size={16} /></button>
    </form>
  );
}

export default CommentInput
