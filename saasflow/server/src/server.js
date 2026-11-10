import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { connectDB } from './config/db.js';
import { dataStore } from './dataStore.js';
import { apiRouter } from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-Quota-Monthly-Limit', 'X-Quota-Monthly-Used', 'Retry-After']
}));
app.use(express.json());

// API route mount
app.use('/api', apiRouter);

// Serve built frontend assets if available
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // Root informational endpoint fallback
  app.get('/', (req, res) => {
    res.json({
      product: 'SaaSFlow API Gateway & Rate Limiting Console',
      version: 'v1.1-fullstack',
      status: 'online',
      endpoints: {
        health: '/api/health',
        plans: '/api/plans',
        tenants: '/api/tenants',
        overview: '/api/overview',
        gateway: '/api/gateway/request',
        billing: '/api/billing',
        traffic: '/api/traffic/status'
      }
    });
  });
}

async function startServer() {
  console.log('----------------------------------------------------');
  console.log(' Starting SaaSFlow Simulated API Gateway Server... ');
  console.log('----------------------------------------------------');

  await connectDB();
  await dataStore.initSeed();

  app.listen(PORT, () => {
    console.log(`[SaaSFlow Server] Running on http://localhost:${PORT}`);
    console.log(`[SaaSFlow Server] Gateway Ready at http://localhost:${PORT}/api/gateway/request`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Boot Error:', err);
});
