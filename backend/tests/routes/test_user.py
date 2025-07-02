from fastapi.testclient import TestClient
from pytest import fixture

from tests.conftest import auth_client, client, fake, get_random_accont_credentials

# test creat user status code and correct output
# test create user existing email


def test_create_user(client: TestClient):
    data = {"email": fake.email(), "password": fake.password()}
    response = client.post("/users", json=data)
    assert response.status_code == 201
    assert response.json()["email"] == data["email"]
    assert response.json()["id"] is not None


def test_create_user_existing_email(client: TestClient):
    data = {"email": fake.email(), "password": fake.password()}
    response = client.post("/users", json=data)
    assert response.status_code == 201

    response = client.post("/users", json=data)
    assert response.status_code == 409


def test_get_me(auth_client: TestClient):
    response = auth_client.get("/users/me")
    assert response.status_code == 200


def test_get_user(auth_client: TestClient):
    data = {"email": fake.email(), "password": fake.password()}

    # test without user
    response = auth_client.post("/users/search", json={"email": data["email"]})
    assert response.status_code == 404

    # create user
    response = auth_client.post("/users", json=data)
    assert response.status_code == 201

    print(response.json())
    print(data)

    # test with user
    response = auth_client.post("/users/search", json={"email": data["email"]})
    assert response.status_code == 200
    assert response.json()["email"] == data["email"]
    assert response.json()["id"] is not None


def test_update_user(auth_client: TestClient):
    # create two users and get headers
    user1, headers1 = get_random_accont_credentials(auth_client)
    user2, headers2 = get_random_accont_credentials(auth_client)

    response = auth_client.patch(f"/users/me", json={"email": user1["email"]}, headers=headers2)
    assert response.status_code == 409

    # test update email
    new_email = fake.email()
    response = auth_client.patch(f"/users/me", json={"email": new_email}, headers=headers1)
    assert response.status_code == 200
    assert response.json()["email"] == new_email

    # test email not found
    response = auth_client.post("/users/search", json={"email": user1["email"]})
    assert response.status_code == 404

    # test update password
    new_password = fake.password()
    response = auth_client.patch(f"/users/me", json={"password": new_password}, headers=headers2)
    assert response.status_code == 200
    assert response.json()["email"] == user2["email"]

    # test no longer valid token
    response = auth_client.post(
        "/auth/tokens", data={"username": user2["email"], "password": user2["password"]}
    )
    assert response.status_code == 401

    # test valid token
    response = auth_client.post(
        "/auth/tokens", data={"username": user2["email"], "password": new_password}
    )
    assert response.status_code == 200

    # test update email and password
    new_email2 = fake.email()
    response = auth_client.patch(
        f"/users/me", json={"email": new_email2, "password": new_password}, headers=headers1
    )
    assert response.status_code == 200
