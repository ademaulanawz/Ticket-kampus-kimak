import React, { useState, useEffect } from 'react';
import { Ticket, TicketDetail, TicketPriority, TicketStatus } from '../types';
import { fetchTicketById, updateTicket, addComment, deleteTicket } from '../api';
import { typeConfig } from './TicketCard';
import { X, Send, Trash2, Calendar, User, Clock } from 'lucide-react';

interface TicketDetailModalProps {
  ticketId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: (ticket: Ticket) => void;
  onTicketDeleted: (ticketId: number) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticketId,
  isOpen,
  onClose,
  onTicketUpdated,
  onTicketDeleted,
}) => {
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load ticket details when modal opens
  useEffect(() => {
    if (isOpen && ticketId) {
      loadTicket();
    } else {
      setDetail(null);
    }
  }, [isOpen, ticketId]);

  const loadTicket = async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTicketById(ticketId);
      setDetail(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldUpdate = async (field: keyof Ticket, value: any) => {
    if (!detail) return;
    try {
      const updated = await updateTicket(detail.id, { [field]: value });
      setDetail({ ...detail, ...updated });
      onTicketUpdated(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !commentContent.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await addComment(
        detail.id,
        commentAuthor.trim() || 'Anonymous',
        commentContent.trim()
      );
      setDetail({
        ...detail,
        comments: [...detail.comments, newComment],
        comment_count: (detail.comment_count || 0) + 1,
      });
      setCommentContent('');
      onTicketUpdated({
        ...detail,
        comment_count: (detail.comment_count || 0) + 1,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (window.confirm(`Are you sure you want to delete ticket #${detail.id}?`)) {
      try {
        await deleteTicket(detail.id);
        onTicketDeleted(detail.id);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to delete ticket');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-slate-400 font-bold">
              #{detail ? detail.id : ticketId}
            </span>
            {detail && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${typeConfig[detail.type]?.bg} ${typeConfig[detail.type]?.color}`}>
                {typeConfig[detail.type]?.label}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {detail && (
              <button
                onClick={handleDelete}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete ticket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Clock className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
            <span>Loading ticket details...</span>
          </div>
        ) : error && !detail ? (
          <div className="p-6 text-center text-rose-600 text-sm">
            <p>{error}</p>
          </div>
        ) : detail ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-snug">
                {detail.title}
              </h1>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                <span>Created {new Date(detail.created_at).toLocaleString()}</span>
                <span>•</span>
                <span>Updated {new Date(detail.updated_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Status & Priority Control Pills */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</span>
                <select
                  value={detail.status}
                  onChange={(e) => handleFieldUpdate('status', e.target.value as TicketStatus)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Priority</span>
                <select
                  value={detail.priority}
                  onChange={(e) => handleFieldUpdate('priority', e.target.value as TicketPriority)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assignee</span>
                <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={detail.assignee}
                    onChange={(e) => setDetail({ ...detail, assignee: e.target.value })}
                    onBlur={() => handleFieldUpdate('assignee', detail.assignee || 'Unassigned')}
                    className="w-full text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Due Date</span>
                <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    value={detail.due_date ? detail.due_date.split('T')[0] : ''}
                    onChange={(e) => handleFieldUpdate('due_date', e.target.value || null)}
                    className="w-full text-xs text-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {detail.description || <span className="italic text-slate-400">No description provided.</span>}
              </div>
            </div>

            {/* Labels */}
            {detail.labels && detail.labels.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Labels</h3>
                <div className="flex flex-wrap gap-1.5">
                  {detail.labels.map((l, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold text-xs"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Thread */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Discussion ({detail.comments ? detail.comments.length : 0})</span>
              </h3>

              {/* Comment list */}
              <div className="space-y-3 mb-5">
                {detail.comments && detail.comments.length > 0 ? (
                  detail.comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold flex items-center justify-center text-[10px]">
                            {comment.author.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">{comment.author}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-6">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation below.</p>
                )}
              </div>

              {/* Add Comment Box */}
              <form onSubmit={handleAddComment} className="space-y-2 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Alex, Galang)"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Write a comment or status update..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !commentContent.trim()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSubmittingComment ? 'Sending...' : 'Post Comment'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

