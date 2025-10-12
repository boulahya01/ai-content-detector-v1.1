from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import only auth to keep this module lightweight and avoid heavy deps/circular imports
from app.api import auth


# Minimal FastAPI app focused on auth testing
app = FastAPI(
    title="AI Content Detector API - Auth Test",
    version="1.1.0",
)

# Configure CORS middleware with secure settings for development
app.add_middleware(
    CORSMiddleware,
    # Only allow the Vite development server origins
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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

# Include only auth router for now
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])

# Initialize DB tables after models/router imports to avoid circular import
from app.utils.database import init_db
init_db()


@app.get("/")
async def root():
    return {"message": "AI Content Detector API - Auth Test", "status": "operational"}