# Cash Custody Portal - Setup Notes

## Project Layout

The root project folder is:

```text
D:\FINE\cash-custody-portal
```

Planned structure:

```text
cash-custody-portal/
├── frontend/
├── backend/
├── docs/
│   └── setup.md
├── project_goals.md
└── project_state.md
```

## Current Status

The backend and frontend demo applications have been created.

Backend core APIs are implemented for auth, finance handovers, admin management, supplier payments, dashboards, audit logs, and supplier portal access.

Frontend pages are implemented for admin, finance, and supplier users.

## Local Development Requirements

The project will need the following tools for development:

- PHP compatible with the Laravel version selected during backend setup
- Composer
- Node.js LTS
- npm, pnpm, or yarn
- Git
- PostgreSQL access through Supabase for the demo database

Recommended checks before starting backend setup:

```powershell
php -v
composer -V
node -v
npm -v
git --version
```

## Backend Setup Plan

The backend will be created inside:

```text
backend/
```

Planned backend stack:

- Laravel API
- Laravel Sanctum
- PostgreSQL
- Supabase PostgreSQL for demo

Planned backend setup steps:

1. Create Laravel project inside backend/.
2. Configure .env for local development.
3. Configure PostgreSQL database connection for Supabase.
4. Install and configure Laravel Sanctum.
5. Create migrations for:
   - users
   - authorized_receivers
   - cash_handovers
   - suppliers
   - supplier_payments
   - audit_logs
6. Create models, controllers, requests, resources, services, policies or middleware, and seeders.
7. Seed demo data:
   - one admin user
   - two finance users
   - one supplier user
   - authorized receivers
   - suppliers
   - sample cash handovers
   - sample supplier payments

## Frontend Setup Plan

The frontend will be created later inside:

```text
frontend/
```

Planned frontend stack:

- Next.js
- TypeScript
- Tailwind CSS

Frontend work should not begin until backend authentication and core database tables are ready.

## Environment Variables

Environment files must be used for secrets and local configuration.

Rules:

- Do not commit .env files.
- Do not expose database credentials in frontend code.
- Keep Supabase database credentials only in the backend .env file.
- Use separate environment values for local, demo, and production deployments.

Expected backend environment values later:

```text
APP_NAME="Cash Custody Portal"
APP_ENV=local
APP_DEBUG=true
APP_TIMEZONE=Asia/Colombo

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

Expected frontend environment values later:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Security Notes

- Use Laravel Sanctum for authentication.
- Store passwords only with Laravel hashing.
- Blocked users must not be allowed to login.
- Backend must enforce admin and finance permissions.
- Backend must enforce supplier permissions.
- Supplier users can see only payments linked to their assigned supplier record.
- Supplier users can accept their own payments and edit only their own supplier note.
- Do not rely only on frontend route hiding for security.
- Do not physically delete financial records.
- Use soft deletes or void statuses.
- Record important actions in audit_logs.
- Protect confirmed financial records and audit corrections.

## Development Order

Follow this order:

1. Root documentation.
2. Laravel backend project.
3. Backend database migrations and seeders.
4. Backend authentication and roles.
5. Backend finance handover APIs.
6. Backend supplier and supplier payment APIs.
7. Backend dashboard APIs.
8. Next.js frontend project.
9. Frontend auth flow.
10. Finance frontend pages.
11. Admin frontend pages.
12. Demo polish.

After every major step, update project_state.md.

Intructions to test run 

To run backend: Terminal 1
- cd D:\FINE\cash-custody-portal\backend
- php artisan serve --host=127.0.0.1 --port=8000

To run frontend: Terminal 2
- cd D:\FINE\cash-custody-portal\frontend
- npm run dev -- --hostname 127.0.0.1 --port 3000

Open in browser:
http://127.0.0.1:3000/login

## Demo Login Notes

Default seeded users are intended for local/demo use only.

If your database was already seeded before supplier login was added, run the latest migrations first, then create a supplier user from Admin > Users. Choosing the Supplier role creates both the supplier company record and the login user together.

Do not run the full database seeder again on an existing Supabase database unless you intentionally want to reset or duplicate demo data.

Supplier creation rule:

- Use Admin > Users to create supplier login users.
- When role is Supplier, fill the supplier/company fields in the same form.
- The system creates one supplier record and one linked supplier user.
- Use Admin > Suppliers only to manage existing supplier companies.
