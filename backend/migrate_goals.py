from database import engine, Base
import models

def migrate():
    """Create new tables for goals system"""
    print("🔄 Starting database migration...")
    
    try:
        # This will create only the new tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("✅ Migration complete! New tables created:")
        print("   - goals")
        print("   - subgoals")
        print("   - tasks")
        print("   - milestones")
        print("   - goal_progress")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    migrate()