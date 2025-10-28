from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, JSON
from datetime import datetime
from database import Base
from pydantic import BaseModel
from typing import Optional, List, Dict

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    github_username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    onboarding_complete = Column(Boolean, default=False)

class CheckIn(Base):
    __tablename__ = "checkins"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    energy_level = Column(Integer)  # 1-10
    avoiding_what = Column(Text)
    commitment = Column(Text)
    shipped = Column(Boolean, nullable=True)
    excuse = Column(Text, nullable=True)
    mood = Column(String, nullable=True)

class GitHubAnalysis(Base):
    __tablename__ = "github_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    username = Column(String)
    total_repos = Column(Integer)
    active_repos = Column(Integer)  # active in last 3 months
    total_commits = Column(Integer)
    languages = Column(JSON)  # {"Python": 45, "JavaScript": 30, ...}
    patterns = Column(JSON)  # detected patterns
    analyzed_at = Column(DateTime, default=datetime.utcnow)

class AgentAdvice(Base):
    __tablename__ = "agent_advice"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    agent_name = Column(String)  # Analyst, Psychologist, Strategist
    advice = Column(Text)
    evidence = Column(JSON)  # supporting data
    created_at = Column(DateTime, default=datetime.utcnow)
    followed = Column(Boolean, nullable=True)
    outcome = Column(Text, nullable=True)

class LifeEvent(Base):
    __tablename__ = "life_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    event_type = Column(String)  # decision, mistake, win, pattern
    description = Column(Text)
    context = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Pydantic Schemas (for API requests/responses)
class UserCreate(BaseModel):
    github_username: str
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    github_username: str
    email: Optional[str]
    onboarding_complete: bool
    
    class Config:
        from_attributes = True

class CheckInCreate(BaseModel):
    energy_level: int
    avoiding_what: str
    commitment: str
    mood: Optional[str] = None

class CheckInUpdate(BaseModel):
    shipped: bool
    excuse: Optional[str] = None

class AgentAdviceResponse(BaseModel):
    agent_name: str
    advice: str
    evidence: Dict
    created_at: datetime
    
    class Config:
        from_attributes = True

class GitHubAnalysisResponse(BaseModel):
    username: str
    total_repos: int
    active_repos: int
    total_commits: int
    languages: Dict
    patterns: Dict
    analyzed_at: datetime
    
    class Config:
        from_attributes = True