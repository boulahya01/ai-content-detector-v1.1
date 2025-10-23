from fastapi import FastAPI


from fastapi.middleware.cors import CORSMiddleware
from app.utils.settings import settings

# Import routers (must be before include_router)
from app.api import auth, analytics, analyze, shobeis
from app.api import subscriptions, api_keys

# Minimal FastAPI app focused on auth testing
app = FastAPI(
    title="AI Content Detector API - Auth Test",
    version="1.1.0",
)

# Configure CORS middleware using settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Length", "Content-Range"],
    max_age=3600,
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(analyze.router, prefix="/api", tags=["analysis"])
app.include_router(shobeis.router, prefix="/api/shobeis", tags=["shobeis"])
app.include_router(subscriptions.router, prefix="/api", tags=["subscriptions"])
app.include_router(api_keys.router, tags=["api-keys"])

# Admin routes (optional)
try:
    from app.api.admin import shobeis as admin_shobeis
    from app.api.admin import bulk_operations, monitoring
    app.include_router(admin_shobeis.router, tags=["admin"])
    app.include_router(bulk_operations.router, tags=["admin"])
    app.include_router(monitoring.router, tags=["admin"])
except Exception:
    # Admin endpoints are optional for test runs; skip if not present.
    pass

# Initialize DB tables after models/router imports to avoid circular import

# Initialize DB tables after models/router imports to avoid circular import
from app.utils.database import init_db
init_db()

# Start balance scheduler
try:
    from app.utils.scheduler import start_scheduler
    start_scheduler()
except Exception as e:
    print(f"[WARN] Scheduler not started: {e}")


@app.get("/")
async def root():
    return {"message": "AI Content Detector API - Auth Test", "status": "operational"}