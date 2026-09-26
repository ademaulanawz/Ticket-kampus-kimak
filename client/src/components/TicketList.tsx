import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { priorityConfig, typeConfig } from './TicketCard';
import { MessageSquare, Trash2, ExternalLink } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: number, status: TicketStatus) => void;
  onDeleteTicket: (ticketId: number) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onTicketClick,
  onStatusChange,
  onDeleteTicket,
}) => {
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500 text-sm">No tickets match your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-16">ID</th>
              <th className="py-3 px-4">Title & Details</th>
              <th className="py-3 px-4 w-28">Type</th>
              <th className="py-3 px-4 w-28">Priority</th>
              <th className="py-3 px-4 w-36">Status</th>
              <th className="py-3 px-4 w-36">Assignee</th>
              <th className="py-3 px-4 w-28">Created</th>
              <th className="py-3 px-4 w-20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {tickets.map((ticket) => {
              const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
              const type = typeConfig[ticket.type] || typeConfig.task;
              const PriorityIcon = priority.icon;

              return (
                <tr
                  key={ticket.id}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => onTicketClick(ticket)}
                >
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                    #{ticket.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {ticket.title}
                        </span>
                        {ticket.comment_count !== undefined && ticket.comment_count > 0 && (
                          <span className="flex items-center space-x-0.5 text-xs text-indigo-600">
                            <MessageSquare className="w-3 h-3" />
                            <span>{ticket.comment_count}</span>
                          </span>
                        )}
                      </div>
                      {ticket.labels && ticket.labels.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {ticket.labels.map((l, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border inline-block ${type.bg} ${type.color}`}>
                      {type.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${priority.bg} ${priority.color}`}>
                      <PriorityIcon className="w-3 h-3" />
                      {priority.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={ticket.status}
                      onChange={(e) => onStatusChange(ticket.id, e.target.value as TicketStatus)}
                      aria-label="Update ticket status"
                      className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                        {ticket.assignee ? ticket.assignee.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="text-xs text-slate-700 truncate max-w-[100px]">
                        {ticket.assignee || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onTicketClick(ticket)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="View details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTicket(ticket.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

