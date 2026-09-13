import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.db.session import engine
from app.db.base_class import Base
import app.models  # Ensures all models are loaded into Base.metadata


def init_db():
    print("[*] Initializing HackSphere relational database tables...")
    print(f"Connecting to: {engine.url}")
    
    Base.metadata.create_all(bind=engine)
    
    print("\n[+] Successfully created the following tables:")
    for table_name in sorted(Base.metadata.tables.keys()):
        print(f"  - {table_name}")
    print(f"\nTotal tables created: {len(Base.metadata.tables)}")


if __name__ == "__main__":
    init_db()
