import type { Request, Response } from 'express';
import { createApp } from '../server';

const app = createApp();

export default async function handler(req: Request, res: Response) {
  try {
    return app(req, res);
  } catch (error) {
    console.error('Vercel API request error:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao processar a solicitação da API.',
    });
  }
}
