# Cash Custody Portal - Project State

## 1. Current project goal

Build a secure cash ledger web portal called Cash Custody Portal with a clean separation between:

- frontend/ as a Next.js, TypeScript, Tailwind CSS application
- backend/ as a Laravel API application
- docs/ for documentation and setup notes

The current phase is frontend foundation work after backend core APIs were prepared.

## 2. What we completed so far

- Created the initial root documentation plan.
- Created project_goals.md with the system purpose, roles, workflows, stack decisions, security rules, folder structure, database plan, API plan, and important decisions.
- Created project_state.md as the project continuation tracker.
- Created docs/setup.md with initial local development setup notes.
- Created the Laravel backend project inside backend/.
- Installed Laravel dependencies.
- Enabled required local PHP extensions for Laravel/backend development: fileinfo, zip, pdo_pgsql, and pgsql.
- Installed Laravel Sanctum.
- Created routes/api.php using Laravel's API installer.
- Added Sanctum HasApiTokens support to App\Models\User.
- Configured backend/.env and backend/.env.example for PostgreSQL-style defaults.
- Configured Laravel timezone through APP_TIMEZONE with Asia/Colombo as the default.
- Generated the Laravel application key in backend/.env.
- Created placeholder backend structure folders for Requests, Resources, Services, and Policies.
- Completed backend database setup files for Step 3.
- Updated the users migration for Cash Custody Portal fields: username, role, status, phone, last_login_at, and soft deletes.
- Created migrations for authorized_receivers, cash_handovers, suppliers, supplier_payments, and audit_logs.
- Created Eloquent models for AuthorizedReceiver, CashHandover, Supplier, SupplierPayment, and AuditLog.
- Updated the User model with portal fields, soft deletes, and relationships.
- Updated UserFactory to match the portal users table.
- Added demo seed data for one admin, two finance users, authorized receivers, suppliers, sample cash handovers, sample supplier payments, and starter audit logs.
- Added docs/supabase.md with Supabase setup notes.
- Confirmed all migrations have run against the configured PostgreSQL/Supabase database.
- Completed Step 4 backend authentication and role foundation.
- Added API login, logout, and me endpoints.
- Added blocked-user login protection.
- Added active-user middleware that blocks access for users whose status is not active.
- Added role middleware for admin and finance route protection.
- Added protected placeholder route groups for admin and finance APIs.
- Added login/logout audit logging.
- Completed Step 5 backend finance cash handover APIs.
- Added active authorized receivers API for the finance handover dropdown.
- Added finance cash handover create, own-list, and own-note-update endpoints.
- Added admin cash handover list, show, edit, confirm, and void endpoints.
- Added cash handover request validation and API resources.
- Added shared AuditLogService for backend action logging.
- Confirmed Laravel can read Supabase seeded data for users, receivers, and handovers.
- Completed Step 6 backend supplier and supplier payment APIs.
- Added admin supplier list, create, edit, block, and unblock endpoints.
- Added admin supplier payment list, create, edit, and void endpoints.
- Added supplier and supplier payment validation and API resources.
- Enforced active-supplier validation for creating or moving supplier payments.
- Added audit logging for supplier create/edit/block/unblock and supplier payment create/edit/void actions.
- Confirmed Laravel can read Supabase seeded data for suppliers and payments.
- Completed Step 7 backend dashboard APIs.
- Added admin dashboard API with backend-calculated KPIs, current cash balance, period totals, averages, min/max cash in, and chart data.
- Added finance dashboard API with user-specific counts, current-month submitted amount, and recent handovers.
- Added period support for today, week, month, and custom date_from/date_to ranges.
- Verified dashboard controller responses return HTTP 200 against the configured database.
- Completed Step 8 frontend project creation.
- Created the Next.js frontend application inside frontend/ with TypeScript, Tailwind CSS, App Router, src/ directory, and npm.
- Added required frontend route folders for login, admin pages, and finance pages.
- Added shared frontend structure under src/components, src/lib, src/types, and src/styles.
- Replaced the starter Next.js page with a redirect to /login.
- Added a clean placeholder login page and role-specific shell pages.
- Verified frontend lint and production build pass.
- Started the frontend dev server at http://127.0.0.1:3000.
- Completed Step 9 frontend auth flow.
- Added NEXT_PUBLIC_API_BASE_URL frontend environment configuration.
- Added frontend API client with bearer token support and API error handling.
- Added sessionStorage-based demo token storage.
- Added AuthProvider, useAuth, and protected route handling.
- Implemented login form submission against POST /api/login.
- Implemented /api/me session refresh on the frontend.
- Implemented role-based redirects to /admin/dashboard and /finance/dashboard.
- Added logout behavior that calls POST /api/logout and clears the demo token.
- Protected admin and finance shell pages by role.
- Started the Laravel API server at http://127.0.0.1:8000 for local frontend testing.
- Verified backend login, /api/me, and admin protected status endpoint with a bearer token.
- Verified Laravel CORS preflight from http://127.0.0.1:3000 succeeds.
- Completed Step 10 finance frontend.
- Implemented finance dashboard data loading from GET /api/finance/dashboard.
- Implemented finance dashboard KPI cards and recent handover table.
- Implemented finance new handover form using GET /api/authorized-receivers and POST /api/finance/cash-handovers.
- Added Asia/Colombo current date/time defaults for the finance handover form.
- Implemented finance my records table using GET /api/finance/cash-handovers.
- Implemented finance note editing using PATCH /api/finance/cash-handovers/{id}/note.
- Added status badges, loading states, empty states, success messages, and error messages for finance pages.
- Verified authenticated finance dashboard and cash handover list API calls with a finance token.
- Completed Step 11 admin frontend.
- Added backend admin user management APIs for list, create, edit, block, and unblock.
- Added backend admin audit log API.
- Implemented admin dashboard frontend using GET /api/admin/dashboard.
- Implemented admin cash handovers frontend with confirm, admin note edit, and void actions.
- Implemented admin supplier management frontend with create, edit, block, and unblock actions.
- Implemented admin supplier payment frontend with create, admin note edit, and void actions.
- Implemented admin user management frontend with create, block, and unblock actions.
- Implemented admin audit logs frontend table.
- Added frontend shared admin table/action components.
- Verified authenticated admin API checks for users, audit logs, and dashboard.
- Completed Step 12 demo polish.
- Added backend admin authorized receiver management APIs for list, create, edit, block, and unblock.
- Added audit logging for authorized receiver create/edit/block/unblock actions.
- Added admin authorized receiver management to the admin Users page.
- Replaced key admin note browser prompts with modal-style edit panels for cash handovers and supplier payments.
- Improved void/block confirmation wording for financial and master-data actions.
- Added development-only demo credentials display on the login page.
- Added shared Modal component and admin table empty-state support.
- Verified backend tests, frontend lint, and frontend build after polish.
- Added admin frontend editing for existing users, including name, email, username, phone, role, and optional password update.
- Fixed audit logging so password hashes are not stored when a user password is updated.
- Improved perceived speed by removing extra full-list refetches after finance note edits, admin handover actions, supplier actions, supplier payment actions, user actions, and receiver actions.
- Updated local frontend state directly from API responses after create/edit/block/unblock/void actions where possible.

