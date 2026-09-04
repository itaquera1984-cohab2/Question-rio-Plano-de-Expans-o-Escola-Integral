# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains the React 19 client. Put reusable UI in `src/components/`, questionnaire models in `src/types/`, static domain data in `src/data/`, and shared integrations/helpers in `src/utils/`.
- `src/App.tsx` coordinates survey state and navigation; `src/main.tsx` is the browser entry point; `src/index.css` contains global styles and Tailwind setup.
- `server.ts` provides the local Express/Vite server, API endpoints, PDF/CSV generation, Gemini calls, and Supabase access.
- `api/[...path].ts` adapts backend routes for Vercel deployment.
- Static browser assets belong in `public/` (for example, `public/brasao.png`). Generated output goes to `dist/` and must not be committed.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`. Use npm consistently; do not update `bun.lock` unless intentionally supporting Bun.
- `npm run dev` starts the Express server through `tsx` with Vite middleware.
- `npm run lint` runs TypeScript validation (`tsc --noEmit`). Run it before every PR.
- `npm run build` creates the Vite client production bundle.
- `npm run build:local-server` builds both the client and bundled Node server; `npm start` runs that bundle.
- `npm run preview` serves the client build for a production-style check.

## Coding Style & Naming Conventions

Write TypeScript/TSX with ES modules and functional React components. Follow the surrounding file's formatting; the repository has no enforced formatter. Use `PascalCase` for components and types (`ReviewSummary.tsx`, `SurveyFormData`), `camelCase` for functions and variables, and `UPPER_SNAKE_CASE` for constants. Keep domain data separate from rendering code, prefer explicit types, and use the `@/` alias for root-relative imports when it improves readability.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. At minimum, run `npm run lint` and `npm run build`, then manually exercise login, survey persistence, submission, exports, and admin flows. If adding tests, colocate them as `*.test.ts` or `*.test.tsx` and add the runner command to `package.json`.

## Commit & Pull Request Guidelines

Git history is not included in this repository copy, so use concise imperative commits, optionally with Conventional Commit prefixes, such as `fix: preserve saved survey state`. Keep commits focused. PRs should explain the behavior change, configuration impact, and verification performed; link relevant issues and include screenshots for UI changes.

## Security & Configuration

Copy `.env.example` to `.env` and keep secrets untracked. Never expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` in client code; only `VITE_` variables are browser-visible. Document any new environment variable in `.env.example` and `README.md`.
