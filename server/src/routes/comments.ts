import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const commentsRouter = Router();

// POST add comment to ticket
commentsRouter.post('/tickets/:id/comments', (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { author, content } = req.body;

    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const ticketExists = db.prepare('SELECT id FROM tickets WHERE id = ?').get(ticketId);
    if (!ticketExists) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const insert = db.prepare(`
      INSERT INTO comments (ticket_id, author, content, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    const result = insert.run(
      ticketId,
      (author && typeof author === 'string' && author.trim()) ? author.trim() : 'Anonymous',
      content.trim()
    ) as { changes: number | bigint; lastInsertRowid: number | bigint };

    const createdComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(Number(result.lastInsertRowid)) as any;

    // Also update ticket updated_at
    db.prepare("UPDATE tickets SET updated_at = datetime('now') WHERE id = ?").run(ticketId);

    res.status(201).json({
      ...createdComment,
      id: Number(createdComment.id),
      ticket_id: Number(createdComment.ticket_id),
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// DELETE comment
commentsRouter.delete('/comments/:id', (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id, 10);
    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    const info = db.prepare('DELETE FROM comments WHERE id = ?').run(commentId) as { changes: number | bigint };
    if (Number(info.changes) === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});
