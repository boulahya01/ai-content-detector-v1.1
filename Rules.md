Project Rules & Quick Recovery Guide

Purpose
-------
This file documents the key runtime configuration choices, conventions and troubleshooting steps used in this repo. Use it as a single source of truth to quickly restore or re-apply the fixes we made during the migration and auth/analysis debugging.

Environment variables
---------------------
Backend (.env):
- JWT_SECRET_KEY=
- JWT_REFRESH_SECRET_KEY=
- DATABASE_URL= (e.g., sqlite:///./backend.db for local dev)
- SMTP_HOST= (optional)
- SMTP_PORT=
- SMTP_USER=
- SMTP_PASSWORD=
- FRONTEND_URL= (frontend production host)

Frontend (.env):
- VITE_API_URL - the frontend base API URL. Best practices:
  - For local dev set to `http://localhost:8000` (not including `/api`).
  - If provided with a trailing `/api`, frontend code strips `/api` and still works.
- VITE_JWT_EXPIRES_IN=24h
- VITE_REFRESH_TOKEN_EXPIRES_IN=30d

Axios / Client rules
--------------------
- The client (`frontend/src/lib/api.ts`) normalizes VITE_API_URL by removing a trailing `/api` so service modules include `/api/...` paths and avoid `/api/api/...` duplication.
- The request interceptor does NOT attach Authorization headers for auth endpoints: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/google`.
- The response interceptor retries on network errors and attempts token refresh on 401 responses. If refresh fails, token is removed and user redirected to `/login`.
- When changing baseURL behavior, log the computed base URL in the browser console (`API Base URL:`) for quick verification.

Auth rules & quick checks
-------------------------
- Login endpoint expects `application/x-www-form-urlencoded` fields `username` (email) and `password`. Use the provided `frontend/src/api/auth.ts` helper which posts form data.
- Stored token key: `access_token` in localStorage. Clear with `localStorage.removeItem('access_token')` when debugging.
- Quick curl login test (local dev):
  curl -i -X POST http://127.0.0.1:8000/api/auth/login \
    -d "username=cli_test_user@example.com&password=StrongPass1!" \
    -H "Content-Type: application/x-www-form-urlencoded"
- After receiving a token, verify `/api/auth/me`
  curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/api/auth/me

Database & migrations
---------------------
- Alembic migrations: keep the migrations/versions folder in sync. If you need a clean start:
  1. Backup existing SQLite file(s)
  2. Run the restored initial migration scripts
  3. Use `backend/create_cli_user.py` to re-create the CLI test user

CLI test user
-------------
- Script: `backend/create_cli_user.py`
- Defaults:
  - EMAIL: cli_test_user@example.com
  - PASSWORD: StrongPass1!
- Use it for quick login testing; it creates a user with balances to run analysis.

WebSocket rules
---------------
- WebSocket manager (`frontend/src/lib/websocket.ts`) constructs WS URL from normalized API host, stripping `/api` when building the ws path so the URL becomes e.g. `ws://localhost:8000/ws/analysis`.
- Server currently mounts analysis WebSocket on `/ws/analysis` (root). If you change router prefixes, update the normalize/constructor accordingly.
- If progress messages are not received, check:
  - That the socket opened (network tab > WS shows CONNECT)
  - The WS URL used by the app (console.log the wsBase in the manager)
  - Server logs for WS errors

Analyzer & model errors
-----------------------
- If the backend logs show TypeError in `AIContentAnalyzer._load_model() takes 1 positional argument but 2 were given`:
  - Inspect `backend/app/models/analyzer.py` and ensure `_load_model(self, model_name)` signature matches usage.
  - Restart the backend after fixes (the analyzer loader is often invoked lazily and errors appear when first used).

Common troubleshooting checklist
-------------------------------
1. Is the backend running? `ps aux | grep uvicorn` or visit `http://localhost:8000/`.
2. Is the frontend dev server running? (default Vite port `5173`).
3. Clear stale tokens: `localStorage.removeItem('access_token')` in browser console.
4. Verify `VITE_API_URL` (open devtools console and check for `API Base URL:` log).
5. Check failing request in DevTools Network tab (copy full Request URL and Response body) and compare to `curl` working cases.
6. If network errors (no response): suspect proxy/dev server misrouting or CORS. Confirm allowed CORS origins in `backend/app/utils/settings.py`.
7. If an endpoint returns 500: open backend logs in `backend/logs/` and inspect stack trace.

Git & backups
--------------
- Before making large style/visual changes, create a branch to preserve current fixes:
  git checkout -b feat/ui-styles-preserve-auth-fixes
- Tag the current commit if you prefer a lightweight bookmark:
  git tag -a pre-ui-styles-fixes -m "Preserve auth/analyze fixes before UI changes"

Developer workflow notes
------------------------
- When you change `VITE_API_URL` or any frontend env var, restart the dev server so Vite picks up the new env values.
- When changing API path behavior, update both:
  - `frontend/src/lib/api.ts` (baseURL normalization)
  - Any client calls that include `/api/...` to keep consistency (the project prefers explicit `/api/...` in service calls).

If you fall back
----------------
- Use the above curl commands to verify the backend is healthy.
- Re-run `backend/create_cli_user.py` if you need a known test user.
- Revert `frontend/src/lib/api.ts` or checkout the `pre-ui-styles-fixes` tag/branch to restore working behavior.

Contact notes
-------------
- This file is intended to be a living document. Update it with any new fix you rely on while applying UI changes.

-- End of Rules.md
