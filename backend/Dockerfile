FROM python:3.12-slim

WORKDIR /app

# Runtime deps only (wheels — no build toolchain needed for cryptography/pyjwt).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
