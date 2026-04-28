# Vidhaata Ventures Real Estate + CRM

This project is a Vite + React frontend with a PHP + MySQL API. It can be deployed on Hostinger shared hosting because the production stack is:

- static frontend files from `dist/`
- PHP API from `api/`
- MySQL database

You do not deploy the Vite dev server to Hostinger.

## Local development

```bash
npm install
npm run dev
```

Frontend dev URL:

- `http://localhost:3000`

The frontend proxies API requests to:

- `http://localhost/estate-crm/api`

## Production build

```bash
npm run build
```

This creates the production frontend in `dist/`.

## Hostinger deployment

### 1. Build locally

Run:

```bash
npm run build
```

### 2. Upload files

In Hostinger shared hosting, use this structure:

```text
public_html/
  index.html
  assets/
  .htaccess
  api/
    .htaccess
    index.php
    config.php
    AuthController.php
    PropertyController.php
    LeadController.php
    AnalyticsController.php
    uploads/
      .htaccess
```

Upload:

- everything from `dist/` into `public_html/`
- the full local `api/` folder into `public_html/api/`

Important:

- the `public/.htaccess` file is copied into `dist/.htaccess` during build
- that file enables React route refresh support on shared hosting

### 3. Create the database

In Hostinger:

1. create a MySQL database
2. create a database user
3. import `database/schema.sql`

### 4. Update API database credentials

Edit:

- [`api/config.php`](api/config.php)

Set these values for production:

- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `JWT_SECRET`

If your Hostinger environment does not populate `$_ENV`, replace the defaults directly in `config.php`.

### 5. Make uploads writable

Ensure this folder exists and is writable:

- `public_html/api/uploads/`

Recommended:

- create the folder if it does not exist
- permission `755` or `775` depending on Hostinger setup

### 6. Test these URLs

After upload, test:

- `/`
- `/properties`
- `/properties/1` by refreshing directly on the page
- `/api/properties`
- `/login`

## Routing notes

### Frontend

The frontend is a React SPA. Direct refreshes on routes like:

- `/properties`
- `/properties/12`
- `/about`

work because of:

- [`public/.htaccess`](public/.htaccess)

### API

The PHP API routes are handled by:

- [`api/.htaccess`](api/.htaccess)

Examples:

- `/api/properties`
- `/api/properties/1`
- `/api/auth/login`

## Security notes

- uploaded files go into `api/uploads`
- executable scripts are blocked there by:
  - [`api/uploads/.htaccess`](api/uploads/.htaccess)
- change the default `JWT_SECRET` before production
- change the default admin password after importing the schema

## Deployment checklist

- [ ] `npm run build` completed
- [ ] `dist/` uploaded to `public_html/`
- [ ] `api/` uploaded to `public_html/api/`
- [ ] database imported from `database/schema.sql`
- [ ] production DB credentials updated in `api/config.php`
- [ ] `api/uploads` is writable
- [ ] direct page refresh works on `/properties` and `/properties/:id`
- [ ] login works at `/login`

## Notes

- This project is ready for root-domain deployment like `https://yourdomain.com/`
- If you want to deploy inside a subfolder instead of the root domain, the frontend base path and rewrite rules should be adjusted
