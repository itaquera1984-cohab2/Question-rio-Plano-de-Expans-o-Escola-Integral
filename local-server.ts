import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server.ts';

async function startServer() {
  const app = createApp();
  const port = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando em http://localhost:${port}`));
}

startServer().catch((error) => {
  console.error('Falha ao iniciar o servidor local:', error);
  process.exit(1);
});
