import { createApp } from '../server';

// A single Express function handles all existing /api/* routes on Vercel.
// The SPA itself is built by Vite and served from dist.
export default createApp();
