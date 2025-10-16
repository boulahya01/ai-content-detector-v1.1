SHOBEIS — Design and Implementation Plan

Overview
--------
This document defines the "N Shobeis" virtual currency system for the ai-content-detector project. It is a design-only doc: no code changes here. Follow this plan when implementing backend migrations, API endpoints, services, and frontend React state.

Goals
-----
- Provide a single, auditable currency to measure and charge for user consumption across analyses, file uploads, exports, and API usage.
- Keep pricing deterministic and configurable via a `pricing_table` in the DB.
- Use React Context + reducer on the frontend for optimistic UI updates and live balance management.

High-level Components
---------------------
1. Backend schema (DB): new columns on `users`, new `shobeis_transactions` table, new `pricing_table`.
2. Service layer: atomic operations for `estimate_cost`, `charge`, `allocate_monthly`, `refund`.
3. API layer: endpoints to query balance, estimate and charge, history, pricing, purchase/top-up, admin adjustments.
4. Frontend: `ShobeisProvider` (React Context), `useShobeis()` hook, optimistic transaction queue, BalanceBadge, TransactionList.

Files to change/implement (suggested)
-------------------------------------
Backend (backend/app/...)
- `migrations/versions/xxxx_add_shobeis_columns.py` — add user columns: `shobeis_balance`, `shobeis_total_allocated`, `shobeis_rollover`, `shobeis_last_allocation_at`, `subscription_plan`.
- `migrations/versions/xxxx_create_shobeis_transactions.py` — create `shobeis_transactions` table and indexes.
- `migrations/versions/xxxx_create_pricing_table.py` — create `pricing_table`.
- `app/models/user.py` — add new fields (ORM mapping) and convenience properties.
- `app/models/shobeis_transaction.py` — SQLAlchemy model for transactions.
- `app/models/pricing.py` — SQLAlchemy model for pricing table.
- `app/services/shobeis_service.py` — core functions: `estimate_cost`, `charge`, `allocate_for_subscription`, `refund`.
- `app/api/shobeis.py` — routing and request validation for Shobeis endpoints.
- `app/utils/pricing.py` — helper for loading pricing rules and computing base costs.
- `backend/reset_database.py` or seed scripts — seed `pricing_table` with defaults, seed test SHB for dev/test users.

Frontend (frontend/src/...)
- `src/context/ShobeisContext.tsx` — provider & reducer for balance and transactions.
- `src/hooks/useShobeis.ts` — hook wrapper to call API + provide utilities (estimate, charge, topUp, history).
- `src/api/shobeis.ts` — client-side API wrappers (getBalance, estimate, charge, history, pricing).
- `src/components/BalanceBadge.tsx` — small UI element showing balance and alerts.
- `src/components/TransactionList.tsx` — paginated transaction history UI.
- `src/pages/DashboardPage.tsx` — show balance, recent transactions, low-balance CTA.

Configuration & docs
- `docs/SHOBEIS.md` (this file)
- `.env` config entries: `SHOBEIS_USD_RATE=100` (1 USD = 100 SHB default)

Design Details (summary)
------------------------
Currency:
- Integer-only SHB units.
- Server uses integer arithmetic and `ceil` rounding to avoid microfractions.

Pricing:
- Stored in `pricing_table` as base_shobeis per unit.
- Analysis priced per 500 words bucket.
- Tier discount multipliers in configuration: free=1.0, basic=0.9, pro=0.7, enterprise=custom.

Transactions:
- Immutable rows; every change (allocation, charge, refund, bonus) is a transaction.
- Each transaction stores `balance_before` and `balance_after` for audit.

API flow:
- `estimate` endpoint returns a breakdown and cost.
- `charge` endpoint is authoritative (server recomputes cost), uses idempotency keys, and updates transactions.
- `allocate` runs at subscription renewal and records allocation transactions.

Frontend:
- Centralized `ShobeisContext` with reducer for consistency and optimistic updates.
- Use idempotency keys for charge requests.
- Reconcile optimistic changes with server responses and fallback on failure.
- Polling/WebSocket for allocation events and admin adjustments.

Next steps
----------
1. Finalize pricing numbers & USD->SHB rate.
2. Implement backend migrations and the `shobeis_service` logic.
3. Implement API endpoints and seed pricing table.
4. Implement frontend provider & components.
5. QA: unit tests + integration tests.

Contact
-------
If you want I can implement the backend migrations and service skeleton next, or generate the frontend context skeleton. Which do you want me to start with?