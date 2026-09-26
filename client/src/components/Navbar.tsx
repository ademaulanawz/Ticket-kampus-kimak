import React from 'react';
import { LayoutGrid, ListTodo, Plus, Ticket as TicketIcon, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentView: 'board' | 'list';
  onViewChange: (view: 'board' | 'list') => void;
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenCreateModal,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <TicketIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              IssueFlow
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                SQLite
              </span>
            </h1>
            <p className="text-xs text-slate-500">Issue & Ticket Tracker</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs font-medium text-slate-600">
            <button
              onClick={() => onViewChange('board')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                currentView === 'board'
                  ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                currentView === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            title="Refresh issues"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* New Ticket Action */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3.5 py-2 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Issue</span>
          </button>
        </div>
      </div>
    </header>
  );
};

