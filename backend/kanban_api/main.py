from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from kanban_api import __version__
from kanban_api.config import settings
from kanban_api.database import SessionLocal, engine
from kanban_api.models import Base
from kanban_api.routes import auth, board, card, user
from kanban_api.utils.fake_data import FakeData


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.drop_all or settings.populate_db:
        Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)

    if settings.populate_db:
        fake_data = FakeData()
        users = fake_data.generate(num_users=7, num_boards=28, num_cards=600)
        with SessionLocal() as session:
            session.add_all(users)
            session.commit()
    yield
    # after the app shuts down


app = FastAPI(
    title="Simple Kanban API",
    description="A simple kanban API",
    version=__version__,
    lifespan=lifespan,
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")

api.include_router(auth.router)
api.include_router(user.router)
api.include_router(board.router)
api.include_router(card.router)

app.include_router(api)

app.mount("/", StaticFiles(directory=settings.static_files_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
