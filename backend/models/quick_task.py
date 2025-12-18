from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from .base import UserBase


class QuickTask(UserBase):
    """Simple, standalone quick task for daily tracking."""
    __tablename__ = "quick_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    
    title = Column(String(500), nullable=False)
    completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    
    # Optional: for ordering/prioritization
    position = Column(Integer, default=0)
