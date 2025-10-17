# AI Content Detector - Rules & Error Prevention Guide

## 1. Project Structure & Import Rules
- Always run tests with correct PYTHONPATH:
  ```bash
  PYTHONPATH=backend pytest backend/tests -v
  # OR from backend directory:
  PYTHONPATH=. pytest tests -v
  ```
- Ensure virtual environment is activated:
  ```bash
  source backend/venv/bin/activate
  ```
- Use absolute imports in tests:
  ```python
  from app.main import app
  from app.models.user import User
  ```

## 2. Database & Model Rules
### User Model
- Use Enum classes for types, but store as strings in database:
  ```python
  class UserType(enum.Enum):
      FREE = "FREE"
      BASIC = "BASIC"
      PRO = "PRO"
      ENTERPRISE = "ENTERPRISE"
  
  user_type = Column(String(20), default=UserType.FREE.value)
  ```
- Required fields for User:
  - id (String, UUID)
  - email (String(255), unique, indexed)
  - password_hash (String(255))
  - user_type (String(20), defaults to FREE)
  - subscription_status (String(20), defaults to INACTIVE)
  - shobeis_balance (Integer, defaults to 50)
  - bonus_balance (Integer, defaults to 0)
  - monthly_refresh_amount (Integer, defaults to 0)

### Transaction Model
- Required fields:
  - id (String UUID)
  - user_id (ForeignKey)
  - amount (Integer)
  - transaction_type (Enum TransactionType)
  - balance_before (Integer)
  - balance_after (Integer)
  - status (Enum TransactionStatus)
  - meta (JSON, nullable, named 'metadata' in DB)
  - created_at (DateTime with server_default)

### Critical Model Rules
- Always use string-based UUIDs for IDs
- Use proper SQLAlchemy relationships:
  ```python
  class User(Base):
      transactions = relationship("ShobeisTransaction", back_populates="user", lazy="dynamic")
      analytics = relationship("UserAnalytics", back_populates="user", lazy="dynamic")
  ```
- Include balance check constraints:
  ```python
  __table_args__ = (
      CheckConstraint('shobeis_balance >= 0'),
      CheckConstraint('bonus_balance >= 0'),
  )
  ```
- Use hybrid_property for computed fields:
  ```python
  @hybrid_property
  def full_name(self) -> str:
      first = str(self.first_name or "")
      last = str(self.last_name or "")
      return f"{first} {last}".strip() or str(self.email)
  ```

### Transaction Rules
- Always update balances using ShobeisTransaction.create()
- Never modify user.shobeis_balance directly
- Always use with_for_update() when querying users for balance changes
- Use idempotency_key for duplicate prevention
- Store all transaction metadata in meta JSON field

## 3. API Response Format Rules
### Balance Endpoint (/api/shobeis/balance)
Response format:
```python
{
    "balance": int,  # Current shobeis_balance
    "bonus": int,    # Current bonus_balance
    "user_type": str,  # FREE, BASIC, PRO, ENTERPRISE
    "monthly_refresh_amount": int  # 1000 for PRO, 0 for others
}
```

### Estimate Endpoint (/api/shobeis/estimate)
Request format:
```python
{
    "action_type": str,  # Required
    "quantity": int      # Optional, defaults to 1
}
```
Response format:
```python
{
    "cost": int,
    "action_type": str,
    "quantity": int
}
```

### Charge Endpoint (/api/shobeis/charge)
Request format:
```python
{
    "action_type": str,        # Required
    "quantity": int,           # Optional, defaults to 1
    "idempotency_key": str    # Optional, for duplicate prevention
}
```
Response format:
```python
{
    "transaction_id": str,
    "balance": int,
    "amount": int,
    "balance_before": int,
    "balance_after": int
}
```

### Transactions Endpoint (/api/shobeis/transactions)
Parameters:
- limit: int (default: 50)
- offset: int (default: 0)

Response format:
```python
{
    "transactions": [
        {
            "id": str,          # UUID
            "amount": int,      # Absolute value
            "created_at": str,  # ISO format datetime
            "description": str,
            "transaction_type": str,  # CHARGE, REFUND, etc.
            "status": str,      # completed, pending, etc.
            "meta": dict       # Additional transaction data
        }
    ]
}
```

### Purchase Endpoint (/api/shobeis/purchase)
Request format:
```python
{
    "amount": int,
    "payment_method_id": str,
    "currency": str     # Optional, defaults to "USD"
}
```
Response format:
```python
{
    "success": bool,
    "new_balance": int,
    "transaction_id": str,
    "shobeis_amount": int
}
```
```

## 4. Authentication & User Type Rules
- User types must be uppercase strings: "FREE", "BASIC", "PRO", "ENTERPRISE"
- When creating users, convert enum to string:
  ```python
  user_type = UserType.FREE.value  # Returns "FREE" string
  ```
- Store user_type as string in database
- Compare user_type as string in tests

## 5. Common Error Prevention
### Registration Errors (500)
- Ensure user_type is string, not enum
- Set full_name instead of first_name/last_name
- Initialize balance fields to 0.0

### Transaction Errors
- Use correct endpoint paths:
  - /api/shobeis/shobeis/balance (not /api/shobeis/balance)
  - /api/shobeis/shobeis/transactions (not /api/shobeis/transactions)
  - /api/shobeis/shobeis/charge (for creating transactions)

### Test Assertions
- Match exact API response structure
- Use correct field names:
  - 'balance' not 'shobeis_balance'
  - 'id' not 'transaction_id'

## 6. Future-Proofing Rules
### Deprecation Warnings
- Replace datetime.utcnow() with datetime.now(UTC)
- Use sqlalchemy.orm.declarative_base()
- Ensure test functions return None

## 7. Security Rules
- Implement rate limiting for all endpoints

## 8. Database Configuration & Testing Rules

### Database Setup
```python
# Environment configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///./backend.db')

# SQLite specific settings
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### Model Import Order
Always import models in dependency order:
1. User and enums
2. BlacklistedToken
3. ShobeisTransaction
4. PricingTable
5. UserAnalytics

### Test Environment
- Use in-memory SQLite for tests (`sqlite:///:memory:`)
- Set DATABASE_URL before any imports
- Include required config in conftest.py:
```python
import os
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
```

### Test Data Setup
- Seed test users with known credentials
- Initialize pricing table data
- Reset database state between tests
- Use fixtures for common setup:
```python
@pytest.fixture(scope="function")
def test_user(db: Session):
    return db.query(User).filter(
        User.email == "pro.test@aidetector.com"
    ).first()
```

### Session Management
- Use context manager pattern for sessions
- Always close sessions after use
- Handle session cleanup in fixtures
- Use with_for_update() for balance changes
- Use secure token storage


## 6. Future-Proofing Rules
### Deprecation Warnings & Modernization
- Replace all `datetime.utcnow()` with `datetime.now(UTC)` for timezone-aware timestamps
- Use `sqlalchemy.orm.declarative_base()` for model base class
- Ensure test functions return None
- Always update rules when fixing deprecation warnings or modernizing code
- Reset database state between tests

## 11. Error Handling Rules
- Catch and log all unexpected exceptions (never expose stack traces to users)
- Use custom error classes for predictable errors (e.g., ValidationError, AuthError, InsufficientShobeisError)
- Always return appropriate HTTP status codes (400 for bad request, 401 for unauthorized, 404 for not found, 422 for validation error, 500 for server error)
- For background jobs, always log errors and send alerts for failures
- Document common error codes and their meanings in the rules file
- When fixing errors, update this file with the cause and solution
- Test edge cases

## 13. How to Use This File
- Treat this file as a living document: update it every time a new error is fixed or a new rule is learned
- Use it for onboarding new team members
- Reference it before starting new features or debugging errors
- Add links to external documentation or code samples for tricky rules
- If you encounter a new error, document the cause and solution here
- After every major test or bugfix session, summarize the changes and update the rules accordingly
- Always use absolute imports for project modules (never relative imports for root-level modules)
- Avoid circular imports by keeping utility functions in dedicated files
- For sensitive variables (API keys, secrets, passwords):
  - Store in environment variables, never hardcoded in code
  - Use `.env` files and load with a library (e.g., python-dotenv, dotenv)
  - Never commit `.env` or secret files to version control
  - Always validate presence of required environment variables at app startup
- For config files:
  - Use a single config loader for all environments (dev, prod, test)
  - Document all required config variables in README or a dedicated config doc

## 10. Connection & Route Rules
- Always validate database connection at app startup
- Use connection pooling for databases in production
- For API routes:
  - Prefix all routes with a version or namespace (e.g., `/api/v1/` or `/api/auth/`)
  - Use RESTful conventions for endpoints (GET for read, POST for create, PATCH for update, DELETE for delete)
  - Document all endpoints in OpenAPI/Swagger or a markdown file
  - Always validate request payloads with schemas (e.g., Pydantic, Marshmallow)
  - Return consistent error formats (e.g., `{ "error": "message" }`)

## 11. Error Handling Rules
### Custom Exceptions
```python
# Service-specific exceptions
class InsufficientShobeisError(Exception):
    pass

class UserLimitExceededError(Exception):
    pass
```

### HTTP Status Codes
- 400: Bad Request (invalid input)
- 401: Unauthorized (no token)
- 402: Payment Required (insufficient balance)
- 404: Not Found (resource doesn't exist)
- 422: Validation Error (invalid request body)
- 500: Server Error (unexpected issues)

### Transaction Error Handling
- Check for sufficient balance before any debit
- Use with_for_update() to prevent race conditions
- Handle None/null values with safe defaults
- Validate all inputs before processing
- Roll back transactions on errors

### Response Formats
Error response should always be:
```python
{
    "detail": str  # Error message
}
```

### Error Prevention
- Validate action_type exists in pricing table
- Check user limits before processing
- Verify idempotency keys for duplicates
- Ensure proper balance constraints
- Safe attribute access:
```python
getattr(user, 'shobeis_balance', 0) or 0
```

## 12. Universal Coding Best Practices
- Use type hints in all Python code
- Write docstrings for all public functions/classes
- Use linters (e.g., flake8, pylint) and formatters (e.g., black, prettier)
- Run static analysis and security scans before deployment
- Always review and test code before merging to main branch
- Keep dependencies up to date and audit for vulnerabilities

## 13. How to Use This File
- Treat this file as a living document: update it every time a new error is fixed or a new rule is learned
- Use it for onboarding new team members
- Reference it before starting new features or debugging errors
- Add links to external documentation or code samples for tricky rules
- If you encounter a new error, document the cause and solution here

## 14. Consistent Naming & Enum Rules
- Always define all user types, roles, and other enums/constants in a single source of truth (e.g., one Python file or config)
- Never hardcode string values for roles, types, or statuses in multiple places—always import from the shared definition
- If you change a name (e.g., 'PRO' to 'PREMIUM'), update it everywhere in code, tests, database seeds, and documentation
- Use automated tests to check for valid values (e.g., assert user_type in ALLOWED_USER_TYPES)
- Document all allowed values for enums/constants in this file and in your README
- When onboarding new team members, emphasize the importance of using only the shared definitions
- Use code review checklists to verify naming consistency before merging
- Example:
  - If you use 'PRO' for a user type, do not use 'PREMIUM' or 'pro' elsewhere—stick to one canonical name
  - If you need to support aliases, map them explicitly in code and document them
