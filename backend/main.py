from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models
from database import engine, get_db, init_db
from models import (
    UserCreate, UserResponse, CheckInCreate, CheckInUpdate,
    AgentAdviceResponse, GitHubAnalysisResponse
)
from github_integration import GitHubAnalyzer
from crew import SageMentorCrew
from datetime import datetime, timedelta

# Initialize database
init_db()

app = FastAPI(title="Sage AI Mentor API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
github_analyzer = GitHubAnalyzer()
sage_crew = SageMentorCrew()

@app.get("/")
def read_root():
    return {
        "message": "Sage AI Mentor API",
        "version": "1.0.0",
        "status": "running"
    }

# User Management
@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    db_user = db.query(models.User).filter(
        models.User.github_username == user.github_username
    ).first()
    
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user = models.User(
        github_username=user.github_username,
        email=user.email
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.get("/users/{github_username}", response_model=UserResponse)
def get_user(github_username: str, db: Session = Depends(get_db)):
    """Get user by GitHub username"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# GitHub Analysis
@app.post("/analyze-github/{github_username}")
def analyze_github(github_username: str, db: Session = Depends(get_db)):
    """Analyze GitHub profile and get AI insights"""
    
    # Get user
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Create user first.")
    
    # Analyze GitHub
    github_data = github_analyzer.analyze_user(github_username)
    
    if "error" in github_data:
        raise HTTPException(status_code=400, detail=github_data["error"])
    
    # Save analysis to database
    analysis = models.GitHubAnalysis(
        user_id=user.id,
        username=github_username,
        total_repos=github_data["total_repos"],
        active_repos=github_data["active_repos"],
        total_commits=github_data["total_commits"],
        languages=github_data["languages"],
        patterns=github_data["patterns"]
    )
    db.add(analysis)
    db.commit()
    
    # Get recent check-ins for context
    recent_checkins = db.query(models.CheckIn).filter(
        models.CheckIn.user_id == user.id
    ).order_by(models.CheckIn.timestamp.desc()).limit(7).all()
    
    checkin_history = [
        {
            "date": c.timestamp.strftime("%Y-%m-%d"),
            "energy": c.energy_level,
            "commitment": c.commitment,
            "shipped": c.shipped
        }
        for c in recent_checkins
    ]
    
    # Run AI crew analysis
    crew_result = sage_crew.analyze_developer(github_data, checkin_history)
    
    # Save agent advice
    agents_insights = [
        ("Analyst", "Data analysis completed"),
        ("Psychologist", "Pattern analysis completed"),
        ("Strategist", crew_result["agent_insights"]["full_analysis"])
    ]
    
    for agent_name, advice_text in agents_insights:
        advice = models.AgentAdvice(
            user_id=user.id,
            agent_name=agent_name,
            advice=advice_text,
            evidence=github_data
        )
        db.add(advice)
    
    db.commit()
    
    return {
        "github_analysis": github_data,
        "ai_insights": crew_result,
        "message": "Analysis complete"
    }

@app.get("/github-analysis/{github_username}", response_model=GitHubAnalysisResponse)
def get_github_analysis(github_username: str, db: Session = Depends(get_db)):
    """Get latest GitHub analysis for user"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    analysis = db.query(models.GitHubAnalysis).filter(
        models.GitHubAnalysis.user_id == user.id
    ).order_by(models.GitHubAnalysis.analyzed_at.desc()).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found. Run /analyze-github first")
    
    return analysis

# Daily Check-ins
@app.post("/checkins/{github_username}")
def create_checkin(
    github_username: str,
    checkin: CheckInCreate,
    db: Session = Depends(get_db)
):
    """Create morning check-in"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create check-in
    new_checkin = models.CheckIn(
        user_id=user.id,
        energy_level=checkin.energy_level,
        avoiding_what=checkin.avoiding_what,
        commitment=checkin.commitment,
        mood=checkin.mood
    )
    db.add(new_checkin)
    db.commit()
    db.refresh(new_checkin)
    
    # Get user history for context
    recent_checkins = db.query(models.CheckIn).filter(
        models.CheckIn.user_id == user.id
    ).order_by(models.CheckIn.timestamp.desc()).limit(7).all()
    
    history = {
        "recent_checkins": len(recent_checkins),
        "avg_energy": sum(c.energy_level for c in recent_checkins) / len(recent_checkins) if recent_checkins else 0,
        "commitments_kept": sum(1 for c in recent_checkins if c.shipped) if recent_checkins else 0
    }
    
    # Get quick AI analysis
    analysis = sage_crew.quick_checkin_analysis(
        {
            "energy_level": checkin.energy_level,
            "avoiding_what": checkin.avoiding_what,
            "commitment": checkin.commitment,
            "mood": checkin.mood
        },
        history
    )
    
    return {
        "checkin_id": new_checkin.id,
        "ai_response": analysis["analysis"],
        "message": "Check-in recorded"
    }

@app.patch("/checkins/{checkin_id}/evening")
def evening_checkin(
    checkin_id: int,
    update: CheckInUpdate,
    db: Session = Depends(get_db)
):
    """Update check-in with evening results"""
    checkin = db.query(models.CheckIn).filter(
        models.CheckIn.id == checkin_id
    ).first()
    
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    
    checkin.shipped = update.shipped
    checkin.excuse = update.excuse
    db.commit()
    
    # Get AI feedback
    feedback = sage_crew.evening_checkin_review(
        checkin.commitment,
        update.shipped,
        update.excuse
    )
    
    return {
        "message": "Evening check-in recorded",
        "ai_feedback": feedback["feedback"]
    }

@app.get("/checkins/{github_username}")
def get_checkins(
    github_username: str,
    limit: int = 30,
    db: Session = Depends(get_db)
):
    """Get user's check-in history"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    checkins = db.query(models.CheckIn).filter(
        models.CheckIn.user_id == user.id
    ).order_by(models.CheckIn.timestamp.desc()).limit(limit).all()
    
    return {
        "checkins": [
            {
                "id": c.id,
                "date": c.timestamp.strftime("%Y-%m-%d"),
                "energy_level": c.energy_level,
                "commitment": c.commitment,
                "shipped": c.shipped,
                "excuse": c.excuse
            }
            for c in checkins
        ]
    }

