# ShadowFox SC - CardTrack (Option 1)

**Simpler + easier to edit** stack:
- Next.js web app (Vercel free)
- Supabase DB + image storage (free)
- Server routes for eBay price lookup (keys stay secret)

## Supabase setup (10 minutes)
1) Create a Supabase project  
2) SQL Editor → run `supabase/schema.sql`  
3) Storage → create bucket: **card-images** (Public)

## Vercel deploy (5 minutes)
1) Upload this project to GitHub  
2) Vercel → Add New Project → Import your repo  
3) Vercel → Settings → Environment Variables:

### Required
SUPABASE_URL  
SUPABASE_SERVICE_ROLE_KEY  
EBAY_CLIENT_ID  
EBAY_CLIENT_SECRET  

> Do **NOT** put keys in GitHub files. Only in Vercel env vars.

## Local run
```bash
npm install
npm run dev
```
