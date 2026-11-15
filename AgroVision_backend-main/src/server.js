import http from 'http';
import app from './app.js';
import { config, validateProductionConfig } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

// 1. Validate Production Configuration
try {
  validateProductionConfig();
} catch (error) {
  console.error('[Startup Error]', error.message);
  process.exit(1);
}

// 2. Create HTTP Server
const server = http.createServer(app);
const PORT = config.port;

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`=======================================================`);
  console.log(`  AgroVision Backend Gateway — Stage 3 Initialized      `);
  console.log(`  Environment : ${config.env}                           `);
  console.log(`  Port        : ${PORT}                                 `);
  console.log(`  Health (v1) : http://localhost:${PORT}/api/v1/health   `);
  console.log(`  Health (leg): http://localhost:${PORT}/api/health      `);
  console.log(`  Readiness   : http://localhost:${PORT}/api/v1/ready    `);
  console.log(`  Allowed CORS: ${config.frontendUrls.join(', ')}       `);
  console.log(`=======================================================`);

  // Initialize MongoDB Atlas connection asynchronously
  try {
    await connectDatabase();
  } catch (err) {
    console.error('[Startup Error] Database initialization failed:', err.message);
    if (config.isProduction) {
      process.exit(1);
    }
  }
});

// 3. Graceful Shutdown Handlers
let isShuttingDown = false;
async function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);

  // Disconnect MongoDB cleanly before closing HTTP listener
  try {
    await disconnectDatabase();
  } catch (dbErr) {
    console.error('[Server] Error while disconnecting database during shutdown:', dbErr);
  }

  server.close((err) => {
    if (err) {
      console.error('[Server] Error while closing HTTP server:', err);
      process.exit(1);
    }
    console.log('[Server] HTTP server closed gracefully. Exiting process.');
    process.exit(0);
  });

  // Force shutdown if server hangs for more than 10 seconds
  setTimeout(() => {
    console.error('[Server] Graceful shutdown timeout exceeded. Forcing termination.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// 4. Global Process Error Handlers
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  handleShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Promise Rejection at:', promise, 'reason:', reason);
  handleShutdown('unhandledRejection');
});

export default server;
