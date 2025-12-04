from typing import List

BACKEND_HOST = "0.0.0.0"
BACKEND_PORT = 8000

ALLOWED_ORIGINS: List[str] = [
    "http://localhost:3000",   #frontend
    "http://127.0.0.1:3000",
]