# Lumina LMS MVP (Course-based)

A runnable MVP Learning Management System with Node.js/Express + Prisma + Postgres and a Next.js App Router frontend.

## Requirements
- Node.js 20+
- pnpm 9+
- Docker

## Setup
```bash
docker compose up -d
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Frontend: http://localhost:3000  
API: http://localhost:4000

## Sample Credentials (Seed)
- Admin: `admin@lumina.dev` / `Password123!`
- Instructor: `instructor@lumina.dev` / `Password123!`
- Student: `student1@lumina.dev` / `Password123!`

## API Notes
- Access tokens are returned in the login response and stored in local storage by the UI.
- Refresh tokens rotate via httpOnly cookie `lms_refresh`.
- Password reset tokens are logged to the API console.

## Screenshots
- Placeholder: add screenshots for dashboard, course list, and course detail.

## Scripts
```bash
pnpm dev       # Run API + web apps
pnpm db:migrate
pnpm db:seed
pnpm test
```

## File Uploads
Uploads are stored locally in `apps/api/uploads`. Allowed types: pdf/doc/docx/png/jpg. Max size 10MB.
