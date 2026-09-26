import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { TicketPriority, TicketStatus, TicketType } from '../types.js';

export const statsRouter = Router();

// GET dashboard statistics
statsRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const totalRow = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number | bigint };
    const openRow = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('todo', 'pending', 'in_progress', 'backlog')").get() as { count: number | bigint };
    const inProgressRow = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'in_progress'").get() as { count: number | bigint };
    const doneRow = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('done', 'closed')").get() as { count: number | bigint };
    const urgentRow = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE priority = 'urgent' AND status != 'done' AND status != 'closed'").get() as { count: number | bigint };

    // Breakdown by Priority
    const priorityRows = db.prepare('SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority').all() as { priority: TicketPriority; count: number | bigint }[];
    const byPriority: Record<TicketPriority, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
    priorityRows.forEach(r => { byPriority[r.priority] = Number(r.count); });

    // Breakdown by Status
    const statusRows = db.prepare('SELECT status, COUNT(*) as count FROM tickets GROUP BY status').all() as { status: TicketStatus; count: number | bigint }[];
    const byStatus: Record<TicketStatus, number> = { backlog: 0, todo: 0, pending: 0, in_progress: 0, done: 0, closed: 0 };
    statusRows.forEach(r => { byStatus[r.status] = Number(r.count); });

    // Breakdown by Type
    const typeRows = db.prepare('SELECT type, COUNT(*) as count FROM tickets GROUP BY type').all() as { type: TicketType; count: number | bigint }[];
    const byType: Record<TicketType, number> = { bug: 0, feature: 0, task: 0, improvement: 0 };
    typeRows.forEach(r => { byType[r.type] = Number(r.count); });

    res.json({
      total: Number(totalRow.count),
      open: Number(openRow.count),
      inProgress: Number(inProgressRow.count),
      done: Number(doneRow.count),
      urgent: Number(urgentRow.count),
      byPriority,
      byStatus,
      byType,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});
