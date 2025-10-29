from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime
from database import Base
from pydantic import BaseModel
from typing import Optional, List, Dict

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    github_username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
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
    mood = Column(String(100), nullable=True)
    ai_analysis = Column(Text, nullable=True)
    agent_debate = Column(JSON, nullable=True)  # PostgreSQL JSON type

class GitHubAnalysis(Base):
    __tablename__ = "github_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    username = Column(String(255))
    total_repos = Column(Integer)
    active_repos = Column(Integer)
    total_commits = Column(Integer)
    languages = Column(JSON)  # PostgreSQL JSON type
    patterns = Column(JSON)  # PostgreSQL JSON type
    analyzed_at = Column(DateTime, default=datetime.utcnow)

class AgentAdvice(Base):
    __tablename__ = "agent_advice"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    agent_name = Column(String(100))
    advice = Column(Text)
    evidence = Column(JSON)  # PostgreSQL JSON type
    created_at = Column(DateTime, default=datetime.utcnow)
    followed = Column(Boolean, nullable=True)
    outcome = Column(Text, nullable=True)
    interaction_type = Column(String(50), default="analysis")

class LifeEvent(Base):
    __tablename__ = "life_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    event_type = Column(String(100))
    description = Column(Text)
    context = Column(JSON, nullable=True, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)
    time_horizon = Column(String(50), nullable=True)
    outcome = Column(Text, nullable=True)

# Pydantic Schemas (unchanged)
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

class CheckInResponse(BaseModel):
    id: int
    timestamp: datetime
    energy_level: int
    avoiding_what: str
    commitment: str
    shipped: Optional[bool]
    excuse: Optional[str]
    mood: Optional[str]
    ai_analysis: Optional[str]
    agent_debate: Optional[Dict]
    
    class Config:
        from_attributes = True

class AgentAdviceResponse(BaseModel):
    id: int
    agent_name: str
    advice: str
    evidence: Dict
    created_at: datetime
    interaction_type: str
    
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

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict] = None

class LifeDecisionCreate(BaseModel):
    title: str
    description: str
    decision_type: str
    impact_areas: List[str]
    time_horizon: Optional[str] = "medium_term"
    context: Optional[Dict] = None

class LifeDecisionResponse(BaseModel):
    id: int
    title: str
    description: str
    decision_type: str
    impact_areas: List[str]
    timestamp: datetime
    time_horizon: Optional[str]
    ai_analysis: Optional[str] = None
    lessons_learned: Optional[List[str]] = None
    
    class Config:
        from_attributes = True