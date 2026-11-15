import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
// @ts-ignore - Untouched JS module from AgroVision_backend-main zip
import backendApp from './AgroVision_backend-main/src/app.js';
// @ts-ignore - Untouched JS module from AgroVision_backend-main zip
import { connectDatabase } from './AgroVision_backend-main/src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize backend database connection asynchronously (runs in disconnected mode if MONGODB_URI is not set)
  connectDatabase().catch((err: Error) => {
    console.warn('[AgroVision Backend] Database notice:', err.message);
  });

  // Route all /api and /api/v1 requests directly to the untouched AgroVision_backend-main Express app
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return backendApp(req, res, next);
    }
    next();
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgroVision Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
