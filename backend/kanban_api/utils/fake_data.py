import random
from pathlib import Path

from faker import Faker

from kanban_api.models import Board, Card, Label, User
from kanban_api.schemas.card import CardColumn
from kanban_api.schemas.label import LabelColor
from kanban_api.utils.password import get_password_hash


class FakeData:
    def __init__(self):
        self.fake = Faker()
        self.user_count = 0

        with open(Path(__file__).parent / "sample.md", "r") as file:
            self.markdown = file.read()

    def user(self, **kwargs):
        self.user_count += 1
        return User(
            email=f"user{self.user_count}@example.com",
            hashed_password=get_password_hash("password"),
            **kwargs,
        )

    def board(self, owners: list[User], **kwargs):
        return Board(
            title=self.fake.sentence(nb_words=5, variable_nb_words=True),
            description=self.markdown,
            labels=[
                Label(
                    color=color,
                    name=random.choice(
                        [self.fake.sentence(nb_words=1, variable_nb_words=False), ""]
                    ),
                )
                for color in LabelColor
            ],
            owners=owners,
            **kwargs,
        )

    def card(self, board: Board, **kwargs):
        return Card(
            title=self.fake.sentence(nb_words=10, variable_nb_words=True),
            description=self.fake.text(max_nb_chars=100),
            column=random.choice(list(CardColumn)),
            board=board,
            labels=random.sample(board.labels, random.randint(0, 3)),
            **kwargs,
        )

    def generate(self, num_users: int, num_boards: int, num_cards: int):
        users = [self.user() for _ in range(num_users)]
        boards = [
            self.board(owners=random.sample(users, random.randint(1, 3))) for _ in range(num_boards)
        ]
        cards = [self.card(board=random.choice(boards)) for _ in range(num_cards)]
        return users
