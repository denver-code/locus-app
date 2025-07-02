from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Identity, UniqueConstraint, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from kanban_api.schemas.card import CardColumn
from kanban_api.schemas.label import LabelColor


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class User(Base, TimestampMixin):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)

    # Relationships
    boards: Mapped[list["Board"]] = relationship(
        "Board", secondary="users_boards", back_populates="owners"
    )


class Board(Base, TimestampMixin):
    __tablename__ = "board"

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    title: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=True)

    # Relationships
    cards: Mapped[list["Card"]] = relationship(
        "Card", back_populates="board", cascade="all, delete-orphan"
    )
    owners: Mapped[list["User"]] = relationship(
        "User", secondary="users_boards", back_populates="boards"
    )
    labels: Mapped[list["Label"]] = relationship(
        "Label", back_populates="board", cascade="all, delete-orphan"
    )


class Card(Base, TimestampMixin):
    __tablename__ = "card"

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    title: Mapped[str] = mapped_column(nullable=False)
    column: Mapped[CardColumn] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=True)
    board_id: Mapped[int] = mapped_column(
        ForeignKey("board.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # Relationships
    board: Mapped["Board"] = relationship("Board", back_populates="cards")
    labels: Mapped[list["Label"]] = relationship(
        "Label", secondary="cards_labels", back_populates="cards"
    )


class Label(Base, TimestampMixin):
    __tablename__ = "label"

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    board_id: Mapped[int] = mapped_column(
        ForeignKey("board.id", ondelete="CASCADE"), index=True, nullable=False
    )
    color: Mapped[LabelColor] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)

    # Relationships
    board: Mapped["Board"] = relationship("Board", back_populates="labels")
    cards: Mapped[list["Card"]] = relationship(
        "Card", secondary="cards_labels", back_populates="labels"
    )

    __table_args__ = (UniqueConstraint("board_id", "color", name="uq_board_id_color"),)


class UserBoard(Base, TimestampMixin):
    __tablename__ = "users_boards"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), primary_key=True, index=True
    )
    board_id: Mapped[int] = mapped_column(
        ForeignKey("board.id", ondelete="CASCADE"), primary_key=True, index=True
    )


class CardLabel(Base, TimestampMixin):
    __tablename__ = "cards_labels"

    card_id: Mapped[int] = mapped_column(
        ForeignKey("card.id", ondelete="CASCADE"), primary_key=True, index=True
    )
    label_id: Mapped[int] = mapped_column(
        ForeignKey("label.id", ondelete="CASCADE"), primary_key=True, index=True
    )
