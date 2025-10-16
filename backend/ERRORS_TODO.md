# Errors and Fix Suggestions

This file was auto-generated to list the current errors reported by the IDE/analysis and provide short remediation notes.

## Summary
The repository currently has a collection of type/typing, import-resolution, and SQLAlchemy model usage issues. Below are the captured problems (from tooling) and suggested fixes.

---

## 1) Import resolution errors
- Files reporting: `backend/app/api/shobeis.py` (multiple "could not be resolved"), `backend/app/api/shobeis.py` snapshot reporters.

Problems:
- `from app.utils.database import get_db` could not be resolved by analyzer.
- `from app.services.shobeis_service import ...` could not be resolved.
- `from app.api.auth import get_current_user, get_admin_user` could not be resolved.
- `from app.models.user import User` could not be resolved.

Possible causes & fixes:
- Ensure Python path includes the package root (the `backend` folder) when running analyzers and tests. Use a properly configured `PYTHONPATH` or install the package in editable mode (pip install -e .) or set `sys.path` in test runner.
- Verify there is an `__init__.py` at package roots. `backend/app/__init__.py` exists, so ensure your environment uses `backend` as the CWD or is installed.

Suggested remediation:
- In docker/venv/test tasks, run: `export PYTHONPATH=$(pwd)/backend` or use `pip install -e backend`.
- Confirm `backend/app` is importable (run a small python snippet to import the modules).

---

## 2) SQLAlchemy Column vs instance misuse and conditional checks
- Files: `backend/app/models/user.py`, `backend/app/api/shobeis.py`, `backend/tests/test_shobeis.py`.

Problems:
- Code uses SQLAlchemy `Column` objects (e.g., `Column[int]`, `Column[str]`) directly in boolean checks and arithmetic operations. SQLAlchemy column objects are descriptors on the model class; model instances have attribute values.
- Type checkers complain about `Column` types used like runtime values.

Example issues:
- `if current_user.monthly_refresh_amount:` where `monthly_refresh_amount` may be a Column on the class rather than an int on the instance.
- Passing `current_user.subscription_tier` (a Column) to functions expecting `str`.

Fixes:
- Ensure you operate on actual model *instances* (e.g., `user.monthly_refresh_amount`) and that the ORM is returning instances (not raw columns or query objects). In typed code, annotate model attributes properly or use `typing.cast` where necessary.
- Avoid boolean checks directly on SQLAlchemy column expressions in typed contexts; prefer explicit comparison `if current_user.monthly_refresh_amount is not None:` or `if bool(current_user.monthly_refresh_amount):` only when sure the attribute is a python value.

---

## 3) Type errors (Optional/None and Column types)
- Files: `backend/app/api/shobeis.py` lines around calls to `ShobeisTransaction.calculate_cost` and `ShobeisTransaction.create`.

Problems:
- Passing `Optional[int]` and `Optional[str]` to functions typed to accept `int`/`str`.
- Passing SQLAlchemy `Column[str]` to a function expecting `str` (likely due to wrong attribute access on the class rather than instance).

Fixes:
- Validate or coerce optional fields before passing: `word_count = req.word_count or 0` (if appropriate) or raise HTTP 400 when required.
- Ensure `user.subscription_tier` is a plain string (the instance attribute). If analyzer still thinks it's `Column[str]`, adjust model typing or cast: `str(current_user.subscription_tier)` or `cast(str, current_user.subscription_tier)`.

---

## 4) Stripe attribute error
- File: `backend/app/api/shobeis.py` line ~248
- Error: `"error" is not a known attribute of module "stripe"`

Fix:
- Use correct Stripe exceptions: `stripe.error.StripeError` is correct to catch base errors. If referencing `stripe.error` (module), ensure `import stripe` is present and the runtime Stripe package is installed.

---

## 5) Tests failures and assignments
- File: `backend/tests/test_shobeis.py` shows `db` possibly unbound and attempting to assign numeric values directly to SQLAlchemy Column attributes (e.g., `user.shobeis_balance = 1`) causing type-check complaints.

Fix:
- Ensure tests use a proper database fixture that yields a `db` Session object.
- Assign to instance attributes (which should be normal ints) after creating a user instance through ORM and committing when needed.

---

## 6) Misc type-checker issues in frontend
- Files: `frontend/src/types/shobeis.ts`, `frontend/src/components/dashboard/TransactionHistoryCard.tsx`.
- Problems: TS errors like "Expected 2-3 arguments, but got 1" and React typing mismatches.

Fixes:
- Open the corresponding files and correct the type signatures; ensure versions of TypeScript and React DOM types match. This is out-of-scope for Python run, but note it for frontend work.

---

## Quick actions you can take now
1. Export `PYTHONPATH` to include backend and run the tests to reproduce errors:

```bash
export PYTHONPATH=$(pwd)/backend
pytest -q
```

2. Create a venv and install requirements:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
pip install -e backend
```

3. Run the pro user creation script (next step in this task). If DB not configured, the script will fail and show which env vars are missing.

---

## Next steps (TODOs)
- Run `create_test_pro_user.py` and capture its output.
- Run `pytest tests/test_shobeis.py::test_create_shobeis_transaction` and capture failures.
- Start fixing the top-priority issues: PYTHONPATH/import resolution, then the SQLAlchemy Column misuse.

