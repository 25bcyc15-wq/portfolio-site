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
        print("⚠️  Supabase not configured")
except Exception as e:
    print(f"⚠️  Supabase warning: {e}")

# API ROUTES MUST BE FIRST
print("📌 Registering API router at /api...")
app.include_router(contact_routes.router, prefix="/api", tags=["contact"])

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "database": "supabase"
    }

# Info
@app.get("/info")
async def info():
    return {
        "app": "Arsha Ashok - Portfolio API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "api_endpoints": ["/api/contact", "/api/messages"]
    }

# Frontend path
frontend_path = Path(__file__).parent.parent / "frontend"

# Root
@app.get("/")
async def serve_root():
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path), media_type="text/html")
    return {"message": "Frontend not found"}

# Catch-all - MUST be last
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    # Never interfere with API routes
    if full_path.startswith("api/") or full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="Not found")
    
    # Try static file
    file_path = frontend_path / full_path
    if file_path.exists() and file_path.is_file():
        if str(file_path).endswith(('.png', '.jpg', '.jpeg', '.gif')):
            return FileResponse(str(file_path), headers={"Cache-Control": "public, max-age=3600"})
        return FileResponse(str(file_path))
    
    # SPA fallback
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path), media_type="text/html")
    raise HTTPException(status_code=404, detail="Not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\n🚀 Starting on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=os.getenv("ENVIRONMENT") == "development")
