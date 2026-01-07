import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import applicationsRouter from './routes/applications.js';
import automationRouter from './routes/automation.js';
import logsRouter from './routes/logs.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Middleware
app.use(cors());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[Server] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Login Route
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Routes
app.use('/api/applications', applicationsRouter);
app.use('/api/automation', automationRouter);
app.use('/api/logs', logsRouter);

// ============================================================================
// PROXY: HopWhistle API (Fixes Mixed Content & CORS)
// ============================================================================
import proxy from 'express-http-proxy';

// Proxy API requests
app.use('/api/hopwhistle', proxy('http://107.170.36.116:3001', {
  proxyReqPathResolver: (req) => {
    // Forward path: /api/hopwhistle/v1/agent/... -> /v1/agent/...
    // But HopWhistle API is mounted at root or /api depending on app.yaml?
    // Based on previous findings API is at http://107.170.36.116:3001/api/v1/...
    // So we want to forward /api/hopwhistle/api/v1/... -> /api/v1/...
    // Let's assume frontend requests /api/hopwhistle/api/v1/...
    return req.url.startsWith('/api') ? req.url : `/api${req.url}`;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    // Add CORS headers just in case
    userRes.header('Access-Control-Allow-Origin', '*');
    return proxyResData;
  }
}));

// Health check (keep this before the catch-all)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
