import re
import bcrypt
from flask import Blueprint, request, jsonify
from utils.db_manager import get_central_db, sanitize_db_name
from utils.jwt_helper import generate_token

auth_bp = Blueprint("auth", __name__)


# ── helpers ───────────────────────────────────────────────────────────────────

def _users_col():
    return get_central_db()["users"]


# ── routes ────────────────────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip() if data else ""
    password = data.get("password", "") if data else ""

    if not username or not password:
        return jsonify({"error": "Username and password cannot be empty"}), 400

    user = _users_col().find_one({"username": username})
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    db_name = user.get("db_name", sanitize_db_name(username))
    token = generate_token(str(user["_id"]), user["username"], db_name)
    return jsonify({"token": token, "username": user["username"]}), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip() if data else ""
    password = data.get("password", "") if data else ""

    if not username or not password:
        return jsonify({"error": "Username and password cannot be empty"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    # Basic username validation – alphanumeric + underscore only
    if not re.match(r"^[A-Za-z0-9_]+$", username):
        return jsonify({"error": "Username may only contain letters, digits, and underscores"}), 400

    users_col = _users_col()
    if users_col.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    db_name = sanitize_db_name(username)

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    result = users_col.insert_one({
        "username": username,
        "password": hashed_pw,
        "db_name": db_name,
    })

    token = generate_token(str(result.inserted_id), username, db_name)
    return jsonify({"token": token, "username": username}), 201


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    if not data or not data.get("username"):
        return jsonify({"error": "Username is required"}), 400

    return jsonify({
        "message": "If the account exists, a password reset link has been sent to your registered email."
    }), 200
