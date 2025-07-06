from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from locus_api import __version__
from locus_api.config import settings
from locus_api.database import SessionLocal, engine
from locus_api.models import Base
from locus_api.routes import auth, board, card, user
from locus_api.utils.fake_data import FakeData


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
    title="Locus API",
    description="Locus API",
    version=__version__,
    lifespan=lifespan,
)

origins = settings.cors_origins.split(",")

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

if settings.use_static:
    app.mount("/", StaticFiles(directory=settings.static_files_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
