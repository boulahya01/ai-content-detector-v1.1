# Configuration Guide

This document explains the configuration settings and rules for the AI Content Detector.

## Environment Variables

### Core Settings

```bash
# JWT Authentication
JWT_SECRET_KEY=super-strong-secret-key-123  # Change this in production!
JWT_ALGORITHM=HS256                         # Default JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=1440            # 24 hours token validity

# Redis Configuration
REDIS_URL=redis://localhost:6379/0          # Redis connection URL

# CORS & Frontend URLs
FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173  # Comma-separated allowed origins
FRONTEND_URL=http://localhost:5173          # Primary frontend URL
API_URL=http://localhost:8000               # Backend API URL (no /api suffix!)
```

### Balance & Credits Settings

```bash
# Default User Balances
NEW_USER_SHOBEIS=100       # Initial shobeis for new users
NEW_USER_BONUS=50          # Initial bonus balance
PRO_USER_SHOBEIS=5000      # Initial shobeis for pro users

# Monthly Refresh Settings
MONTHLY_REFRESH_FREE=50     # Monthly refresh for free users
MONTHLY_REFRESH_PRO=1000    # Monthly refresh for pro users
```

## Plan Settings

### Free Plan
- Initial Shobeis: 100
- Initial Bonus: 50
- Monthly Refresh: 50
- Max File Size: 5MB
- Batch Size Limit: 10

### Pro Plan
- Initial Shobeis: 5000
- Initial Bonus: 100
- Monthly Refresh: 1000
- Max File Size: 20MB
- Batch Size Limit: 50

## Important Rules

1. **API URL Configuration**:
   - The `API_URL` should NOT end with `/api`
   - Frontend will automatically append `/api` to requests
   - Example: Use `http://localhost:8000` not `http://localhost:8000/api`

2. **CORS Origins**:
   - Multiple origins should be comma-separated
   - No spaces between origins
   - Include both hostname and IP if needed
   - Example: `http://localhost:5173,http://127.0.0.1:5173`

3. **Balance Rules**:
   - Balances cannot go negative
   - Monthly refresh happens automatically
   - Bonus balance is used before regular balance
   - Pro users get higher limits and refreshes

4. **Security Notes**:
   - Change JWT_SECRET_KEY in production
   - Use strong secrets (min 32 characters)
   - Keep .env file secure and never commit to repository

## Test Mode

The `is_test` flag in API calls:
- Set `is_test=true` to skip shobeis charges
- Only works in development environment
- Disabled automatically in production
- Use for testing/development only