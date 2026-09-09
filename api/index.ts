import type { Request, Response } from 'express';
import { createApp } from '../server.ts';

const app = createApp();

export default async function handler(req: Request, res: Response) {
  try {
    return app(req, res);
  } catch (error) {
    console.error('Vercel API initialization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao inicializar a API do sistema.',
    });
  }
}
