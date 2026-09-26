import { Router, Request, Response } from 'express';
import { db, parseTicketRow } from '../db.js';
import { TicketRow } from '../types.js';

export const ticketsRouter = Router();

// GET all tickets with optional filtering & search
ticketsRouter.get('/', (req: Request, res: Response) => {
  try {
    const { search, status, priority, type, assignee } = req.query;

    let query = `
      SELECT t.*, COUNT(c.id) as comment_count 
      FROM tickets t 
      LEFT JOIN comments c ON t.id = c.ticket_id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search && typeof search === 'string') {
      query += ` AND (t.title LIKE ? OR t.description LIKE ? OR t.labels LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority && typeof priority === 'string' && priority !== 'all') {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (type && typeof type === 'string' && type !== 'all') {
      query += ` AND t.type = ?`;
      params.push(type);
    }

    if (assignee && typeof assignee === 'string' && assignee !== 'all') {
      query += ` AND t.assignee = ?`;
      params.push(assignee);
    }

    query += ` GROUP BY t.id ORDER BY t.created_at DESC`;

    const rows = db.prepare(query).all(...params) as unknown as TicketRow[];
    const tickets = rows.map(parseTicketRow);

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET single ticket with comments
ticketsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const row = db.prepare(`
      SELECT t.*, COUNT(c.id) as comment_count 
      FROM tickets t 
      LEFT JOIN comments c ON t.id = c.ticket_id 
      WHERE t.id = ? 
      GROUP BY t.id
    `).get(ticketId) as TicketRow | undefined;

    if (!row) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const comments = db.prepare(`
      SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC
    `).all(ticketId) as any[];

    const ticket = parseTicketRow(row);
    res.json({
      ...ticket,
      comments: comments.map(c => ({ ...c, id: Number(c.id), ticket_id: Number(c.ticket_id) })),
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// POST create new ticket
ticketsRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      type = 'task',
      assignee = 'Unassigned',
      labels = [],
      due_date = null,
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const labelsJson = Array.isArray(labels) ? JSON.stringify(labels) : '[]';

    const insert = db.prepare(`
      INSERT INTO tickets (title, description, status, priority, type, assignee, labels, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = insert.run(
      title.trim(),
      description.trim(),
      status,
      priority,
      type,
      assignee.trim() || 'Unassigned',
      labelsJson,
      due_date || null
    ) as { changes: number | bigint; lastInsertRowid: number | bigint };

    const ticketId = Number(result.lastInsertRowid);
    const createdRow = db.prepare(`
      SELECT t.*, 0 as comment_count FROM tickets t WHERE t.id = ?
    `).get(ticketId) as unknown as TicketRow;

    res.status(201).json(parseTicketRow(createdRow));
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// PATCH update ticket
ticketsRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId) as TicketRow | undefined;
    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    const allowedFields: (keyof TicketRow)[] = [
      'title',
      'description',
      'status',
      'priority',
      'type',
      'assignee',
      'due_date',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (req.body.labels !== undefined) {
      updates.push(`labels = ?`);
      values.push(Array.isArray(req.body.labels) ? JSON.stringify(req.body.labels) : '[]');
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    updates.push(`updated_at = datetime('now')`);
    values.push(ticketId);

    const sql = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    const updatedRow = db.prepare(`
      SELECT t.*, COUNT(c.id) as comment_count 
      FROM tickets t 
      LEFT JOIN comments c ON t.id = c.ticket_id 
      WHERE t.id = ? 
      GROUP BY t.id
    `).get(ticketId) as unknown as TicketRow;

    res.json(parseTicketRow(updatedRow));
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// DELETE ticket
ticketsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const info = db.prepare('DELETE FROM tickets WHERE id = ?').run(ticketId) as { changes: number | bigint };
    if (Number(info.changes) === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});
