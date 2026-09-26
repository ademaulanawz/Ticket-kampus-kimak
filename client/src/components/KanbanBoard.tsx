import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { TicketCard } from './TicketCard';
import { Plus, CircleDashed, CheckCircle2, Clock, Inbox, PauseCircle } from 'lucide-react';

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: number, status: TicketStatus) => void;
  onOpenCreateModal: (defaultStatus?: TicketStatus) => void;
}

interface ColumnConfig {
  id: TicketStatus;
  title: string;
  icon: any;
  color: string;
  badgeBg: string;
}

const columns: ColumnConfig[] = [
  { id: 'backlog', title: 'Backlog', icon: Inbox, color: 'text-slate-500', badgeBg: 'bg-slate-100 text-slate-700' },
  { id: 'todo', title: 'To Do', icon: CircleDashed, color: 'text-blue-500', badgeBg: 'bg-blue-100 text-blue-800' },
  { id: 'pending', title: 'Pending', icon: PauseCircle, color: 'text-violet-500', badgeBg: 'bg-violet-100 text-violet-800' },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-amber-500', badgeBg: 'bg-amber-100 text-amber-800' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-800' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  onTicketClick,
  onStatusChange,
  onOpenCreateModal,
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TicketStatus) => {
    e.preventDefault();
    const ticketIdStr = e.dataTransfer.getData('text/plain');
    if (ticketIdStr) {
      const ticketId = parseInt(ticketIdStr, 10);
      if (!isNaN(ticketId)) {
        onStatusChange(ticketId, targetStatus);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 items-start">
      {columns.map((col) => {
        const colTickets = tickets.filter((t) => t.status === col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="bg-slate-100/70 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col min-h-[550px] transition-colors"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${col.color}`} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">{col.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.badgeBg}`}>
                  {colTickets.length}
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal(col.id)}
                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                title={`Add ticket to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Cards List */}
            <div className="flex-1 space-y-3">
              {colTickets.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                  <span>No tickets in {col.title}</span>
                  <button
                    onClick={() => onOpenCreateModal(col.id)}
                    className="text-indigo-600 hover:underline font-medium text-[11px]"
                  >
                    + Create one
                  </button>
                </div>
              ) : (
                colTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', ticket.id.toString());
                    }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TicketCard
                      ticket={ticket}
                      onClick={onTicketClick}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

