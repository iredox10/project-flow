
const CommentCard = ({ comment, activeCommentId, onCardClick, addReply, deleteComment, resolveComment, onHighlightClick }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  return (
    <div id={`comment-${comment.id}`} onClick={() => onCardClick(comment.id)} className={`p-4 rounded-lg transition-all cursor-pointer ${comment.isResolved ? 'bg-gray-100 opacity-60' : 'bg-white'} ${activeCommentId === comment.id ? 'ring-2 ring-teal-500' : 'hover:bg-gray-50'}`}>
      {comment.highlightedText && (
        <blockquote onClick={() => onHighlightClick(comment.id)} className={`border-l-4 pl-3 mb-3 italic transition-colors ${comment.isResolved ? 'border-gray-300 text-gray-500' : 'border-gray-400 text-gray-600 hover:border-teal-400'}`}>
          "{comment.highlightedText}"
        </blockquote>
      )}
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-sm text-gray-700">{comment.authorName}</p>
        <div className="flex items-center gap-2">
          {!comment.isResolved && (
            <button onClick={() => resolveComment(comment.id)} className="text-gray-400 hover:text-green-500" title="Resolve Comment"><FiCheckCircle size={16} /></button>
          )}
          <button onClick={() => deleteComment(comment.id, comment.isResolved)} className="text-gray-400 hover:text-red-500" title="Delete Comment"><FiX size={16} /></button>
        </div>
      </div>
      <p className="text-gray-800">{comment.text}</p>
      {!comment.isResolved && (
        <>
          <div className="mt-3 space-y-2 pl-4 border-l-2">
            {comment.replies && comment.replies.map((reply, index) => (
              <div key={index}>
                <p className="font-semibold text-xs text-gray-600">{reply.authorName}</p>
                <p className="text-sm text-gray-700">{reply.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-2">
            {showReplyInput ? (
              <CommentInput onSubmit={(replyText) => { addReply(comment.id, replyText); setShowReplyInput(false); }} placeholder="Write a reply..." submitLabel="Send Reply" />
            ) : (
              <button onClick={() => setShowReplyInput(true)} className="text-xs font-semibold text-teal-600 hover:underline">Reply</button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CommentCard
