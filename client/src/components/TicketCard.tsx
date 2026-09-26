import React from 'react';
import { Ticket, TicketPriority, TicketType } from '../types';
import { MessageSquare, Calendar, AlertCircle, CheckCircle2, Bookmark, Flame } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
  onStatusChange?: (ticketId: number, newStatus: Ticket['status']) => void;
}

export const priorityConfig: Record<TicketPriority, { label: string; color: string; bg: string; icon: any }> = {
  urgent: { label: 'Urgent', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: Flame },
  high: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: AlertCircle },
  medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: AlertCircle },
  low: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', icon: CheckCircle2 },
};

export const typeConfig: Record<TicketType, { label: string; color: string; bg: string }> = {
  bug: { label: 'Bug', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  feature: { label: 'Feature', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  task: { label: 'Task', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  improvement: { label: 'Improvement', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
  const type = typeConfig[ticket.type] || typeConfig.task;
  const PriorityIcon = priority.icon;

  return (
    <div
      onClick={() => onClick(ticket)}
      className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between select-none"
    >
      <div>
        {/* Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${type.bg} ${type.color}`}>
              {type.label}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${priority.bg} ${priority.color}`}>
              <PriorityIcon className="w-3 h-3" />
              {priority.label}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            #{ticket.id}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-1.5">
          {ticket.title}
        </h4>

        {/* Description snippet */}
        {ticket.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {ticket.description}
          </p>
        )}

        {/* Labels / Tags */}
        {ticket.labels && ticket.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {ticket.labels.map((label, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-0.5"
              >
                <Bookmark className="w-2.5 h-2.5 text-slate-400" />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          {/* Avatar */}
          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
            {ticket.assignee ? ticket.assignee.charAt(0).toUpperCase() : '?'}
          </div>
          <span className="truncate max-w-[100px] text-xs font-medium text-slate-700">
            {ticket.assignee || 'Unassigned'}
          </span>
        </div>

        <div className="flex items-center space-x-2.5 text-slate-400">
          {ticket.due_date && (
            <span className="flex items-center space-x-1 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{new Date(ticket.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </span>
          )}
          {ticket.comment_count !== undefined && ticket.comment_count > 0 && (
            <span className="flex items-center space-x-1 text-[11px] text-indigo-600 font-medium">
              <MessageSquare className="w-3 h-3" />
              <span>{ticket.comment_count}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

