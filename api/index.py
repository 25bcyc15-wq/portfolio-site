"""
Vercel serverless function for FastAPI portfolio API
This file runs the FastAPI app as a Vercel serverless function
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Import routes and database
from routes import contact_routes
from database import init_supabase

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Arsha Ashok - Portfolio API",
    description="Full Stack Developer Portfolio API",
    version="1.0.0"
)

# Configure CORS for Vercel deployment
origins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "http://localhost",
    "http://localhost:8000",
    "https://arsha-portfolio.vercel.app",
    os.getenv("VERCEL_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in origins if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(contact_routes.router, prefix="/api")

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        supabase = init_supabase()
        return {
            "status": "ok",
            "message": "Portfolio API is running",
            "database": "supabase",
            "environment": os.getenv("ENVIRONMENT", "production")
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "database": "supabase"
        }

# Serve static frontend files
frontend_path = Path(__file__).parent.parent / "frontend"

@app.get("/")
async def serve_root():
    return FileResponse(frontend_path / "index.html")

@app.get("/{path:path}")
async def serve_static(path: str):
    file_path = frontend_path / path
    
    # Check if file exists
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    # Fallback to index.html for SPA routing
    return FileResponse(frontend_path / "index.html")

# Mount static files directory
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")
