"""
db_manager.py
-------------
Centralised MongoDB connection manager.

Architecture:
  - ONE shared MongoClient (connection pool) for the whole process.
  - Each registered user is assigned a dedicated database: "user_<username>"
  - The central database (CENTRAL_DB_NAME) holds only the `users` collection
    with metadata: username, hashed_password, db_name.
  - All inventory / products / sales / settings data lives in the user's own DB.
"""

from pymongo import MongoClient
from config import MONGO_URI

# ------------------------------------------------------------------
# Single connection pool shared across all requests
# ------------------------------------------------------------------
_client: MongoClient = MongoClient(MONGO_URI)

# Central DB – stores only the users collection
CENTRAL_DB_NAME = "supplysense_central"


def get_central_db():
    """Return the central database (users collection only)."""
    return _client[CENTRAL_DB_NAME]


def get_user_db(db_name: str):
    """Return the per-user database for the given db_name."""
    if not db_name:
        raise ValueError("db_name must not be empty")
    return _client[db_name]


def sanitize_db_name(username: str) -> str:
    """
    Create a safe MongoDB database name from a username.
    MongoDB DB names cannot contain: / \\ . " $  (null byte) or spaces.
    We prefix with 'user_' and keep only alphanumeric + underscore chars.
    """
    safe = "".join(c if c.isalnum() or c == "_" else "_" for c in username.lower())
    return f"user_{safe}"
