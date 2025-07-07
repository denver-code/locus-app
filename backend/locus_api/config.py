from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Locus API"
    debug: bool = False
    use_static: bool = False
    secret_key: str
    algorithm: str
    db_url: str
    cors_origins: str = "http://localhost:3000,http://localhost:8080"
    db_echo: bool = False
    drop_all: bool = False
    static_files_dir: str = "static"
    populate_db: bool = False

    model_config = {"env_file": ".env", "case_sensitive": False, "extra": "ignore"}


settings = Settings()  # type: ignore
