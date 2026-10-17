import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import models
from seed_data import seed_database
from routers import (
    auth_routes,
    user_routes,
    opportunity_routes,
    analytics_routes,
    notification_routes,
    bookmark_routes
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title="Opportunity Expiry Predictor API",
    description="AI-powered Opportunity Expiry Predictor and Discovery Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(opportunity_routes.router)
app.include_router(analytics_routes.router)
app.include_router(notification_routes.router)
app.include_router(bookmark_routes.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Opportunity Expiry Predictor API",
        "architecture": "IBM Z / LinuxONE Ready",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