# Agent Advice History
@app.get("/advice/{github_username}", response_model=List[AgentAdviceResponse])
def get_advice(github_username: str, db: Session = Depends(get_db)):
    """Get all AI advice for user"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    advice = db.query(models.AgentAdvice).filter(
        models.AgentAdvice.user_id == user.id
    ).order_by(models.AgentAdvice.created_at.desc()).limit(10).all()
    
    return advice

# Dashboard Summary
@app.get("/dashboard/{github_username}")
def get_dashboard(github_username: str, db: Session = Depends(get_db)):
    """Get complete dashboard data"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Latest GitHub analysis
    github_analysis = db.query(models.GitHubAnalysis).filter(
        models.GitHubAnalysis.user_id == user.id
    ).order_by(models.GitHubAnalysis.analyzed_at.desc()).first()
    
    # Recent check-ins
    checkins = db.query(models.CheckIn).filter(
        models.CheckIn.user_id == user.id
    ).order_by(models.CheckIn.timestamp.desc()).limit(7).all()
    
    # Latest advice
    latest_advice = db.query(models.AgentAdvice).filter(
        models.AgentAdvice.user_id == user.id
    ).order_by(models.AgentAdvice.created_at.desc()).limit(3).all()
    
    # Calculate stats
    total_checkins = len(checkins)
    commitments_kept = sum(1 for c in checkins if c.shipped == True)
    avg_energy = sum(c.energy_level for c in checkins) / total_checkins if total_checkins > 0 else 0
    
    return {
        "user": {
            "username": user.github_username,
            "member_since": user.created_at.strftime("%Y-%m-%d")
        },
        "github": {
            "total_repos": github_analysis.total_repos if github_analysis else 0,
            "active_repos": github_analysis.active_repos if github_analysis else 0,
            "languages": github_analysis.languages if github_analysis else {},
            "patterns": github_analysis.patterns if github_analysis else []
        },
        "stats": {
            "total_checkins": total_checkins,
            "commitments_kept": commitments_kept,
            "success_rate": (commitments_kept / total_checkins * 100) if total_checkins > 0 else 0,
            "avg_energy": round(avg_energy, 1)
        },
        "recent_advice": [
            {
                "agent": a.agent_name,
                "advice": a.advice[:200] + "..." if len(a.advice) > 200 else a.advice,
                "date": a.created_at.strftime("%Y-%m-%d")
            }
            for a in latest_advice
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)