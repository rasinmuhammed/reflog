from database import engine, Base
import models

def migrate():
    """Create notifications table"""
    print("🔄 Starting notifications migration...")
    
    try:
        # This will create only the notifications table if it doesn't exist
        # Other existing tables won't be modified
        models.Notification.__table__.create(bind=engine, checkfirst=True)
        print("✅ Migration complete! Notifications table created")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    migrate()