/**
 * @file server.ts
 * @description Entry point — starts the HTTP server and handles graceful shutdown.
 *
 * WHY GRACEFUL SHUTDOWN?
 * ──────────────────────
 * When you deploy a new version (or Kubernetes restarts your pod),
 * the process receives a SIGTERM signal. Without graceful shutdown:
 *   - In-flight requests are cut off mid-response → broken clients
 *   - Database transactions may be abandoned → corrupt state
 *
 * With graceful shutdown:
 *   1. Stop accepting NEW connections immediately.
 *   2. Wait for existing requests to complete (up to SHUTDOWN_TIMEOUT_MS).
 *   3. Close DB connections and other resources cleanly.
 *   4. Exit with code 0.
 *
 * SIGNALS
 * ───────
 * SIGTERM → sent by Docker / Kubernetes / PM2 when stopping a container
 * SIGINT  → sent when you press Ctrl+C in the terminal
 */

import { env } from '@config/env';
import { logger } from '@config/logger';
import { SERVER } from '@constants/app.constants';
import app from './app';

// ── Start Server ──────────────────────────────────────────────────────────────

const server = app.listen(env.PORT, () => {
  logger.info(`Server running   -> http://localhost:${env.PORT}`);
  logger.info(`API docs         -> http://localhost:${env.PORT}/api-docs`);
  logger.info(`Health check     -> http://localhost:${env.PORT}/health`);
  logger.info(`Environment      -> ${env.NODE_ENV}`);
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────

function shutdown(signal: string): void {
  logger.info(`${signal} received — shutting down gracefully...`);

  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error during server close');
      process.exit(1);
    }

    // ── Clean up resources here ───────────────────────────────────────────
    // If you add a database, disconnect it here:
    // await prisma.$disconnect()
    // await mongoose.disconnect()

    logger.info('Server closed. Goodbye!');
    process.exit(0);
  });

  // Force-kill after timeout if requests do not finish in time
  setTimeout(() => {
    logger.error(
      `Graceful shutdown timed out after ${SERVER.SHUTDOWN_TIMEOUT_MS}ms — forcing exit`,
    );
    process.exit(1);
  }, SERVER.SHUTDOWN_TIMEOUT_MS);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Catch Unhandled Errors (last resort safety net) ───────────────────────────

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection — shutting down');
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down');
  shutdown('uncaughtException');
});

export default server;