## 3. Current step we are working on

Step 12: Demo polish.

Status: completed, with additional user-edit and responsiveness improvements completed afterward.

## 4. Important files changed recently

- project_goals.md
- project_state.md
- docs/setup.md
- backend/
- backend/composer.json
- backend/composer.lock
- backend/routes/api.php
- backend/app/Models/User.php
- backend/config/app.php
- backend/.env.example
- backend/.env
- backend/app/Http/Requests/.gitkeep
- backend/app/Http/Resources/.gitkeep
- backend/app/Services/.gitkeep
- backend/app/Policies/.gitkeep
- backend/database/migrations/0001_01_01_000000_create_users_table.php
- backend/database/migrations/2026_05_12_170000_create_authorized_receivers_table.php
- backend/database/migrations/2026_05_12_170100_create_suppliers_table.php
- backend/database/migrations/2026_05_12_170200_create_cash_handovers_table.php
- backend/database/migrations/2026_05_12_170300_create_supplier_payments_table.php
- backend/database/migrations/2026_05_12_170400_create_audit_logs_table.php
- backend/app/Models/AuthorizedReceiver.php
- backend/app/Models/CashHandover.php
- backend/app/Models/Supplier.php
- backend/app/Models/SupplierPayment.php
- backend/app/Models/AuditLog.php
- backend/database/factories/UserFactory.php
- backend/database/seeders/DatabaseSeeder.php
- docs/supabase.md
- backend/app/Http/Controllers/AuthController.php
- backend/app/Http/Requests/Auth/LoginRequest.php
- backend/app/Http/Resources/UserResource.php
- backend/app/Http/Middleware/EnsureUserIsActive.php
- backend/app/Http/Middleware/EnsureUserHasRole.php
- backend/bootstrap/app.php
- backend/routes/api.php
- backend/app/Http/Controllers/AuthorizedReceiverController.php
- backend/app/Http/Controllers/CashHandoverController.php
- backend/app/Http/Requests/CashHandovers/StoreFinanceCashHandoverRequest.php
- backend/app/Http/Requests/CashHandovers/UpdateFinanceCashHandoverNoteRequest.php
- backend/app/Http/Requests/CashHandovers/AdminUpdateCashHandoverRequest.php
- backend/app/Http/Resources/AuthorizedReceiverResource.php
- backend/app/Http/Resources/CashHandoverResource.php
- backend/app/Services/AuditLogService.php
- backend/app/Http/Controllers/SupplierController.php
- backend/app/Http/Controllers/SupplierPaymentController.php
- backend/app/Http/Requests/Suppliers/StoreSupplierRequest.php
- backend/app/Http/Requests/Suppliers/UpdateSupplierRequest.php
- backend/app/Http/Requests/SupplierPayments/StoreSupplierPaymentRequest.php
- backend/app/Http/Requests/SupplierPayments/UpdateSupplierPaymentRequest.php
- backend/app/Http/Resources/SupplierResource.php
- backend/app/Http/Resources/SupplierPaymentResource.php
- backend/app/Http/Controllers/DashboardController.php
- frontend/
- frontend/package.json
- frontend/package-lock.json
- frontend/src/app/layout.tsx
- frontend/src/app/globals.css
- frontend/src/app/page.tsx
- frontend/src/app/login/page.tsx
- frontend/src/app/admin/dashboard/page.tsx
- frontend/src/app/admin/cash-handovers/page.tsx
- frontend/src/app/admin/supplier-payments/page.tsx
- frontend/src/app/admin/suppliers/page.tsx
- frontend/src/app/admin/users/page.tsx
- frontend/src/app/admin/audit-logs/page.tsx
- frontend/src/app/finance/dashboard/page.tsx
- frontend/src/app/finance/new-handover/page.tsx
- frontend/src/app/finance/my-records/page.tsx
- frontend/src/components/AppShell.tsx
- frontend/src/components/PlaceholderPanel.tsx
- frontend/src/lib/navigation.ts
- frontend/src/lib/api.ts
- frontend/.env.local
- frontend/src/lib/auth-storage.ts
- frontend/src/lib/auth.tsx
- frontend/src/components/Providers.tsx
- frontend/src/components/ProtectedRoute.tsx
- frontend/src/types/index.ts
- frontend/src/styles/README.md
- frontend/src/lib/format.ts
- frontend/src/lib/api-shapes.ts
- frontend/src/components/StatusBadge.tsx
- frontend/src/components/StateBlock.tsx
- frontend/src/app/finance/dashboard/FinanceDashboardClient.tsx
- frontend/src/app/finance/new-handover/NewHandoverClient.tsx
- frontend/src/app/finance/my-records/MyRecordsClient.tsx
- backend/app/Http/Controllers/UserController.php
- backend/app/Http/Controllers/AuditLogController.php
- backend/app/Http/Requests/Users/StoreUserRequest.php
- backend/app/Http/Requests/Users/UpdateUserRequest.php
- backend/app/Http/Resources/AuditLogResource.php
- frontend/src/components/AdminTable.tsx
- frontend/src/app/admin/dashboard/AdminDashboardClient.tsx
- frontend/src/app/admin/cash-handovers/AdminCashHandoversClient.tsx
- frontend/src/app/admin/suppliers/AdminSuppliersClient.tsx
- frontend/src/app/admin/supplier-payments/AdminSupplierPaymentsClient.tsx
- frontend/src/app/admin/users/AdminUsersClient.tsx
- frontend/src/app/admin/audit-logs/AdminAuditLogsClient.tsx
- frontend/src/components/Modal.tsx
- frontend/src/app/login/DemoCredentials.tsx
- frontend/src/app/admin/users/AdminUsersClient.tsx
- frontend/src/app/finance/my-records/MyRecordsClient.tsx

## 5. Known bugs/issues still remaining

- frontend/ has been created and the auth flow is implemented.
- Finance frontend pages now load backend data and submit/update finance handovers.
- Admin frontend pages load backend data and support core actions.
- Admin authorized receiver management is implemented inside the admin Users page, not as a separate navigation page.
- Some admin edit flows are still simple for demo speed, especially supplier name editing. Cash handover and supplier payment admin-note edits now use modal panels.
- Backend Laravel skeleton exists, and core business APIs through dashboards are implemented.
- Laravel Sanctum login/logout/me endpoints are implemented.
- Business API endpoints for users, admin authorized receiver management, and audit logs are not implemented yet.
- Dashboard APIs are implemented but do not yet have dedicated feature tests.
- Cash handover, supplier, and supplier payment APIs are implemented but do not yet have dedicated feature tests.
- backend/ was created by Composer as its own Laravel project and currently includes its own .git directory from the Laravel scaffold.
- frontend/ was created by create-next-app and currently includes its own .git directory from the scaffold.
- Temporary protected status routes exist at /api/admin/status and /api/finance/status for checking role middleware.
- Frontend token storage currently uses sessionStorage for the demo. A production browser security review should consider httpOnly cookies or a BFF pattern later.
- Local demo responsiveness can still be affected by Supabase network latency and Next.js dev-mode overhead. Production builds and closer backend/database hosting should feel faster.

