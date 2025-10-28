from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import models
from database import engine, get_db, init_db
from models import (
    UserCreate, UserResponse, CheckInCreate, CheckInUpdate,
    AgentAdviceResponse, GitHubAnalysisResponse
)
from github_integration import GitHubAnalyzer
from crew import SageMentorCrew
from datetime import datetime, timedelta
from pydantic import BaseModel

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

# New Pydantic Models
class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict] = None

class LifeDecisionCreate(BaseModel):
    title: str
    description: str
    decision_type: str  # major_decision, mistake, win, pattern
    impact_areas: List[str]
    context: Optional[Dict] = None

class LifeDecisionResponse(BaseModel):
    id: int
    title: str
    description: str
    decision_type: str
    impact_areas: List[str]
    timestamp: datetime
    ai_analysis: Optional[str] = None
    lessons_learned: Optional[List[str]] = None
    
    class Config:
        from_attributes = True

@app.get("/")
def read_root():
    return {
        "message": "Sage AI Mentor API",
        "version": "1.0.0",
        "status": "running"
    }

# ==================== EXISTING ENDPOINTS ====================

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
    
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Create user first.")
    
    github_data = github_analyzer.analyze_user(github_username)
    
    if "error" in github_data:
        raise HTTPException(status_code=400, detail=github_data["error"])
    
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
    
    crew_result = sage_crew.analyze_developer(github_data, checkin_history)
    
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
    
    recent_checkins = db.query(models.CheckIn).filter(
        models.CheckIn.user_id == user.id
    ).order_by(models.CheckIn.timestamp.desc()).limit(7).all()
    
    history = {
        "recent_checkins": len(recent_checkins),
        "avg_energy": sum(c.energy_level for c in recent_checkins) / len(recent_checkins) if recent_checkins else 0,
        "commitments_kept": sum(1 for c in recent_checkins if c.shipped) if recent_checkins else 0
    }
    
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

@app.get("/dashboard/{github_username}")
def get_dashboard(github_username: str, db: Session = Depends(get_db)):
    """Get complete dashboard data"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    github_analysis = db.query(models.GitHubAnalysis).filter(
        models.GitHubAnalysis.user_id == user.id
    ).order_by(models.GitHubAnalysis.analyzed_at.desc()).first()
    
    checkins = db.query(models.CheckIn).filter(
        models.CheckIn.user_id == user.id
    ).order_by(models.CheckIn.timestamp.desc()).limit(7).all()
    
    latest_advice = db.query(models.AgentAdvice).filter(
        models.AgentAdvice.user_id == user.id
    ).order_by(models.AgentAdvice.created_at.desc()).limit(3).all()
    
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

# ==================== NEW CHAT ENDPOINTS ====================

@app.post("/chat/{github_username}")
async def chat_with_mentor(
    github_username: str,
    message: ChatMessage,
    db: Session = Depends(get_db)
):
    """Chat with the AI mentor with multi-agent deliberation"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user context
    github_analysis = db.query(models.GitHubAnalysis).filter(
        models.GitHubAnalysis.user_id == user.id
    ).order_by(models.GitHubAnalysis.analyzed_at.desc()).first()
    
    recent_checkins = db.query(models.CheckIn).filter(
        models.CheckIn.user_id == user.id
    ).order_by(models.CheckIn.timestamp.desc()).limit(7).all()
    
    life_events = db.query(models.LifeEvent).filter(
        models.LifeEvent.user_id == user.id
    ).order_by(models.LifeEvent.timestamp.desc()).limit(10).all()
    
    user_context = {
        "github": {
            "total_repos": github_analysis.total_repos if github_analysis else 0,
            "active_repos": github_analysis.active_repos if github_analysis else 0,
            "languages": github_analysis.languages if github_analysis else {},
            "patterns": github_analysis.patterns if github_analysis else []
        },
        "recent_performance": {
            "total_checkins": len(recent_checkins),
            "commitments_kept": sum(1 for c in recent_checkins if c.shipped),
            "avg_energy": sum(c.energy_level for c in recent_checkins) / len(recent_checkins) if recent_checkins else 0
        },
        "life_decisions": [
            {
                "title": e.description,
                "type": e.event_type,
                "date": e.timestamp.strftime("%Y-%m-%d")
            }
            for e in life_events
        ]
    }
    
    # Run multi-agent deliberation
    deliberation = sage_crew.chat_deliberation(
        message.message,
        user_context,
        message.context
    )
    
    # Save conversation
    advice = models.AgentAdvice(
        user_id=user.id,
        agent_name="Multi-Agent Chat",
        advice=deliberation["final_response"],
        evidence={"user_message": message.message, "deliberation": deliberation["debate"]}
    )
    db.add(advice)
    db.commit()
    
    return {
        "response": deliberation["final_response"],
        "agent_debate": deliberation["debate"],
        "key_insights": deliberation["key_insights"],
        "recommended_actions": deliberation["actions"]
    }

