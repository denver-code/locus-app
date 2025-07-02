from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from kanban_api.config import settings

# Configure connect_args based on DB_URL
if settings.db_url.startswith("sqlite://"):
    connect_args = {
        "check_same_thread": False,
        "uri": True,
    }  # Enable URI parsing to allow for shared cache
else:
    connect_args = {}

engine = create_engine(settings.db_url, echo=settings.db_echo, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
