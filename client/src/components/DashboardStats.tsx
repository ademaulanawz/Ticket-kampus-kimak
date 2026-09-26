import React from 'react';
import { TicketStats } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

interface DashboardStatsProps {
  stats: TicketStats | null;
  onFilterClick?: (type: 'all' | 'open' | 'urgent' | 'done') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onFilterClick }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Tickets',
      value: stats.total,
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      filterKey: 'all' as const,
      subtext: `${stats.open} active`,
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      filterKey: 'open' as const,
      subtext: 'Currently being tackled',
    },
    {
      label: 'Urgent Attention',
      value: stats.urgent,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      filterKey: 'urgent' as const,
      subtext: 'High priority backlog',
    },
    {
      label: 'Resolved / Done',
      value: stats.done,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      filterKey: 'done' as const,
      subtext: `${stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}% completion`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onFilterClick && onFilterClick(card.filterKey)}
            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg border ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {card.value}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

