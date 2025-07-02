from fastapi.testclient import TestClient

from tests.conftest import client, fake


def test_login_success(client: TestClient):
    # create user
    data = {"email": fake.email(), "password": fake.password()}
    response = client.post("/users", json=data)
    assert response.status_code == 201

    # login
    response = client.post(
        "/auth/tokens", data={"username": data["email"], "password": data["password"]}
    )
    assert response.status_code == 200


def test_login_incorrect_password(client: TestClient):
    data = {"email": fake.email(), "password": fake.password()}
    response = client.post("/users", json=data)
    assert response.status_code == 201

    response = client.post(
        "/auth/tokens", data={"username": data["email"], "password": "incorrect"}
    )
    assert response.status_code == 401


def test_login_user_not_found(client: TestClient):
    response = client.post(
        "/auth/tokens", data={"username": "notfound@email.com", "password": "incorrect"}
    )
    assert response.status_code == 401
