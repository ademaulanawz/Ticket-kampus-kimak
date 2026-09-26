export type TicketStatus = 'backlog' | 'todo' | 'pending' | 'in_progress' | 'done' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketType = 'bug' | 'feature' | 'task' | 'improvement';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  assignee: string;
  labels: string[];
  due_date: string | null;
  created_at: string;
  updated_at: string;
  comment_count?: number;
}

export interface TicketRow {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  assignee: string;
  labels: string; // JSON string
  due_date: string | null;
  created_at: string;
  updated_at: string;
  comment_count?: number;
}

export interface Comment {
  id: number;
  ticket_id: number;
  author: string;
  content: string;
  created_at: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  urgent: number;
  byPriority: Record<TicketPriority, number>;
  byStatus: Record<TicketStatus, number>;
  byType: Record<TicketType, number>;
}

