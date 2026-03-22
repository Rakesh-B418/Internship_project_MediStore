import jwt
import datetime
from functools import wraps
from flask import request, jsonify
from config import JWT_SECRET, JWT_EXPIRY_HOURS


def generate_token(user_id: str, username: str, db_name: str) -> str:
    payload = {
        "user_id": user_id,
        "username": username,
        "db_name": db_name,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            data = decode_token(token)
            # Ensure db_name is always present (backwards compat)
            if "db_name" not in data:
                data["db_name"] = f"user_{data.get('username', 'unknown')}"
            request.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated
