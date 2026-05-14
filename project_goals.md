# Cash Custody Portal - Project Goals

## System Purpose

Cash Custody Portal is a secure cash ledger and custody management web portal for tracking company cash received from finance users, cash held by the boss/admin, and cash paid out to suppliers.

The system must provide a clear, auditable view of:

- Cash coming in from finance users
- Cash going out to suppliers
- Current cash balance
- Daily, weekly, and monthly summaries
- Pending and confirmed handovers
- Admin confirmations
- Finance notes
- Admin notes
- User activity
- Audit logs
- Record corrections

This is a financial ledger system. Financial records must not be physically deleted from the database. Admin delete actions must be handled as soft deletes or void/cancelled statuses, and important actions must be written to audit logs.

## Main Roles

### Admin / Boss

The admin is the company owner or boss.

Admin users can:

- View all system data
- Create, edit, block, and unblock users
- Manage finance users
- Manage suppliers
- Manage authorized receivers
- View all finance cash handover records
- Confirm finance cash handover records
- Edit finance cash handover records when corrections are needed
- Add admin notes to finance records
- Create supplier payment records
- Edit supplier payment records
- Void or soft-delete records
- View dashboard analytics
- View cash balance
- View audit logs
- Generate reports later

### Finance User

Finance users submit daily cash handover records.

Finance users can:

- Login using username/email and password
- Submit cash handover records
- See their own submitted records
- See the status of their own records
- See admin notes on their own records
- Edit only their own finance note after submission

Finance users cannot:

- Edit amount, date, time, or receiver after submission
- Delete records
- Confirm records
- View supplier payments
- View the full cash balance
- View other finance users' records
- Manage users
- Access admin routes

### Suppliers

Suppliers are not login users for now.

Supplier management must be available from the admin side, but no supplier login portal is needed in the current scope.

### Authorized Receivers / Family Members

Family members are not users.

They should appear only in an authorized receivers dropdown in the finance cash handover form.

Examples:

- Boss
- Boss's wife
- Family member
- Authorized person

## Main Workflows

### Finance Cash Handover Workflow

1. Finance user logs in.
2. Finance user opens the Add Cash Handover form.
3. The form contains:
   - Date
   - Time
   - Amount
   - Handed to whom
   - Handed by
   - Finance note
4. The system auto-fills where possible:
   - Date = current date
   - Time = current time
   - Handed by = logged-in finance user
5. Finance user selects the receiver from the authorized receivers dropdown.
6. Finance user submits the handover.
7. The handover status becomes pending.
8. Finance user can later edit only their own finance note.
9. Admin can view the record.
10. Admin can confirm the record.
11. Admin can edit or correct the record if needed.
12. Admin can add an admin note.
13. Finance user can see the status and admin note.

Cash handover statuses:

- pending
- confirmed
- voided

### Admin Cash Handover Workflow

Admin users can:

- View all handovers
- Filter and inspect handover records
- Confirm pending handovers
- Edit handovers when corrections are needed
- Add admin notes
- Void handovers instead of physically deleting them
- View related audit logs

If an admin edits a confirmed record, the system must log both old values and new values in audit logs.

### Supplier Payment Workflow

Supplier login is not needed now.

Admin creates and manages supplier records, then creates supplier payment records.

Supplier payment form should contain:

- Date
- Time
- Supplier
- Amount
- Purpose / description
- Invoice number optional
- Received by optional
- Admin note optional
- Payment status

After a supplier payment is created:

- It reduces the ledger cash balance
- It appears in dashboard analytics
- Admin can edit it
- Admin can void or soft-delete it
- Every important change must be logged

Supplier payment statuses:

- paid
- voided

## Financial Rules

- Do not physically delete financial records.
- Use soft deletes or void/cancelled status for admin delete actions.
- Every edit, confirmation, void, user block, user unblock, and important action must be recorded in audit_logs.
- Approved or confirmed records should be protected.
- If admin edits a confirmed record, log old values and new values.
- Backend must calculate authoritative cash balance and dashboard totals.
- Frontend may display dashboard data, but it must not be the only place where official totals are calculated.

## Demo Stack

Frontend:

- Next.js
- TypeScript
- Tailwind CSS

Backend:

- Laravel API
- Laravel Sanctum

Database:

- Supabase PostgreSQL

Storage:

- Supabase Storage for demo
- Backend should be structured so storage can later move to Cloudflare R2 or AWS S3

Deployment later:

- Frontend on Vercel
- Backend on Render or VPS
- Database on Supabase PostgreSQL

## Final Production Stack

Frontend:

- Next.js
- TypeScript
- Tailwind CSS

Backend:

- Laravel API

Database:

- PostgreSQL

Storage:

- Cloudflare R2 or AWS S3 private bucket

Hosting:

- Ubuntu VPS with Nginx, or managed hosting

Security:

- Cloudflare DNS
- HTTPS
- Role-based permissions
- Audit logs
- Backups
- Soft deletes
- Secure authentication

## Required Root Folder Structure

```text
cash-custody-portal/
├── frontend/
│   └── Next.js frontend application
├── backend/
│   └── Laravel API backend application
├── docs/
│   ├── setup.md
│   └── future documentation, database notes, deployment notes
├── project_goals.md
└── project_state.md
```

