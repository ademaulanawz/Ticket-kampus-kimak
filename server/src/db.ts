import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Ticket, TicketRow } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ticketing.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrency and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      type TEXT NOT NULL DEFAULT 'task',
      assignee TEXT NOT NULL DEFAULT 'Unassigned',
      labels TEXT NOT NULL DEFAULT '[]',
      due_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
    CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
  `);

  // Auto-seed if database is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number | bigint };
  if (Number(countRow.count) === 0) {
    seedInitialData();
  }
}

export function parseTicketRow(row: TicketRow): Ticket {
  let parsedLabels: string[] = [];
  try {
    parsedLabels = JSON.parse(row.labels || '[]');
  } catch {
    parsedLabels = [];
  }

  return {
    ...row,
    id: Number(row.id),
    comment_count: row.comment_count !== undefined ? Number(row.comment_count) : 0,
    labels: parsedLabels,
  };
}

function seedInitialData() {
  const insertTicket = db.prepare(`
    INSERT INTO tickets (title, description, status, priority, type, assignee, labels, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
  `);

  const insertComment = db.prepare(`
    INSERT INTO comments (ticket_id, author, content, created_at)
    VALUES (?, ?, ?, datetime('now', ?))
  `);

  const initialTickets = [
    {
      title: 'Fix authentication session timeout bug',
      description: 'Users report session disconnecting abruptly after 5 minutes of inactivity instead of the configured 60 minutes. Check JWT expiration and refresh token middleware.',
      status: 'in_progress',
      priority: 'urgent',
      type: 'bug',
      assignee: 'Alex Chen',
      labels: JSON.stringify(['auth', 'backend', 'security']),
      due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      createdOffset: '-3 days',
      updatedOffset: '-1 hour',
      comments: [
        { author: 'Alex Chen', content: 'Identified issue in token verification header check. Writing test cases now.', offset: '-1 hour' }
      ]
    },
    {
      title: 'Implement Dark Mode theme toggle',
      description: 'Support system preference detection and manual toggle for light/dark theme across the entire application interface.',
      status: 'todo',
      priority: 'medium',
      type: 'feature',
      assignee: 'Sarah Jenkins',
      labels: JSON.stringify(['ui', 'frontend', 'accessibility']),
      due_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      createdOffset: '-2 days',
      updatedOffset: '-2 days',
      comments: []
    },
    {
      title: 'Database connection pool optimization',
      description: 'Profile SQLite WAL performance under simulated concurrent reads and writes. Verify query execution plans on indexed ticket status column.',
      status: 'backlog',
      priority: 'low',
      type: 'improvement',
      assignee: 'Galang',
      labels: JSON.stringify(['database', 'performance']),
      due_date: null,
      createdOffset: '-4 days',
      updatedOffset: '-4 days',
      comments: []
    },
    {
      title: 'Add CSV export functionality for ticket reports',
      description: 'Allow managers to export filtered issue lists into CSV format with full details (title, status, priority, assignee, creation date).',
      status: 'todo',
      priority: 'high',
      type: 'feature',
      assignee: 'Marcus Vance',
      labels: JSON.stringify(['export', 'reporting']),
      due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      createdOffset: '-1 day',
      updatedOffset: '-6 hours',
      comments: [
        { author: 'Marcus Vance', content: 'Should this include internal comments as well, or just metadata?', offset: '-5 hours' }
      ]
    },
    {
      title: 'Upgrade build tooling and Vite configuration',
      description: 'Update Vite plugins to latest versions and optimize code splitting chunks for production bundle.',
      status: 'done',
      priority: 'medium',
      type: 'task',
      assignee: 'Alex Chen',
      labels: JSON.stringify(['tooling', 'dx']),
      due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      createdOffset: '-5 days',
      updatedOffset: '-1 day',
      comments: [
        { author: 'Alex Chen', content: 'Bundles reduced by 18% after tree-shaking adjustments.', offset: '-1 day' }
      ]
    }
  ];

  db.exec('BEGIN TRANSACTION;');
  try {
    for (const t of initialTickets) {
      const info = insertTicket.run(
        t.title,
        t.description,
        t.status,
        t.priority,
        t.type,
        t.assignee,
        t.labels,
        t.due_date,
        t.createdOffset,
        t.updatedOffset
      ) as { changes: number | bigint; lastInsertRowid: number | bigint };

      const ticketId = Number(info.lastInsertRowid);
      for (const c of t.comments) {
        insertComment.run(ticketId, c.author, c.content, c.offset);
      }
    }
    db.exec('COMMIT;');
    console.log('Database initialized and seeded with sample tickets.');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('Error seeding initial data:', err);
  }
}
