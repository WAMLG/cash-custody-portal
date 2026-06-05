# Cloudflare Tunnel Demo Notes

## Purpose

Use Cloudflare Quick Tunnel for a no-card, no-cost temporary public demo.

This approach runs the app from the local computer and exposes it with public `trycloudflare.com` URLs.

```text
Browser visitor
→ Cloudflare temporary frontend tunnel
→ local Next.js frontend
→ Cloudflare temporary backend tunnel
→ local Laravel backend
→ Supabase PostgreSQL
```

## Important Limits

- The computer must stay on.
- Backend and frontend terminal windows must keep running.
- Tunnel URLs usually change when restarted.
- This is for demo/testing, not long-term production hosting.

## Install Cloudflared

On Windows, install Cloudflare Tunnel client:

```powershell
winget install Cloudflare.cloudflared
```

Then verify:

```powershell
cloudflared --version
```

## Run Local Backend

Terminal 1:

```powershell
cd D:\FINE\cash-custody-portal\backend
php artisan serve --host=127.0.0.1 --port=8000
```

## Expose Backend With Tunnel

Terminal 2:

```powershell
cloudflared tunnel --url http://127.0.0.1:8000
```

Copy the generated backend URL. It will look like:

```text
https://example-name.trycloudflare.com
```

The backend API base URL is:

```text
https://example-name.trycloudflare.com/api
```

## Point Frontend To Backend Tunnel

Edit:

```text
frontend/.env.local
```

Set:

```env
NEXT_PUBLIC_API_BASE_URL=https://YOUR_BACKEND_TUNNEL.trycloudflare.com/api
```

Restart the frontend after changing `.env.local`.

## Run Local Frontend

Terminal 3:

```powershell
cd D:\FINE\cash-custody-portal\frontend
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Expose Frontend With Tunnel

Terminal 4:

```powershell
cloudflared tunnel --url http://127.0.0.1:3000
```

Copy the generated frontend URL and open:

```text
https://YOUR_FRONTEND_TUNNEL.trycloudflare.com/login
```

## Demo Logins

```text
Admin:
admin@example.com
Password@123

Finance:
finance1@example.com
Password@123
```

## If Login Fails

Check:

1. Laravel backend terminal is still running.
2. Backend tunnel terminal is still running.
3. Frontend `.env.local` uses the backend tunnel URL plus `/api`.
4. Frontend server was restarted after editing `.env.local`.
5. Supabase database credentials in `backend/.env` are correct.

## If Login Page Refreshes Or Stays On Login

Most likely causes:

1. The backend tunnel URL changed or stopped.
2. `.env.local` still has an old backend tunnel URL.
3. Next.js was not restarted after editing `.env.local`.
4. Only one `cloudflared` process is running, so either the backend tunnel or frontend tunnel is missing.

Quick check:

```powershell
Invoke-RestMethod `
  -Uri https://YOUR_BACKEND_TUNNEL.trycloudflare.com/api/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"admin@example.com","password":"Password@123"}'
```

If this does not return a token, the frontend cannot login either.

Correct restart order:

1. Start Laravel on `127.0.0.1:8000`.
2. Start backend tunnel and copy the new backend URL.
3. Put that backend URL plus `/api` in `frontend/.env.local`.
4. Stop and restart the Next.js frontend server.
5. Start frontend tunnel and open its URL.

There must be two tunnel terminals open:

- one for backend port `8000`
- one for frontend port `3000`
