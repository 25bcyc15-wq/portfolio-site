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
    init_supabase()
    print("✅ Supabase initialized successfully")
except Exception as e:
    print(f"⚠️  Supabase initialization warning: {e}")

# Include routes
app.include_router(contact_routes.router, prefix="/api", tags=["contact"])

# Serve static files from frontend
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

# Serve index.html for SPA routing
@app.get("/")
async def serve_index():
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Portfolio API - Frontend not found"}

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "database": "supabase"
    }

# Catch-all for SPA routing
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    # If it's an API route, let it fail with 404
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Endpoint not found")
    
    # Otherwise serve index.html for SPA routing
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
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
