from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from kanban_api.dependencies import get_current_user, get_db
from kanban_api.models import User
from kanban_api.schemas.user import UserInCreate, UserInSearch, UserInUpdate, UserOut, UserOutPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", status_code=201)
def create_user(user_create: UserInCreate, db: Session = Depends(get_db)) -> UserOut:
    stmt = select(User).where(User.email == user_create.email)
    existing_user = db.execute(stmt).scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(**user_create.model_dump(exclude={"password"}))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user  # type: ignore


@router.get("/me", status_code=200)
def get_me(user: User = Depends(get_current_user)) -> UserOut:
    return user  # type: ignore


@router.post("/search", status_code=200)
def search_user(
    user_search: UserInSearch,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOutPublic:
    stmt = select(User).where(User.email == user_search.email)
    user = db.execute(stmt).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user  # type: ignore


@router.patch("/me", status_code=200)
def update_user(
    user_update: UserInUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    # if email is being updated, check if it's already taken
    if user_update.email and user_update.email != user.email:
        stmt = select(User).where(User.email == user_update.email)
        existing_user = db.execute(stmt).scalar_one_or_none()
        if existing_user:
            raise HTTPException(status_code=409, detail="Email already registered")
        user.email = str(user_update.email)

    # if password is being updated, just update the hashed password
    if user_update.hashed_password:
        user.hashed_password = user_update.hashed_password

    db.add(user)
    db.commit()
    db.refresh(user)
    return user  # type: ignore
