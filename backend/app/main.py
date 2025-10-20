from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from app.api import auth, analytics, analyze, shobeis
from app.api import subscriptions


# Minimal FastAPI app focused on auth testing
app = FastAPI(
    title="AI Content Detector API - Auth Test",
    version="1.1.0",
)

# Configure CORS middleware with secure settings for development
app.add_middleware(
    CORSMiddleware,
    # Allow development server origins (multiple ports for Vite)
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", 
                  "http://localhost:5174", "http://127.0.0.1:5174"],
    # Allow credentials for authenticated requests
    allow_credentials=True,
    # Restrict to necessary HTTP methods
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    # Allow common headers and custom auth headers
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    # Expose necessary headers to client
    expose_headers=["Content-Length", "Content-Range"],
    # Cache preflight requests for 1 hour
    max_age=3600,
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(analyze.router, prefix="/api", tags=["analysis"])
app.include_router(shobeis.router, prefix="/api/shobeis", tags=["shobeis"])
app.include_router(subscriptions.router, prefix="/api", tags=["subscriptions"])

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
from app.utils.database import init_db
init_db()


@app.get("/")
async def root():
    return {"message": "AI Content Detector API - Auth Test", "status": "operational"}