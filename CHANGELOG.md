# Changelog

All notable changes to this project will be documented in this file.

## v0.1.1 - 2025-10-06
- Added a simple login form to `passive-optical-lan-designer/frontend/src/App.tsx` that calls `POST /api/auth/login`.
- Exposed `GET /api/health` in the backend scaffold for smoke checks.
- Updated root `tsconfig.json` to exclude subprojects (`passive-optical-lan-designer`, `new-app`) to fix TypeScript build conflicts when building the original app.
- Verified original app runs at `http://localhost:5173/` and scaffold app runs at `http://localhost:5180/`.

## v0.1.0 - 2025-10-06
- Initial baseline running app with seeded admin user `admin@noorao.designer`.
- Docker Compose services for frontend and backend with Nginx proxying `/api`.