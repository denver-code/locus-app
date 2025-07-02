from typing import Generator

from faker import Faker
from fastapi.testclient import TestClient
from pytest import fixture

fake = Faker()


def get_random_accont_credentials(client: TestClient):
    data = {"email": fake.email(), "password": fake.password()}
    create_response = client.post("/users", json=data)
    assert create_response.status_code == 201

    token_response = client.post(
        "/auth/tokens", data={"username": data["email"], "password": data["password"]}
    )
    assert token_response.status_code == 200
    headers = {"Authorization": f"Bearer {token_response.json()['access_token']}"}
    return {**create_response.json(), "password": data["password"]}, headers


@fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    from kanban_api.main import app

    with TestClient(app, base_url="http://testserver/api") as client:
        yield client


@fixture(scope="session")
def auth_client(client: TestClient) -> TestClient:
    _, headers = get_random_accont_credentials(client)
    client.headers.update(headers)
    return client
