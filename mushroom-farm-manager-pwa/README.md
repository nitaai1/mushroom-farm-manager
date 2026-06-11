# Mushroom Farm Manager

## Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create `.env.local` from `.env.example`.

3. Add the Supabase project values:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
   ```

4. Start the app:

   ```powershell
   npm run dev
   ```

The Supabase client is exported from `src/lib/supabase.js`.
Never place a Supabase service-role key in a Vite environment variable.

## Install on iOS and Android

Build and deploy the project to an HTTPS host such as Vercel, Netlify,
Cloudflare Pages or Supabase Hosting:

```powershell
npm run build
```

The generated `dist` folder is the deployable website.

- **iPhone/iPad:** open the deployed URL in Safari, tap **Share**, then
  **Add to Home Screen**.
- **Android:** open the deployed URL in Chrome and select **Install app**.

The service worker caches the application shell after the first online visit.
Items, transactions, plans and notes continue saving locally while offline.
Supabase synchronization resumes when the device reconnects.

## Record-level synchronization

Run the SQL shown under **Backup, Sync & Settings → One-time database
setup** after deploying this version. It creates `farm_records` and the
timestamp-guarded `sync_farm_records` function.

The app synchronizes each item, transaction and plan post independently.
Offline deletions are retained as tombstones. Separate additions are preserved,
and likely duplicate purchase items appear in **Duplicate review** instead of
being overwritten automatically.
