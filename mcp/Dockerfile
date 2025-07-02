FROM python:3.11-slim

WORKDIR /app

# Install uv for dependency management
RUN pip install uv

# Copy dependency files first for better layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv pip install --system .

# Copy application files
COPY src/ src/

# Create directory for token storage
RUN mkdir -p /tmp

# Run the server
CMD ["python", "-m", "src.server"]