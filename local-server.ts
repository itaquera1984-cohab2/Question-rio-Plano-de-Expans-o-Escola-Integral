import { startServer } from './server.ts';

startServer().catch((error) => {
  console.error('Falha ao iniciar o servidor local:', error);
  process.exit(1);
});
