from kanban_api.utils import get_password_hash, verify_password


def test_hashed_is_str():
    assert isinstance(get_password_hash("password"), str)


def test_verify_is_bool():
    assert isinstance(verify_password("password", get_password_hash("password")), bool)
    assert isinstance(verify_password("password", get_password_hash("different_password")), bool)


def test_same_password_returns_true():
    assert verify_password("password", get_password_hash("password"))
    assert verify_password("", get_password_hash(""))


def test_different_password_returns_false():
    assert not verify_password("password", get_password_hash("different_password"))
