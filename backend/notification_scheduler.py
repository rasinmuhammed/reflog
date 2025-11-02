"""
Background task scheduler for checking and creating notifications.
Run this as a separate process alongside your FastAPI server.

Usage:
    python notification_scheduler.py
"""

import time
import schedule
from database import SessionLocal
from notification_service import NotificationService
import models

def check_all_users_notifications():
    """Check notifications for all active users"""
    db = SessionLocal()
    try:
        # Get all users
        users = db.query(models.User).all()
        
        print(f"🔔 Checking notifications for {len(users)} users...")
        
        for user in users:
            try:
                NotificationService.run_all_checks(db, user.id)
                print(f"✓ Checked user: {user.github_username}")
            except Exception as e:
                print(f"✗ Error checking user {user.github_username}: {str(e)}")
        
        print(f"✅ Notification check complete for {len(users)} users\n")
        
    except Exception as e:
        print(f"❌ Error in notification scheduler: {str(e)}")
    finally:
        db.close()

def run_scheduler():
    """Run the notification scheduler"""
    print("🚀 Starting notification scheduler...")
    print("⏰ Schedule: Every 30 minutes")
    print("Press Ctrl+C to stop\n")
    
    # Schedule checks every 30 minutes
    schedule.every(30).minutes.do(check_all_users_notifications)
    
    # Run once immediately on startup
    check_all_users_notifications()
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute if scheduled tasks need to run

if __name__ == "__main__":
    try:
        run_scheduler()
    except KeyboardInterrupt:
        print("\n\n👋 Notification scheduler stopped")