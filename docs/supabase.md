# Supabase Setup Notes

## Purpose

The demo database for Cash Custody Portal will use Supabase PostgreSQL.

Laravel is the only application layer that should connect to Supabase using database credentials. Do not place Supabase database credentials in the Next.js frontend.

## What To Do In Supabase

1. Create a new Supabase project.
2. Choose a strong database password and save it securely.
3. Wait until the project finishes provisioning.
4. Open Project Settings > Database.
5. Copy the PostgreSQL connection details for Laravel:
   - Host
   - Port
   - Database name
   - User
   - Password
6. Put those values in backend/.env.

Recommended backend/.env shape:

```text
DB_CONNECTION=pgsql
DB_HOST=your-supabase-db-host
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-database-password
```

If Supabase provides a pooler connection string, keep the direct database connection for migrations when possible. The pooler can be useful later for runtime traffic, but direct connection is usually simpler for Laravel migrations.

## After Credentials Are Added

From the backend folder, run:

```powershell
php artisan migrate
php artisan db:seed
```

For a fresh demo reset later, use:

```powershell
php artisan migrate:fresh --seed
```

Only run fresh reset commands when it is safe to erase demo data.

## Security Rules

- Do not commit backend/.env.
- Do not paste database passwords into frontend/.env.
- Do not use the Supabase service role key in frontend code.
- Keep production and demo credentials separate.
- Use Laravel migrations as the source of truth for schema changes.
- Use Laravel seeders for demo data.

## Supabase Storage

Storage is not needed for Step 3.

Later, if attachments or receipts are added:

1. Create a private Supabase Storage bucket.
2. Access it only through the Laravel backend.
3. Keep the backend storage service replaceable so it can move to Cloudflare R2 or AWS S3.
