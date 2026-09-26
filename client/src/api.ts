import { Ticket, TicketDetail, TicketStats, FilterOptions, Comment } from './types';

const API_BASE = '/api';

export async function fetchTickets(filters?: Partial<FilterOptions>): Promise<Ticket[]> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.assignee && filters.assignee !== 'all') params.append('assignee', filters.assignee);
  }

  const queryString = params.toString();
  const url = `${API_BASE}/tickets${queryString ? `?${queryString}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch tickets');
  return response.json();
}

export async function fetchTicketById(id: number): Promise<TicketDetail> {
  const response = await fetch(`${API_BASE}/tickets/${id}`);
  if (!response.ok) throw new Error('Failed to fetch ticket details');
  return response.json();
}

export async function createTicket(ticket: Omit<Partial<Ticket>, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create ticket');
  }
  return response.json();
}

export async function updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update ticket');
  }
  return response.json();
}

export async function deleteTicket(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete ticket');
}

export async function addComment(ticketId: number, author: string, content: string): Promise<Comment> {
  const response = await fetch(`${API_BASE}/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, content }),
  });
  if (!response.ok) throw new Error('Failed to add comment');
  return response.json();
}

export async function fetchStats(): Promise<TicketStats> {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) throw new Error('Failed to fetch statistics');
  return response.json();
}

