from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from database import init_system_db
from routers import (
    users,
    goals,
    action_plans,
    notifications,
    pomodoro,
    commitments,
    insights,
    dashboard,
    system,
    analytics,
    learning,
    leetcode,
    quick_tasks,
    github_analysis
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize System DB
    try:
        print("🔄 Initializing System Database...")
        await init_system_db()
        print("✅ System Database initialized successfully")
        
        # Warmup: Pre-establish connection pool to avoid cold start
        print("🔥 Warming up database connections...")
        from database import get_user_db_engine
        # Trigger a quick query to warm up the connection
        try:
            from sqlalchemy import text
            engine = await get_user_db_engine("rasinmuhammed")
            async with engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            print("✅ Database warmed up successfully")
        except Exception as warmup_error:
            print(f"⚠️ Warmup failed (non-critical): {warmup_error}")
            
    except Exception as e:
        print(f"❌ CRITICAL ERROR: Failed to initialize System Database: {e}")
    
    yield
    
    # Shutdown: Clean up resources if needed
    print("🛑 Shutting down...")

app = FastAPI(title="Reflog AI Mentor API", version="1.0.0", lifespan=lifespan)

# CORS Configuration - Production-ready
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions and return a clean error response"""
    import traceback
    print(f"❌ Unhandled error: {exc}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc) if os.getenv("DEBUG") else "An error occurred"}
    )
app.include_router(system.router, tags=["System"])
app.include_router(users.router, tags=["Users"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(goals.router, tags=["Goals"])
app.include_router(action_plans.router, tags=["Action Plans"])
app.include_router(pomodoro.router, tags=["Pomodoro"])
app.include_router(commitments.router, tags=["Commitments"])
app.include_router(insights.router, tags=["Insights"])
app.include_router(analytics.router, tags=["Analytics"])
app.include_router(learning.router, tags=["Learning"])
app.include_router(leetcode.router, tags=["LeetCode"])
app.include_router(notifications.router, tags=["Notifications"])
app.include_router(quick_tasks.router, tags=["Quick Tasks"])
app.include_router(github_analysis.router, tags=["GitHub Analysis"])

@app.get("/")
def read_root():
    return {"message": "Reflog AI Mentor API is running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)