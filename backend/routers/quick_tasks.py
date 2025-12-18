from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import models
from database import get_user_db, get_system_db

router = APIRouter()


# --- Schemas ---
class QuickTaskCreate(BaseModel):
    title: str
    due_date: Optional[datetime] = None


class QuickTaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None


class QuickTaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    due_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Endpoints ---
@router.post("/quick-tasks/{github_username}", response_model=QuickTaskResponse)
async def create_quick_task(
    github_username: str,
    task: QuickTaskCreate,
    db: AsyncSession = Depends(get_user_db),
    system_db: AsyncSession = Depends(get_system_db)
):
    """Create a new quick task. Just pass a title, that's it."""
    # Get user
    result = await system_db.execute(
        select(models.User).filter(models.User.github_username == github_username)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_task = models.QuickTask(
        user_id=user.id,
        title=task.title,
        due_date=task.due_date or datetime.utcnow().replace(hour=23, minute=59, second=59)
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task


@router.get("/quick-tasks/{github_username}", response_model=List[QuickTaskResponse])
async def get_quick_tasks(
    github_username: str,
    include_completed: bool = False,
    days: int = 1,
    db: AsyncSession = Depends(get_user_db),
    system_db: AsyncSession = Depends(get_system_db)
):
    """Get quick tasks. By default returns today's incomplete tasks."""
    # Get user
    result = await system_db.execute(
        select(models.User).filter(models.User.github_username == github_username)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Query tasks
    cutoff = datetime.utcnow() - timedelta(days=days)
    query = select(models.QuickTask).filter(
        models.QuickTask.user_id == user.id,
        models.QuickTask.created_at >= cutoff
    )
    
    if not include_completed:
        query = query.filter(models.QuickTask.completed == False)
    
    query = query.order_by(models.QuickTask.completed.asc(), models.QuickTask.created_at.desc())
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    return tasks


@router.patch("/quick-tasks/{github_username}/{task_id}", response_model=QuickTaskResponse)
async def update_quick_task(
    github_username: str,
    task_id: int,
    update: QuickTaskUpdate,
    db: AsyncSession = Depends(get_user_db),
    system_db: AsyncSession = Depends(get_system_db)
):
    """Update a quick task (toggle complete, edit title, etc.)"""
    # Get user
    result = await system_db.execute(
        select(models.User).filter(models.User.github_username == github_username)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get task
    result = await db.execute(
        select(models.QuickTask).filter(
            models.QuickTask.id == task_id,
            models.QuickTask.user_id == user.id
        )
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update fields
    if update.title is not None:
        task.title = update.title
    if update.completed is not None:
        task.completed = update.completed
        task.completed_at = datetime.utcnow() if update.completed else None
    if update.due_date is not None:
        task.due_date = update.due_date

    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/quick-tasks/{github_username}/{task_id}")
async def delete_quick_task(
    github_username: str,
    task_id: int,
    db: AsyncSession = Depends(get_user_db),
    system_db: AsyncSession = Depends(get_system_db)
):
    """Delete a quick task."""
    # Get user
    result = await system_db.execute(
        select(models.User).filter(models.User.github_username == github_username)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get task
    result = await db.execute(
        select(models.QuickTask).filter(
            models.QuickTask.id == task_id,
            models.QuickTask.user_id == user.id
        )
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()
    return {"message": "Task deleted"}


@router.get("/quick-tasks/{github_username}/stats")
async def get_quick_task_stats(
    github_username: str,
    db: AsyncSession = Depends(get_user_db),
    system_db: AsyncSession = Depends(get_system_db)
):
    """Get quick task stats for today."""
    # Get user
    result = await system_db.execute(
        select(models.User).filter(models.User.github_username == github_username)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Total today
    result = await db.execute(
        select(func.count(models.QuickTask.id)).filter(
            models.QuickTask.user_id == user.id,
            models.QuickTask.created_at >= today_start
        )
    )
    total = result.scalar() or 0

    # Completed today
    result = await db.execute(
        select(func.count(models.QuickTask.id)).filter(
            models.QuickTask.user_id == user.id,
            models.QuickTask.created_at >= today_start,
            models.QuickTask.completed == True
        )
    )
    completed = result.scalar() or 0

    return {
        "total": total,
        "completed": completed,
        "pending": total - completed,
        "completion_rate": (completed / total * 100) if total > 0 else 0
    }
