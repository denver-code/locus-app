# Backend Component

FastAPI implementation of Kanban board API. Handles data storage, authentication, and board operations.

## Core Features

- User authentication and management
- Board CRUD operations
- Card management with labels
- PostgreSQL database with SQLAlchemy
- Automatic API documentation
- Development data seeding

## Quick Setup

1. Requirements:

   - Python >= 3.10
   - Poetry
   - PostgreSQL 15
   - Nox (`pip install --user nox`)

2. Install dependencies:

```bash
poetry install
```

3. Configure environment:

   - Copy `.env.example` to `.env`
   - Required variables:
     ```env
     SECRET_KEY=your-secret-key
     ALGORITHM=HS256
     DB_URL=sqlite:///./kanban.db  # or postgresql://user:pass@host/db
     ```
   - Optional settings:
     ```env
     DEBUG=false
     DB_ECHO=false        # SQL query logging
     DROP_ALL=false       # Reset database on startup
     POPULATE_DB=false    # Seed test data
     ```

4. Development commands:

```bash
# Individual commands
nox -s format  # Format code
nox -s lint    # Check code
nox -s test    # Run tests
nox -s dev     # Start dev server with auto-reload
```

## Docker Support

```bash
# Run tests
docker build --target test -t kanban-api-test .
docker run kanban-api-test

# Production build
docker build --target prod -t kanban-api .
docker run -p 8000:8000 kanban-api
```

## Project Structure

```
kanban_api/
├── routes/          # API endpoints
├── schemas/         # Pydantic models
├── utils/           # Helper functions
├── config.py        # Settings
├── database.py      # DB setup
├── dependencies.py  # FastAPI dependencies
├── main.py         # App entry
└── models.py       # SQLAlchemy models
```

## Development Notes

- API runs on port 8000
- Swagger docs at `/docs`
- Set `POPULATE_DB=true` to seed 7 users, 28 boards, 600 cards. Emails: `user[1-7]@example.com`, Passwords: `password`
- Tests use separate database
- Static files served from `/static` directory for frontend
- Supports both SQLite and PostgreSQL
