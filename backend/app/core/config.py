import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_PORT = os.getenv("DATABASE_PORT")
DATABASE_NAME = os.getenv("DATABASE_NAME")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")

JWT_SECRET_KEY = "change-this-to-a-random-secret-key"
JWT_ALGORITHM = "HS256"