import os
import tempfile

from faker import Faker

fake = Faker()

os.environ["DB_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"
os.environ["SECRET_KEY"] = fake.hexify(text="^" * 64)
os.environ["ALGORITHM"] = "HS256"
os.environ["POPULATE_DB"] = "FALSE"
os.environ["STATIC_FILES_DIR"] = "/"
