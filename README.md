🎯 AI Content Detector — Project Structure (clean, accurate)
============================================================

Repository root: /ai-content-detector-v1.1
--------------------------------------------------
Notes------
1 - All services in this project are public and available to anonymous users by default.
2 - The landing page shows an input field so anyone can analyze content without logging in.
3 - Login is optional and only required for account features like saving history or purchasing subscriptions.


Frontend (React + TypeScript) — /frontend
--------------------------------------------------
📁 frontend/
    ├─ 📄 index.html                     # Vite HTML entry
    ├─ 📄 package.json                   # scripts: dev, build, preview, typecheck
    ├─ 📄 vite.config.ts                 # Vite config + alias (@ -> ./src)
    ├─ 📄 tailwind.config.js             # Tailwind content paths
    ├─ 📄 postcss.config.js              # PostCSS + autoprefixer
    ├─ 📄 tsconfig.json                  # TypeScript base config
    ├─ 📄 tsconfig.app.json              # App TS config used by `npm run typecheck`
    ├─ 📄 tsconfig.node.json             # Vite/node TS config
    └─ 📁 src/
            ├─ 📄 main.tsx                   # src/main.tsx — app bootstrap (React.StrictMode)
            ├─ 📄 App.tsx                    # src/App.tsx — providers, Router, Layout, Routes
            ├─ 📄 index.css                  # Tailwind entry
            ├─ 📄 vite-env.d.ts              # Vite type declarations
            +
            ├─ 📁 api/
            │   ├─ 📄 analysis.ts            # src/api/analysis.ts - analysisService
            │   ├─ 📄 auth.ts                # src/api/auth.ts - auth client helpers
            │   └─ 📄 subscription.ts        # src/api/subscription.ts - subscription client
            +
            ├─ 📁 components/
            │   ├─ 📄 Layout.tsx             # src/components/Layout.tsx - navigation + footer
            │   ├─ 📄 PrivateRoute.tsx       # src/components/PrivateRoute.tsx - auth guard
            │   ├─ 📁 features/
            │   │   └─ 📁 analysis/
            │   │       ├─ 📄 AnalysisForm.tsx
            │   │       ├─ 📄 AnalysisResults.tsx
            │   │       └─ 📄 ConfidenceIndicator.tsx
            │   └─ 📁 ui/
            │       ├─ 📄 Button.tsx         # src/components/ui/Button.tsx (uses @radix-ui/react-slot)
            │       ├─ 📄 Card.tsx
            │       ├─ 📄 Input.tsx
            │       ├─ 📄 Textarea.tsx
            │       └─ 📄 Loading.tsx
            +
            ├─ 📁 context/
            │   ├─ 📄 AuthContext.tsx        # src/context/AuthContext.tsx
            │   ├─ 📄 SubscriptionContext.tsx# src/context/SubscriptionContext.tsx
            │   └─ 📄 AnalysisContext.tsx    # src/context/AnalysisContext.tsx
            +
            ├─ 📁 hooks/
            │   ├─ 📄 useAuth.ts              # src/hooks/useAuth.ts
            │   ├─ 📄 useSubscription.ts      # src/hooks/useSubscription.ts
            │   └─ 📄 useAnalyzer.ts          # src/hooks/useAnalyzer.ts
            +
            ├─ 📁 lib/
            │   └─ 📄 api.ts                  # src/lib/api.ts - axios instance + interceptors
            +
            ├─ 📁 pages/
            │   ├─ 📄 HomePage.tsx            # src/pages/HomePage.tsx
            │   ├─ 📄 LoginPage.tsx           # src/pages/LoginPage.tsx
            │   ├─ 📄 DashboardPage.tsx       # src/pages/DashboardPage.tsx
            │   ├─ 📄 AnalyzePage.tsx         # src/pages/AnalyzePage.tsx
            │   ├─ 📄 HistoryPage.tsx
            │   ├─ 📄 PricingPage.tsx
            │   └─ 📄 SettingsPage.tsx
            +
            ├─ 📁 types/
            │   ├─ 📄 api.ts                 # src/types/api.ts
            │   ├─ 📄 context.ts             # src/types/context.ts
            │   └─ 📄 index.ts               # src/types/index.ts
            +
            └─ 📁 utils/
                    ├─ 📄 api.ts                 # src/utils/api.ts (error helpers)
                    └─ 📄 cn.ts                  # src/utils/cn.ts (clsx + twMerge)

Backend (FastAPI) — /backend
--------------------------------------------------
📁 backend/
    ├─ 📁 app/
    │   ├─ 📁 api/                      # expected: routes and endpoints (may be empty/partial)
    │   ├─ 📁 models/                   # expected: DB models
    │   ├─ 📁 utils/                    # expected: helpers
    │   └─ 📄 main.py                   # backend/app/main.py — FastAPI app entry (CORS configured)
    └─ 📄 requirements.txt              # backend/requirements.txt

Top-level files
--------------------------------------------------
    • .env                               # (not committed) environment variables
    • .gitignore
    • README.md
    • project-structure.txt              # (this file)

Quick notes (observations & recent fixes)
--------------------------------------------------
• Runtime bug: React crashed at render due to Radix `Slot` expecting a single child.
    - Root cause: `Button` used with `asChild` while the wrapped `Link` included text + <span>, creating multiple child nodes.
    - Fix applied: `frontend/src/pages/HomePage.tsx` — replaced `Button asChild` + `Link` pattern with `Link` wrapping `Button`.

• Providers: `src/App.tsx` composes providers in this order:
    AuthProvider → SubscriptionProvider → AnalysisProvider → Layout → Routes

How to run (frontend)
--------------------------------------------------
1) cd frontend
2) npm install
3) npm run dev

How to run backend (dev)
--------------------------------------------------
1) cd backend
2) python -m venv .venv && source .venv/bin/activate
3) pip install -r requirements.txt
4) uvicorn app.main:app --reload --port 8000

Recommended next steps
--------------------------------------------------
1. Add a React Error Boundary to `src/App.tsx` to avoid full white screens for render-time exceptions.
2. Optionally run `npm run typecheck` (in `frontend`) to surface TypeScript errors: `cd frontend && npm run typecheck`.
3. Start the dev server and open browser console; if you want I can run it and report back.

If you want the file adjusted (different icons, more/less verbosity, or markdown-style), tell me which style you prefer and I'll update it.