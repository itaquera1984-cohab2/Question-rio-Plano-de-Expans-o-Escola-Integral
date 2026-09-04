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
3. Run the app:
   `npm run dev`
