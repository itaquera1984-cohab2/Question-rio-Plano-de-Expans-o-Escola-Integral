<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/64c07a63-6049-4fa8-981e-d3b812b1b89d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env` file from `.env.example` and configure:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for server-side database and Storage uploads
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for browser fallback access
   - `SUPABASE_STORAGE_BUCKET` and `SUPABASE_STORAGE_FOLDER` when the destination differs from `GT-SME RICO/protocolos`
   - `GEMINI_API_KEY` for Gemini AI API calls
   - `ADMIN_LOGIN` and `ADMIN_PASSWORD` for the server-only master administrative access
   - `SESSION_SECRET` with a long random value to sign school sessions (server only)
   - `RESEND_API_KEY`, `REPORT_EMAIL_FROM` and `REPORT_EMAIL_TO` for mandatory delivery of finalized reports by email
3. Run the app:
   `npm run dev`

## School password changes

Before deploying the password-change feature, run `supabase/migrations/20260909_school_password_hash.sql` in the Supabase SQL Editor. School passwords are stored only as salted scrypt hashes. `SUPABASE_SERVICE_ROLE_KEY` is required by the protected server routes and must never use the `VITE_` prefix.

The final submission uploads PDF, CSV and TXT to Supabase Storage and emails the same attachments through Resend. Verify the sender domain in Resend, keep `RESEND_API_KEY` server-side, and configure `REPORT_EMAIL_TO=dados.educacionais@pindamonhangaba.sp.gov.br` in Vercel.
