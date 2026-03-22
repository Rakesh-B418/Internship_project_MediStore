from flask import Blueprint, request, jsonify
from utils.db_manager import get_user_db
from utils.jwt_helper import token_required

settings_bp = Blueprint("settings", __name__)


def _get_db():
    return get_user_db(request.current_user["db_name"])


# ── Discount Rules ─────────────────────────────────────────────────────────────

@settings_bp.route("/settings/discount", methods=["GET"])
@token_required
def get_discounts():
    db = _get_db()
    settings = db["settings"].find_one({"type": "discount_rules"})
    if settings:
        return jsonify(settings.get("rules", [])), 200

    defaults = [
        {"days": 5, "discount": 30.0},
        {"days": 15, "discount": 20.0},
        {"days": 30, "discount": 10.0}
    ]
    return jsonify(defaults), 200


@settings_bp.route("/settings/discount", methods=["PUT"])
@token_required
def set_discounts():
    db = _get_db()
    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({"error": "Expected a list of rules"}), 400

    db["settings"].update_one(
        {"type": "discount_rules"},
        {"$set": {"rules": data}},
        upsert=True
    )
    return jsonify({"message": "Settings updated"}), 200


# ── Store Information ──────────────────────────────────────────────────────────

@settings_bp.route("/settings/store-info", methods=["GET"])
@token_required
def get_store_info():
    db = _get_db()
    info = db["settings"].find_one({"type": "store_info"})
    if info:
        return jsonify({
            "store_name": info.get("store_name", ""),
            "address": info.get("address", ""),
            "phone": info.get("phone", ""),
            "email": info.get("email", ""),
            "gstin": info.get("gstin", ""),
        }), 200
    return jsonify({
        "store_name": "",
        "address": "",
        "phone": "",
        "email": "",
        "gstin": "",
    }), 200


@settings_bp.route("/settings/store-info", methods=["PUT"])
@token_required
def set_store_info():
    db = _get_db()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    update = {
        "store_name": data.get("store_name", ""),
        "address": data.get("address", ""),
        "phone": data.get("phone", ""),
        "email": data.get("email", ""),
        "gstin": data.get("gstin", ""),
    }

    db["settings"].update_one(
        {"type": "store_info"},
        {"$set": update},
        upsert=True
    )
    return jsonify({"message": "Store info updated"}), 200
