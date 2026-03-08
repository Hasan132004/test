# Smart Mobility Control (Vercel Ready)

This project contains:
- Frontend pages: `login.html` and `code.html`
- Backend API routes (Vercel Functions): `api/login.js`, `api/register.js`, `api/send-permission-code.js`, `api/status.js`, `api/emergency-stop.js`, `api/send-mode-table.js`

Default demo credentials:
- Login ID: `robot@123`
- Password: `robot@987`
- Emergency password: `STOP-402`

## Local Preview

Use Vercel CLI from this folder:

```powershell
vercel dev
```

Then open:
- `http://localhost:3000/` for login
- `http://localhost:3000/dashboard` for dashboard

If you don't want to log in to Vercel CLI, use the included local runner:

```powershell
copy .env.example .env
npm install
node local-dev-server.js
```

## Environment Variables (Vercel Project Settings)

Set these in Vercel:
- `APP_LOGIN_ID`
- `APP_LOGIN_PASSWORD`
- `MAIN_APPROVER_EMAIL`
- `MODE_REPORT_EMAIL` (optional; falls back to `MAIN_APPROVER_EMAIL`)
- `PERMISSION_CODE_TTL_MIN`
- `PERMISSION_COOKIE_SECRET`
- `PASSWORD_HASH_SALT`
- `GMAIL_SMTP_USER`
- `GMAIL_SMTP_APP_PASSWORD`
- `EMERGENCY_PASSWORD`
- `SESSION_SECRET`

You can copy values from `.env.example` and replace with secure production values.

## Mode Data PDF Email

1. Open Dashboard (`/dashboard`).
2. Enter a mail ID in the `Mail ID` field (optional).
3. Click `Send PDF Email`.
4. The system sends mode data as a table in the email body and as a PDF attachment.
5. If no mail ID is typed, it sends to `MODE_REPORT_EMAIL` (or `MAIN_APPROVER_EMAIL` fallback).

## Account Creation Approval Flow

1. Open `Create Account` on the login page.
2. Enter approver Gmail (`MAIN_APPROVER_EMAIL`) and click `Send Permission Code`.
3. Permission code is sent to the approver Gmail inbox.
4. Enter the code and submit registration.
5. If code/email is wrong or expired, account creation is denied.

## Deploy

```powershell
vercel
```

For production:

```powershell
vercel --prod
```
