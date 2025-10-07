from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analyze

app = FastAPI(title="AI Content Detector API")

# Include routers
app.include_router(analyze.router, prefix="/api")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Content Detector API"}