## 6. Next exact steps to continue

Next step is optional hardening and refinement before deployment/demo handoff.

Exact next actions:

1. Add richer modal forms for remaining admin edits such as supplier full details and user profile edits.
2. Add focused backend feature tests for auth, role guards, handover actions, supplier payments, and audit logs.
3. Add frontend integration/e2e tests for login and critical finance/admin workflows.
4. Review production auth storage strategy; sessionStorage is acceptable for this demo but httpOnly cookies or a BFF pattern should be considered for production.
5. Remove nested .git directories inside backend/ and frontend/ if this root project will become one repository.
6. Prepare deployment notes for Vercel frontend and Render/VPS backend.
7. Re-run php artisan test, npm run lint, and npm run build before any demo.

## 7. Any rules or decisions we must not forget

1. Admin is the boss.
2. Finance users can submit cash handovers.
3. Finance users cannot edit amount, date, time, or receiver after submission.
4. Finance users can edit only their own finance note.
5. Admin can confirm cash handovers.
6. Admin can edit records, but edits must be audited.
7. Admin can delete only by soft delete or void status.
8. Suppliers are not login users yet.
9. Admin can manage suppliers and supplier payments.
10. Family members are not users.
11. Family members and authorized receivers are selected from a dropdown.
12. Backend must enforce all permissions.
13. Frontend must be separate from backend.
14. Do not mix Laravel files into frontend.
15. Do not mix Next.js files into backend.
16. project_state.md must be updated after every major step.
17. Use Supabase PostgreSQL for the demo.
18. Use decimal(15,2) for money fields.
19. Use Asia/Colombo timezone where relevant.
20. Do not store passwords in plain text.
21. Do not expose database credentials in frontend.
22. Do not commit .env files.
23. Keep storage replaceable so Supabase Storage can later move to Cloudflare R2 or AWS S3.
24. Frontend may display totals, but backend must calculate official ledger totals and balances.
