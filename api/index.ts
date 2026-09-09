import type { Request, Response } from 'express';

let appPromise: Promise<ReturnType<typeof import('../server.ts')['createApp']>> | null = null;

export default async function handler(req: Request, res: Response) {
  try {
    if (!appPromise) {
      appPromise = import('../server.ts').then(({ createApp }) => createApp());
    }
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error('Vercel API initialization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao inicializar a API do sistema.',
    });
  }
}