## Required Frontend Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── cash-handovers/
│   │   │   ├── supplier-payments/
│   │   │   ├── suppliers/
│   │   │   ├── users/
│   │   │   └── audit-logs/
│   │   └── finance/
│   │       ├── dashboard/
│   │       ├── new-handover/
│   │       └── my-records/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── styles/
```

Frontend requirements:

- Clean professional dashboard UI
- Tailwind CSS
- TypeScript
- Reusable components
- Responsive layout
- Sidebar for admin
- Sidebar or top navigation for finance
- KPI cards
- Tables for records
- Forms with validation
- Status badges

## Required Backend Structure

```text
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   ├── Services/
│   └── Policies/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── config/
```

Backend requirements:

- Laravel API style
- Laravel Sanctum
- Laravel migrations
- Laravel seeders
- Laravel Form Requests
- Laravel Policies or middleware for role permissions
- Laravel Resources for API responses
- PostgreSQL-compatible migrations
- Decimal money fields using decimal(15,2)
- Asia/Colombo timezone where relevant

## Core Database Tables

### users

- id
- name
- email
- username
- password
- role
- status
- phone optional
- last_login_at optional
- created_at
- updated_at
- deleted_at

Roles:

- admin
- finance

Statuses:

- active
- blocked

### authorized_receivers

- id
- name
- relationship_or_role
- is_active
- created_at
- updated_at
- deleted_at

### cash_handovers

- id
- handover_code
- handover_date
- handover_time
- amount
- handed_by_user_id
- handed_to_receiver_id
- finance_note
- admin_note
- status
- confirmed_by_user_id
- confirmed_at
- created_at
- updated_at
- deleted_at

### suppliers

- id
- supplier_code
- name
- contact_person optional
- phone optional
- email optional
- address optional
- status
- created_at
- updated_at
- deleted_at

Statuses:

- active
- blocked

### supplier_payments

- id
- payment_code
- payment_date
- payment_time
- supplier_id
- amount
- purpose
- invoice_number optional
- received_by optional
- admin_note optional
- status
- created_by_user_id
- created_at
- updated_at
- deleted_at

Statuses:

- paid
- voided

### audit_logs

- id
- user_id
- action
- module
- record_type
- record_id
- old_values json nullable
- new_values json nullable
- ip_address nullable
- user_agent nullable
- created_at

Audit logs must record:

- login
- logout
- cash handover created
- cash handover confirmed
- cash handover edited
- cash handover voided
- supplier created
- supplier edited
- supplier blocked
- supplier payment created
- supplier payment edited
- supplier payment voided
- user created
- user edited
- user blocked
- user unblocked

## API Endpoint Plan

### Auth

- POST /api/login
- POST /api/logout
- GET /api/me

### Finance Cash Handovers

- GET /api/finance/cash-handovers
- POST /api/finance/cash-handovers
- PATCH /api/finance/cash-handovers/{id}/note

### Admin Cash Handovers

- GET /api/admin/cash-handovers
- GET /api/admin/cash-handovers/{id}
- PATCH /api/admin/cash-handovers/{id}
- POST /api/admin/cash-handovers/{id}/confirm
- POST /api/admin/cash-handovers/{id}/void

### Authorized Receivers

- GET /api/authorized-receivers
- GET /api/admin/authorized-receivers
- POST /api/admin/authorized-receivers
- PATCH /api/admin/authorized-receivers/{id}
- POST /api/admin/authorized-receivers/{id}/block
- POST /api/admin/authorized-receivers/{id}/unblock

### Suppliers

- GET /api/admin/suppliers
- POST /api/admin/suppliers
- PATCH /api/admin/suppliers/{id}
- POST /api/admin/suppliers/{id}/block
- POST /api/admin/suppliers/{id}/unblock

### Supplier Payments

- GET /api/admin/supplier-payments
- POST /api/admin/supplier-payments
- PATCH /api/admin/supplier-payments/{id}
- POST /api/admin/supplier-payments/{id}/void

### Dashboard

- GET /api/admin/dashboard?period=today
- GET /api/admin/dashboard?period=week
- GET /api/admin/dashboard?period=month
- GET /api/finance/dashboard

### Audit Logs

- GET /api/admin/audit-logs

## Dashboard Requirements

### Admin Dashboard

Admin dashboard must show:

- Today's Cash In
- Today's Supplier Payments
- Current Cash Balance
- Pending Cash Handovers
- Total Cash In
- Total Cash Out
- Average Daily Cash In
- Average Daily Cash Out
- Maximum Cash In for selected period
- Minimum Cash In for selected period

Filters:

- Today
- This week
- This month
- Custom date range later

Charts:

- Line graph: Daily Cash In vs Daily Cash Out
- Bar chart: Finance user wise cash handovers
- Bar chart: Supplier wise payments

### Finance Dashboard

Finance dashboard must show:

- My submitted handovers count
- My pending handovers
- My confirmed handovers
- My total submitted amount for current month
- Recent handover records

## Security Rules

- Do not store passwords in plain text.
- Use Laravel password hashing.
- Use Laravel Sanctum.
- Use middleware to protect routes.
- Use role-based authorization.
- Backend must enforce all permissions.
- Frontend permission hiding alone is not enough.
- Blocked users cannot login.
- Finance users cannot access admin routes.
- Admin-only actions must be protected on backend.
- Do not expose database credentials in frontend.
- Use .env files.
- Do not commit .env files.
- Do not physically delete financial records.
- Use soft deletes or void status.
- Write audit logs for important actions.

## Important Decisions Not To Forget

1. Admin is the boss.
2. Finance users can submit cash handovers.
3. Finance users cannot edit amount, date, time, or receiver after submission.
4. Finance users can edit only their note.
5. Admin can confirm handovers.
6. Admin can edit records, but edits must be audited.
7. Admin can delete only by soft delete or void.
8. Suppliers are not login users yet.
9. Admin can manage suppliers and supplier payments.
10. Family members are not users.
11. Family members and authorized receivers are selected from a dropdown.
12. Backend must enforce all permissions.
13. Frontend must be separate from backend.
14. project_state.md must be updated after every major step.
15. Use Supabase PostgreSQL for the demo.
16. Keep the system easy to migrate later to VPS PostgreSQL, Cloudflare R2, and production hosting.