# ==================== LIFE DECISIONS ENDPOINTS ====================

@app.post("/life-decisions/{github_username}", response_model=LifeDecisionResponse)
def create_life_decision(
    github_username: str,
    decision: LifeDecisionCreate,
    db: Session = Depends(get_db)
):
    """Log a major life decision for AI analysis"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create life event
    life_event = models.LifeEvent(
        user_id=user.id,
        event_type=decision.decision_type,
        description=decision.title,
        context={
            "full_description": decision.description,
            "impact_areas": decision.impact_areas,
            **(decision.context if decision.context else {})
        }
    )
    db.add(life_event)
    db.commit()
    db.refresh(life_event)
    
    # Get AI analysis
    analysis = sage_crew.analyze_life_decision(
        {
            "title": decision.title,
            "description": decision.description,
            "type": decision.decision_type,
            "impact_areas": decision.impact_areas
        },
        user.id,
        db
    )
    
    # Update with AI insights
    life_event.context["ai_analysis"] = analysis["analysis"]
    life_event.context["lessons"] = analysis["lessons"]
    life_event.outcome = analysis["long_term_impact"]
    db.commit()
    
    return {
        "id": life_event.id,
        "title": decision.title,
        "description": decision.description,
        "decision_type": decision.decision_type,
        "impact_areas": decision.impact_areas,
        "timestamp": life_event.timestamp,
        "ai_analysis": analysis["analysis"],
        "lessons_learned": analysis["lessons"]
    }

@app.get("/life-decisions/{github_username}", response_model=List[LifeDecisionResponse])
def get_life_decisions(
    github_username: str,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get all life decisions with AI analysis"""
    user = db.query(models.User).filter(
        models.User.github_username == github_username
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    events = db.query(models.LifeEvent).filter(
        models.LifeEvent.user_id == user.id
    ).order_by(models.LifeEvent.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "id": e.id,
            "title": e.description,
            "description": e.context.get("full_description", ""),
            "decision_type": e.event_type,
            "impact_areas": e.context.get("impact_areas", []),
            "timestamp": e.timestamp,
            "ai_analysis": e.context.get("ai_analysis"),
            "lessons_learned": e.context.get("lessons", [])
        }
        for e in events
    ]

@app.post("/life-decisions/{decision_id}/evaluate")
def evaluate_decision(
    decision_id: int,
    evaluation: Dict,
    db: Session = Depends(get_db)
):
    """Re-evaluate a past decision with current context"""
    event = db.query(models.LifeEvent).filter(
        models.LifeEvent.id == decision_id
    ).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    user = db.query(models.User).filter(models.User.id == event.user_id).first()
    
    # Re-evaluate with current context
    re_evaluation = sage_crew.reevaluate_decision(
        event,
        evaluation.get("current_situation", ""),
        evaluation.get("what_changed", ""),
        user.id,
        db
    )
    
    # Update the event
    if "re_evaluations" not in event.context:
        event.context["re_evaluations"] = []
    
    event.context["re_evaluations"].append({
        "date": datetime.now().isoformat(),
        "analysis": re_evaluation["analysis"],
        "new_lessons": re_evaluation["new_lessons"],
        "how_it_aged": re_evaluation["how_it_aged"]
    })
    db.commit()
    
    return {
        "message": "Decision re-evaluated",
        "analysis": re_evaluation["analysis"],
        "new_lessons": re_evaluation["new_lessons"],
        "how_it_aged": re_evaluation["how_it_aged"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)