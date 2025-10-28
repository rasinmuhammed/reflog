from github import Github
from datetime import datetime, timedelta
from collections import Counter
import os
from dotenv import load_dotenv

load_dotenv()

class GitHubAnalyzer:
    def __init__(self, token: str = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.client = Github(self.token) if self.token else None
    
    def analyze_user(self, username: str) -> dict:
        """Analyze a GitHub user's repos and activity"""
        if not self.client:
            return {"error": "GitHub token not configured"}
        
        try:
            user = self.client.get_user(username)
            repos = list(user.get_repos())
            
            # Time threshold for "active" repos
            three_months_ago = datetime.now() - timedelta(days=90)
            
            active_repos = []
            total_commits = 0
            languages = Counter()
            started_not_finished = []
            
            for repo in repos:
                if repo.fork:
                    continue
                
                # Check if repo is active
                last_push = repo.pushed_at
                is_active = last_push and last_push > three_months_ago
                
                if is_active:
                    active_repos.append(repo.name)
                
                # Count commits (approximate from repo size)
                if repo.size > 0:
                    try:
                        commits = list(repo.get_commits()[:100])  # Sample recent commits
                        total_commits += len(commits)
                    except:
                        pass
                
                # Language stats
                if repo.language:
                    languages[repo.language] += 1
                
                # Detect tutorial hell / unfinished projects
                if repo.size > 0 and not is_active and repo.created_at > datetime.now() - timedelta(days=180):
                    started_not_finished.append({
                        "name": repo.name,
                        "started": repo.created_at.strftime("%Y-%m-%d"),
                        "last_activity": last_push.strftime("%Y-%m-%d") if last_push else "Unknown"
                    })
            
            # Detect patterns
            patterns = self._detect_patterns(
                total_repos=len(repos),
                active_repos=len(active_repos),
                started_not_finished=len(started_not_finished),
                languages=languages
            )
            
            return {
                "username": username,
                "total_repos": len(repos),
                "active_repos": len(active_repos),
                "total_commits": total_commits,
                "languages": dict(languages.most_common(5)),
                "started_not_finished": started_not_finished[:5],
                "patterns": patterns,
                "profile_url": user.html_url
            }
            
        except Exception as e:
            return {"error": f"Failed to analyze GitHub user: {str(e)}"}
    
    def _detect_patterns(self, total_repos, active_repos, started_not_finished, languages):
        """Detect behavioral patterns from GitHub data"""
        patterns = []
        
        # Tutorial hell detection
        if started_not_finished > 5:
            patterns.append({
                "type": "tutorial_hell",
                "severity": "high",
                "message": f"You have {started_not_finished} repos started but abandoned in last 6 months"
            })
        
        # Consistency issues
        active_percentage = (active_repos / total_repos * 100) if total_repos > 0 else 0
        if active_percentage < 20 and total_repos > 5:
            patterns.append({
                "type": "low_consistency",
                "severity": "medium",
                "message": f"Only {active_percentage:.0f}% of your repos are active. You start but don't maintain."
            })
        
        # Language focus
        if len(languages) > 5:
            patterns.append({
                "type": "shiny_object_syndrome",
                "severity": "medium",
                "message": f"You're spreading across {len(languages)} languages. Consider focusing."
            })
        
        # Positive patterns
        if active_percentage > 50:
            patterns.append({
                "type": "consistent_maintainer",
                "severity": "positive",
                "message": "You maintain over half your projects. Strong consistency!"
            })
        
        return patterns
    
    def get_recent_activity(self, username: str, days: int = 7) -> dict:
        """Get recent commit activity"""
        if not self.client:
            return {"error": "GitHub token not configured"}
        
        try:
            user = self.client.get_user(username)
            since = datetime.now() - timedelta(days=days)
            
            events = user.get_events()
            commit_count = 0
            repos_touched = set()
            
            for event in events:
                if event.created_at < since:
                    break
                if event.type == "PushEvent":
                    commit_count += len(event.payload.get("commits", []))
                    repos_touched.add(event.repo.name)
            
            return {
                "days": days,
                "commits": commit_count,
                "repos_touched": len(repos_touched),
                "active": commit_count > 0
            }
        except Exception as e:
            return {"error": str(e)}