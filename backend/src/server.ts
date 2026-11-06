import { createApp } from './app';
import { env } from './config/env';

async function main() {
  const app = createApp();

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.info('');
    console.info('  ACES GLOBAL SERVICES — API');
    console.info(`  Environnement : ${env.nodeEnv}`);
    console.info(`  Adaptateur    : ${env.dataAdapter}`);
    console.info(`  URL           : http://localhost:${env.port}/api`);
    console.info(`  Frontend      : ${env.appUrl}`);
    if (env.dataAdapter === 'memory') {
      console.info('  Mode démonstration : données persistées dans backend/.data/db.json');
    }
    console.info('');
  });

  const shutdown = (signal: string) => {
    console.info(`\n[api] signal ${signal} reçu, arrêt en cours…`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 8000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => console.error('[api] promesse rejetée :', reason));
}

main().catch((error) => {
  console.error('[api] démarrage impossible :', error);
  process.exit(1);
});
