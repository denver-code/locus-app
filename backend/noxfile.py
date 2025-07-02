import nox


@nox.session(reuse_venv=True)
def test(session):
    session.install(".")
    session.install("pytest", "httpx")
    session.run("mkdir", "-p", "static")
    session.run("pytest")


@nox.session(reuse_venv=True)
def lint(session):
    session.install("ruff")
    session.run("ruff", "check", "kanban_api/", "tests/")


@nox.session(reuse_venv=True)
def format(session):
    session.install("ruff", "black")
    session.run("ruff", "format", "kanban_api/", "tests/")
    session.run("black", "kanban_api/", "tests/")


@nox.session(venv_backend="none")
def dev(session):
    session.run("fastapi", "dev", "kanban_api/main.py", "--host", "0.0.0.0", "--port", "8000")
