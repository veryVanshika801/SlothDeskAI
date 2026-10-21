import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/apiRouter';

dotenv.config();

const app = express();

app.use(express.json({ limit: '2mb' }));

// Mount API routes at /api
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'SlothDesk AI', timestamp: new Date().toISOString() });
});

export default app;
