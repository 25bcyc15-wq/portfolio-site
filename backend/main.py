from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from dotenv import load_dotenv
from pathlib import Path

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

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "http://localhost",
    "http://localhost:8000",
    "https://portfolio-site-1-sw21.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
try:
    supabase = init_supabase()
    if supabase:
        print("✅ Supabase initialized successfully")
    else:
        print("⚠️  Supabase not configured - set SUPABASE_URL and SUPABASE_KEY environment variables")
except Exception as e:
    print(f"⚠️  Supabase initialization warning: {e}")

# Include routes FIRST - before catch-all
app.include_router(contact_routes.router, prefix="/api", tags=["contact"])

# Health check endpoint (before catch-all)
@app.get("/health")
async def health_check():
    supabase = init_supabase()
    return {
        "status": "ok",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "database": "supabase",
        "supabase_configured": supabase is not None
    }

# Info endpoint for debugging
@app.get("/info")
async def info():
    return {
        "app": "Arsha Ashok - Portfolio API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "supabase_url": os.getenv("SUPABASE_URL", "NOT SET"),
        "supabase_key_set": bool(os.getenv("SUPABASE_KEY")),
        "cors_origins": origins
    }

# Serve static files from frontend AFTER API routes
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

# Serve index.html for SPA routing (specific routes first)
@app.get("/")
async def serve_index():
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path), media_type="text/html")
    return {"message": "Portfolio API - Frontend not found"}

# Catch-all for SPA routing (MUST be last)
@app.api_route("/{full_path:path}", methods=["GET"])
async def catch_all(full_path: str):
    # Serve static files if they exist
    file_path = frontend_path / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(str(file_path))
    
    # Otherwise serve index.html for SPA routing
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path), media_type="text/html")
    raise HTTPException(status_code=404, detail="Not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\n{'='*50}")
    print(f"🚀 Starting Portfolio API Server")
    print(f"📍 Running on: http://localhost:{port}")
    print(f"📚 API Docs: http://localhost:{port}/docs")
    print(f"🔍 ReDoc: http://localhost:{port}/redoc")
    print(f"{'='*50}\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )
