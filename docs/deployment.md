# Cash Custody Portal - Deployment Notes

## Recommended Demo Hosting

Use this setup first:

```text
Frontend: Vercel
Backend: Render Docker Web Service
Database: Supabase PostgreSQL
```

Deploy the backend first, test the API, then deploy the frontend.

## Backend Deployment To Render

### 1. Commit Deployment Files

The backend Docker deployment files must exist in GitHub before Render can use them.

Files added for Render:

```text
backend/Dockerfile
backend/.dockerignore
backend/docker/apache.conf
backend/docker/render-start.sh
```

After these files are created, commit and push:

```powershell
cd D:\FINE\cash-custody-portal
git add backend/Dockerfile backend/.dockerignore backend/docker docs/deployment.md project_state.md
git commit -m "Add Render backend deployment files"
git push
```

### 2. Create Render Web Service

In Render:

```text
New > Web Service
Repository: WAMLG/cash-custody-portal
Branch: main
Root Directory: backend
Runtime: Docker
```

Render will use `backend/Dockerfile` automatically because the service root is `backend`.

### 3. Render Environment Variables

Set these in Render Environment:

```env
APP_NAME=Cash Custody Portal
APP_ENV=production
APP_DEBUG=false
APP_URL=https://YOUR_RENDER_SERVICE.onrender.com
APP_TIMEZONE=Asia/Colombo
APP_KEY=YOUR_LOCAL_BACKEND_APP_KEY

DB_CONNECTION=pgsql
DB_HOST=YOUR_SUPABASE_DB_HOST
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=YOUR_SUPABASE_PASSWORD

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
LOG_CHANNEL=stderr
```

Get the local Laravel app key:

```powershell
cd D:\FINE\cash-custody-portal\backend
Select-String -Path .env -Pattern "^APP_KEY="
```

Do not commit `.env`.

### 4. First Deploy Commands

After Render builds and starts successfully, open the Render Shell and run:

```bash
php artisan migrate --force
php artisan db:seed --force
php artisan optimize
```

If the Supabase database already has the tables and demo data, do not run `db:seed` again unless duplicate seed records are acceptable or the database has been reset.

### 5. Test Backend

Test:

```text
https://YOUR_RENDER_SERVICE.onrender.com/api/login
```

Request body:

```json
{
  "login": "admin@example.com",
  "password": "Password@123"
}
```

Expected result: JSON response with a bearer token.

## Frontend Deployment To Vercel

Deploy after the backend works.

```text
Repository: WAMLG/cash-custody-portal
Root Directory: frontend
Framework: Next.js
Build Command: npm run build
```

Set Vercel environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://YOUR_RENDER_SERVICE.onrender.com/api
```

Then deploy and test:

```text
https://YOUR_VERCEL_APP.vercel.app/login
```
