import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import { ticketsRouter } from './routes/tickets.js';
import { commentsRouter } from './routes/comments.js';
import { statsRouter } from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
initDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// API Routes
app.use('/api/tickets', ticketsRouter);
app.use('/api', commentsRouter);
app.use('/api', statsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ticketing-api', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Ticketing Server running at http://localhost:${PORT}`);
});

