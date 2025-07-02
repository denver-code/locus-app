from fastapi.testclient import TestClient
from pytest import fixture

from tests.conftest import auth_client, fake, get_random_accont_credentials


@fixture(scope="function")
def board(auth_client: TestClient):
    data = {"title": fake.sentence(), "description": fake.sentence()}
    response = auth_client.post("/boards", json=data)
    assert response.status_code == 201
    return response.json()


def test_list_boards(auth_client: TestClient):
    response = auth_client.get("/boards")
    assert response.status_code == 200


def test_create_board(auth_client: TestClient):
    data = {"title": fake.sentence(), "description": fake.sentence()}
    response = auth_client.post("/boards", json=data)
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert len(content["labels"]) == 7
    assert content["id"] is not None


def test_get_board(auth_client: TestClient, board: dict):
    response = auth_client.get(f"/boards/{board['id']}")
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == board["title"]
    assert content["description"] == board["description"]
    assert content["id"] == board["id"]


def test_delete_board(auth_client: TestClient, board: dict):
    response = auth_client.delete(f"/boards/{board['id']}")
    assert response.status_code == 204

    # test delete again returns 404
    response = auth_client.delete(f"/boards/{board['id']}")
    assert response.status_code == 404


def test_update_board(auth_client: TestClient, board: dict):
    def froze_labels(labels: list[dict]) -> set:
        return set(tuple(label.items()) for label in labels)

    # update for title, description, labels, then all together

    # title
    new_title = fake.sentence()
    response = auth_client.patch(f"/boards/{board['id']}", json={"title": new_title})
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == new_title
    assert content["id"] == board["id"]
    assert content["description"] == board["description"]
    assert froze_labels(content["labels"]) == froze_labels(board["labels"])

    # description
    new_description = fake.sentence()
    response = auth_client.patch(f"/boards/{board['id']}", json={"description": new_description})
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == new_title
    assert content["id"] == board["id"]
    assert content["description"] == new_description
    assert froze_labels(content["labels"]) == froze_labels(board["labels"])

    # labels
    new_labels = [{"color": "red", "name": "one"}, {"color": "blue", "name": "two"}]
    response = auth_client.patch(f"/boards/{board['id']}", json={"labels": new_labels})
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == new_title
    assert content["id"] == board["id"]
    assert content["description"] == new_description
    assert froze_labels(content["labels"]) >= froze_labels(new_labels)
    assert froze_labels(content["labels"]) - froze_labels(new_labels) <= froze_labels(
        board["labels"]
    )


def test_create_cards(auth_client: TestClient, board: dict):
    # single card
    data = [{"title": fake.sentence(), "description": fake.sentence()}]
    response = auth_client.post(f"/boards/{board['id']}/cards", json=data)
    assert response.status_code == 201
    content = response.json()
    assert len(content) == 1
    assert content[0]["title"] == data[0]["title"]
    assert content[0]["description"] == data[0]["description"]
    assert content[0]["id"] is not None

    # multiple cards
    data = [
        {"title": fake.sentence(), "column": "TODO"},
        {"title": fake.sentence(), "description": fake.sentence()},
    ]
    response = auth_client.post(f"/boards/{board['id']}/cards", json=data)
    assert response.status_code == 201
    content = response.json()
    assert len(content) == 2
    assert set(card["title"] for card in content) == set(card["title"] for card in data)


def test_list_cards(auth_client: TestClient, board: dict):
    # no cards
    response = auth_client.get(f"/boards/{board['id']}/cards")
    assert response.status_code == 200
    assert len(response.json()) == 0

    # create N cards
    N = 10
    data = [{"title": fake.sentence(), "description": fake.sentence()} for _ in range(N)]
    response = auth_client.post(f"/boards/{board['id']}/cards", json=data)
    assert response.status_code == 201
    assert len(response.json()) == N

    # list cards
    response = auth_client.get(f"/boards/{board['id']}/cards")
    assert response.status_code == 200
    content = response.json()
    assert len(content) == N
    assert set(card["title"] for card in content) == set(card["title"] for card in data)


def test_share_board(client: TestClient, auth_client: TestClient, board: dict):
    # create account
    account, headers = get_random_accont_credentials(client)

    # test that the user cannot see the board
    response = client.get(f"/boards/{board['id']}", headers=headers)
    assert response.status_code == 404

    # share board
    response = auth_client.put(f"/boards/{board['id']}/users/{account['id']}")
    assert response.status_code == 200

    # test that the user can see the board
    response = client.get(f"/boards/{board['id']}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == board["id"]

    # unshare board
    response = auth_client.delete(f"/boards/{board['id']}/users/{account['id']}")
    assert response.status_code == 204

    # test that the user cannot see the board
    response = client.get(f"/boards/{board['id']}", headers=headers)
    assert response.status_code == 404


def test_list_users(auth_client: TestClient, board: dict):
    response = auth_client.get(f"/boards/{board['id']}/users")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # create account
    account, headers = get_random_accont_credentials(auth_client)

    # share board
    response = auth_client.put(f"/boards/{board['id']}/users/{account['id']}")
    assert response.status_code == 200

    # list users
    response = auth_client.get(f"/boards/{board['id']}/users")
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert account["id"] in [user["id"] for user in response.json()]
