import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {analyzeRoute} from './routes/analyze.js';
import {deleteWorkspacesRoute} from './routes/deleteWorkspaces.js';
import {geminiInsightsRoute} from './routes/geminiInsights.js';

const upload = multer({storage: multer.memoryStorage(), limits: {fileSize: 20 * 1024 * 1024}});

export function createApp() {
  const app = express();

  app.use(cors({origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization']}));
  app.use(express.json({limit: '2mb'}));

  app.post('/api/analyze', upload.single('file'), analyzeRoute);
  app.get('/api/delete-workspaces', deleteWorkspacesRoute);
  app.post('/api/insights/gemini', upload.single('file'), geminiInsightsRoute);

  app.get('/health', (_req, res) => {
    res.status(200).json({success: true, status: 200, data: {message: 'ok'}});
  });

  return app;
}
