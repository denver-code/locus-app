from fastapi.testclient import TestClient
from pytest import fixture

from kanban_api.schemas.label import LabelColor
from tests.conftest import auth_client, fake


@fixture()
def populated_cards(auth_client: TestClient):
    print("populated_cards")
    response = auth_client.post(
        "/boards", json={"title": fake.sentence(), "description": fake.sentence()}
    )
    assert response.status_code == 201
    board_id = response.json()["id"]
    data = [{"title": fake.sentence(), "description": fake.sentence()} for _ in range(3)]
    response = auth_client.post(f"/boards/{board_id}/cards", json=data)
    assert response.status_code == 201
    cards = response.json()
    return cards


def test_get_card(auth_client: TestClient, populated_cards):
    card = populated_cards[0]  # type: ignore
    card_id = card["id"]
    response = auth_client.get(f"/cards/{card_id}")
    assert response.status_code == 200
    assert response.json()["id"] == card_id
    assert response.json()["title"] == card["title"]
    assert response.json()["description"] == card["description"]
    assert response.json()["boardId"] == card["boardId"]
    assert response.json()["labels"] == card["labels"]


def test_update_card(auth_client: TestClient, populated_cards):
    card = populated_cards[0]  # type: ignore
    card_id = card["id"]
    data = {"title": fake.sentence(), "description": fake.sentence()}
    response = auth_client.patch(f"/cards/{card_id}", json=data)
    assert response.status_code == 200
    assert response.json()["id"] == card_id
    assert response.json()["title"] == data["title"]
    assert response.json()["description"] == data["description"]
    assert response.json()["boardId"] == card["boardId"]
    assert response.json()["labels"] == card["labels"]

    # modify labels
    data = {"labels": [LabelColor.RED, LabelColor.GREEN]}
    response = auth_client.patch(f"/cards/{card_id}", json=data)
    assert response.status_code == 200
    assert response.json()["labels"] == data["labels"]

    # update column
    data = {"column": "TODO"}
    response = auth_client.patch(f"/cards/{card_id}", json=data)
    assert response.status_code == 200
    assert response.json()["column"] == data["column"]


def test_delete_card(auth_client: TestClient, populated_cards):
    card = populated_cards[0]  # type: ignore
    card_id = card["id"]
    response = auth_client.delete(f"/cards/{card_id}")
    assert response.status_code == 204

    response = auth_client.get(f"/cards/{card_id}")
    assert response.status_code == 404
