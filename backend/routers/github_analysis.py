"""
GitHub Analysis Router
Provides developer productivity insights from GitHub data
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_system_db
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, timedelta
import httpx
import models
from services import sage_crew

router = APIRouter()

class RepoSummary(BaseModel):
    name: str
    description: Optional[str]
    language: Optional[str]
    stars: int
    last_push: str
    commits_this_week: int = 0

class GitHubAnalysis(BaseModel):
    top_repos: List[RepoSummary]
    total_commits_week: int
    primary_languages: List[str]
    activity_score: int  # 0-100
    ai_insights: List[str]
    productivity_tips: List[str]

@router.get("/github/{github_username}/analysis")
async def get_github_analysis(
    github_username: str,
    system_db: AsyncSession = Depends(get_system_db),
    x_groq_key: Optional[str] = Header(None, alias="X-Groq-Key")
):
    """
    Analyze GitHub profile for productivity insights:
    - Top 5 recent repos with activity
    - Commit patterns
    - AI-generated productivity feedback
    """
    # Get user to verify they exist
    result = await system_db.execute(
        select(models.User).filter(models.User.github_username == github_username)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Fetch user's repos (sorted by last push)
            repos_response = await client.get(
                f"https://api.github.com/users/{github_username}/repos",
                params={"sort": "pushed", "per_page": 10},
                headers={"Accept": "application/vnd.github.v3+json"}
            )
            
            if repos_response.status_code != 200:
                # Return fallback data if GitHub API fails
                return _get_fallback_analysis(github_username)
            
            repos_data = repos_response.json()
            
            # Get top 5 most recently active repos
            top_repos = []
            languages = set()
            
            for repo in repos_data[:5]:
                top_repos.append(RepoSummary(
                    name=repo["name"],
                    description=repo.get("description"),
                    language=repo.get("language"),
                    stars=repo.get("stargazers_count", 0),
                    last_push=repo.get("pushed_at", ""),
                    commits_this_week=0  # Would need separate API call
                ))
                if repo.get("language"):
                    languages.add(repo["language"])
            
            # Calculate activity score based on recent pushes
            activity_score = _calculate_activity_score(repos_data)
            
            # Generate AI insights if Groq key available
            ai_insights = []
            productivity_tips = []
            
            if x_groq_key and len(top_repos) > 0:
                repo_summary = ", ".join([f"{r.name} ({r.language or 'Unknown'})" for r in top_repos])
                insights = await _generate_ai_insights(repo_summary, list(languages), x_groq_key)
                ai_insights = insights.get("insights", [])
                productivity_tips = insights.get("tips", [])
            else:
                # Default insights
                ai_insights = [
                    f"You have {len(top_repos)} active repositories",
                    f"Primary languages: {', '.join(list(languages)[:3]) or 'Not detected'}",
                    "Keep your commit streak going!"
                ]
                productivity_tips = [
                    "Try to commit small, focused changes daily",
                    "Document your code as you write it",
                    "Review your own PRs before merging"
                ]
            
            return GitHubAnalysis(
                top_repos=top_repos,
                total_commits_week=0,  # Would need commits API
                primary_languages=list(languages)[:5],
                activity_score=activity_score,
                ai_insights=ai_insights,
                productivity_tips=productivity_tips
            )
            
    except Exception as e:
        print(f"GitHub API error: {e}")
        return _get_fallback_analysis(github_username)


def _calculate_activity_score(repos: list) -> int:
    """Calculate 0-100 activity score based on recent pushes"""
    if not repos:
        return 0
    
    now = datetime.utcnow()
    score = 0
    
    for repo in repos[:10]:
        pushed_at = repo.get("pushed_at")
        if pushed_at:
            try:
                push_date = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
                days_ago = (now - push_date.replace(tzinfo=None)).days
                
                if days_ago <= 1:
                    score += 15
                elif days_ago <= 7:
                    score += 10
                elif days_ago <= 30:
                    score += 5
                else:
                    score += 1
            except:
                pass
    
    return min(score, 100)


async def _generate_ai_insights(repo_summary: str, languages: list, groq_key: str) -> dict:
    """Generate AI-powered insights about the developer's work"""
    try:
        prompt = f"""Analyze this developer's GitHub activity and provide brief, actionable insights:

Repositories: {repo_summary}
Primary Languages: {', '.join(languages)}

Provide exactly 3 insights about their work patterns and 3 productivity tips.
Format as JSON: {{"insights": ["...", "...", "..."], "tips": ["...", "...", "..."]}}"""

        import json
        from groq import AsyncGroq
        
        client = AsyncGroq(api_key=groq_key)
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        # Try to parse JSON from response
        try:
            # Find JSON in response
            start = content.find("{")
            end = content.rfind("}") + 1
            if start >= 0 and end > start:
                return json.loads(content[start:end])
        except:
            pass
        
        return {"insights": [], "tips": []}
        
    except Exception as e:
        print(f"AI insights error: {e}")
        return {"insights": [], "tips": []}


def _get_fallback_analysis(username: str) -> GitHubAnalysis:
    """Return fallback data when GitHub API is unavailable"""
    return GitHubAnalysis(
        top_repos=[],
        total_commits_week=0,
        primary_languages=[],
        activity_score=0,
        ai_insights=[
            "GitHub data temporarily unavailable",
            "Try refreshing in a moment"
        ],
        productivity_tips=[
            "Commit early and often",
            "Write meaningful commit messages",
            "Take breaks to maintain focus"
        ]
    )
