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

## Confirmed order emails

The purchase cart can prepare a WhatsApp message or send an email after the
user confirms the recipient. Email delivery runs in a Supabase Edge Function,
so the email-service key is never included in the website or PWA.

1. Create a [Resend](https://resend.com) account and verify the sender domain.
2. In Supabase, add these Edge Function secrets:

   ```text
   RESEND_API_KEY=your_resend_api_key
   ORDER_FROM_EMAIL=Mushroom Farm <orders@your-verified-domain.com>
   ```

3. Deploy the function from the project folder:

   ```powershell
   supabase functions deploy send-order-email
   ```

The function requires a valid Supabase user session. In the app, save the
recipient under **Settings → Order notification email**. The app asks for
confirmation before sending and does not send while offline.
