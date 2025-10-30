from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
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
    
    # Relationships
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")

class CheckIn(Base):
    __tablename__ = "checkins"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    energy_level = Column(Integer)
    avoiding_what = Column(Text)
    commitment = Column(Text)
    shipped = Column(Boolean, nullable=True)
    excuse = Column(Text, nullable=True)
    mood = Column(String(100), nullable=True)
    ai_analysis = Column(Text, nullable=True)
    agent_debate = Column(JSON, nullable=True)

class GitHubAnalysis(Base):
    __tablename__ = "github_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    username = Column(String(255))
    total_repos = Column(Integer)
    active_repos = Column(Integer)
    total_commits = Column(Integer)
    languages = Column(JSON)
    patterns = Column(JSON)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

class AgentAdvice(Base):
    __tablename__ = "agent_advice"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    agent_name = Column(String(100))
    advice = Column(Text)
    evidence = Column(JSON)
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

# NEW: Goals System
class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String(500))
    description = Column(Text)
    goal_type = Column(String(50))  # career, personal, financial, health, learning, project
    priority = Column(String(20))  # critical, high, medium, low
    status = Column(String(50), default="active")  # active, completed, paused, abandoned
    progress = Column(Float, default=0.0)  # 0-100
    target_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Success criteria and metrics
    success_criteria = Column(JSON, nullable=True)  # List of measurable criteria
    current_metrics = Column(JSON, nullable=True)  # Current measurements
    
    # AI Analysis
    ai_analysis = Column(Text, nullable=True)
    ai_insights = Column(JSON, nullable=True)
    obstacles_identified = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="goals")
    subgoals = relationship("SubGoal", back_populates="parent_goal", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="goal", cascade="all, delete-orphan")
    progress_logs = relationship("GoalProgress", back_populates="goal", cascade="all, delete-orphan")

class SubGoal(Base):
    __tablename__ = "subgoals"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), index=True)
    title = Column(String(500))
    description = Column(Text, nullable=True)
    order = Column(Integer)  # Sequential order
    status = Column(String(50), default="pending")  # pending, in_progress, completed, blocked
    progress = Column(Float, default=0.0)
    target_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Dependencies
    depends_on = Column(JSON, nullable=True)  # List of subgoal IDs that must complete first
    
    # Relationships
    parent_goal = relationship("Goal", back_populates="subgoals")
    tasks = relationship("Task", back_populates="subgoal", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    subgoal_id = Column(Integer, ForeignKey("subgoals.id"), index=True)
    title = Column(String(500))
    description = Column(Text, nullable=True)
    status = Column(String(50), default="todo")  # todo, in_progress, done, cancelled
    priority = Column(String(20), default="medium")
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    subgoal = relationship("SubGoal", back_populates="tasks")

class Milestone(Base):
    __tablename__ = "milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), index=True)
    title = Column(String(500))
    description = Column(Text, nullable=True)
    target_date = Column(DateTime)
    achieved = Column(Boolean, default=False)
    achieved_at = Column(DateTime, nullable=True)
    celebration_note = Column(Text, nullable=True)
    
    # Relationships
    goal = relationship("Goal", back_populates="milestones")

class GoalProgress(Base):
    __tablename__ = "goal_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    progress = Column(Float)  # Progress percentage at this point
    notes = Column(Text, nullable=True)
    mood = Column(String(50), nullable=True)
    obstacles = Column(Text, nullable=True)
    wins = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    
    # Relationships
    goal = relationship("Goal", back_populates="progress_logs")

# Pydantic Schemas
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

# NEW: Goal Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    estimated_hours: Optional[float] = None
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    estimated_hours: Optional[float]
    actual_hours: Optional[float]
    due_date: Optional[datetime]
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class SubGoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order: int
    target_date: Optional[datetime] = None
    tasks: Optional[List[TaskCreate]] = []

class SubGoalResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    order: int
    status: str
    progress: float
    target_date: Optional[datetime]
    created_at: datetime
    completed_at: Optional[datetime]
    tasks: List[TaskResponse] = []
    
    class Config:
        from_attributes = True

class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: datetime

class MilestoneResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    target_date: datetime
    achieved: bool
    achieved_at: Optional[datetime]
    celebration_note: Optional[str]
    
    class Config:
        from_attributes = True

class GoalCreate(BaseModel):
    title: str
    description: str
    goal_type: str  # career, personal, financial, health, learning, project
    priority: str  # critical, high, medium, low
    target_date: Optional[datetime] = None
    success_criteria: Optional[List[str]] = []
    subgoals: Optional[List[SubGoalCreate]] = []
    milestones: Optional[List[MilestoneCreate]] = []

class GoalResponse(BaseModel):
    id: int
    title: str
    description: str
    goal_type: str
    priority: str
    status: str
    progress: float
    target_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    success_criteria: Optional[Dict]
    current_metrics: Optional[Dict]
    ai_analysis: Optional[str]
    ai_insights: Optional[Dict]
    obstacles_identified: Optional[Dict]
    subgoals: List[SubGoalResponse] = []
    milestones: List[MilestoneResponse] = []
    
    class Config:
        from_attributes = True

class GoalProgressCreate(BaseModel):
    progress: float
    notes: Optional[str] = None
    mood: Optional[str] = None
    obstacles: Optional[str] = None
    wins: Optional[str] = None

class GoalProgressResponse(BaseModel):
    id: int
    timestamp: datetime
    progress: float
    notes: Optional[str]
    mood: Optional[str]
    obstacles: Optional[str]
    wins: Optional[str]
    ai_feedback: Optional[str]
    
    class Config:
        from_attributes = True

class GoalUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    target_date: Optional[datetime] = None
    success_criteria: Optional[List[str]] = None