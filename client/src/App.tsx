import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Ticket, TicketStats, FilterOptions, TicketStatus } from './types';
import { fetchTickets, fetchStats, updateTicket, createTicket, deleteTicket } from './api';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { TicketList } from './components/TicketList';
import { TicketCreateModal } from './components/TicketCreateModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [currentView, setCurrentView] = useState<'board' | 'list'>('board');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TicketStatus>('todo');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    priority: 'all',
    type: 'all',
    assignee: 'all',
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    setError(null);

    try {
      const [ticketsData, statsData] = await Promise.all([
        fetchTickets(filters),
        fetchStats(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to ticketing server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract unique assignees for filter dropdown
  const uniqueAssignees = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.assignee && t.assignee !== 'Unassigned') {
        set.add(t.assignee);
      }
    });
    return Array.from(set).sort();
  }, [tickets]);

  // Handlers
  const handleStatusChange = async (ticketId: number, newStatus: TicketStatus) => {
    // Optimistic UI update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTicket(ticketId, { status: newStatus });
      // Refresh stats in background
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to update ticket status', err);
      // Rollback on error
      loadData(true);
    }
  };

  const handleOpenCreateModal = (defaultStatus: TicketStatus = 'todo') => {
    setCreateDefaultStatus(defaultStatus);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (ticketData: Omit<Partial<Ticket>, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await createTicket(ticketData);
    setTickets((prev) => [created, ...prev]);
    const newStats = await fetchStats();
    setStats(newStats);
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setIsDetailModalOpen(true);
  };

  const handleTicketUpdated = (updatedTicket: Ticket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
    );
    fetchStats().then(setStats).catch(console.error);
  };

  const handleDeleteTicket = async (ticketId: number) => {
    try {
      await deleteTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to delete ticket', err);
    }
  };

  const handleStatsFilterClick = (type: 'all' | 'open' | 'urgent' | 'done') => {
    if (type === 'all') {
      setFilters({ search: '', status: 'all', priority: 'all', type: 'all', assignee: 'all' });
    } else if (type === 'open') {
      setFilters((prev) => ({ ...prev, status: 'in_progress' }));
    } else if (type === 'urgent') {
      setFilters((prev) => ({ ...prev, priority: 'urgent' }));
    } else if (type === 'done') {
      setFilters((prev) => ({ ...prev, status: 'done' }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      type: 'all',
      assignee: 'all',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenCreateModal={() => handleOpenCreateModal('todo')}
        onRefresh={() => loadData(true)}
        isRefreshing={refreshing}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Dashboard */}
        <DashboardStats stats={stats} onFilterClick={handleStatsFilterClick} />

        {/* Filter & Search Bar */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          assignees={uniqueAssignees}
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load ticket data</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}. Ensure the SQLite backend is running on port 5000.</p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-medium">Fetching issues from SQLite database...</p>
          </div>
        ) : currentView === 'board' ? (
          <KanbanBoard
            tickets={tickets}
            onTicketClick={handleTicketClick}
            onStatusChange={handleStatusChange}
            onOpenCreateModal={handleOpenCreateModal}
          />
        ) : (
          <TicketList
            tickets={tickets}
            onTicketClick={handleTicketClick}
            onStatusChange={handleStatusChange}
            onDeleteTicket={handleDeleteTicket}
          />
        )}
      </main>

      {/* Create Ticket Modal */}
      <TicketCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        defaultStatus={createDefaultStatus}
      />

      {/* Ticket Details & Discussion Modal */}
      <TicketDetailModal
        ticketId={selectedTicketId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicketId(null);
        }}
        onTicketUpdated={handleTicketUpdated}
        onTicketDeleted={(id) => {
          setTickets((prev) => prev.filter((t) => t.id !== id));
          fetchStats().then(setStats).catch(console.error);
        }}
      />
    </div>
  );
};

export default App;

