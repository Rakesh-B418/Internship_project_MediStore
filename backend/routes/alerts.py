from flask import Blueprint, jsonify, request
from utils.db_manager import get_user_db
from utils.jwt_helper import token_required
from utils.expiry_logic import get_expiry_status, get_auto_discount

alerts_bp = Blueprint("alerts", __name__)


def _get_cols():
    db = get_user_db(request.current_user["db_name"])
    return db["inventory"], db["products"]


@alerts_bp.route("/alerts", methods=["GET"])
@token_required
def get_alerts():
    inventory_col, products_col = _get_cols()
    items = list(inventory_col.find())
    expired = []
    expiring_soon = []
    low_stock = []

    for item in items:
        product = products_col.find_one({"_id": item["product_id"]})
        product_name = product.get("name", "Unknown") if product else "Unknown"
        category = product.get("category", "") if product else ""
        expiry_date = item.get("expiry_date")
        expiry_str = expiry_date.date().isoformat() if hasattr(expiry_date, "date") else str(expiry_date)
        status = get_expiry_status(expiry_date)
        discount = get_auto_discount(expiry_date)

        base = {
            "_id": str(item["_id"]),
            "product_name": product_name,
            "category": category,
            "quantity": item.get("quantity", 0),
            "expiry_date": expiry_str,
            "discount_percentage": discount,
        }

        if status == "Expired":
            expired.append(base)
        elif status == "Expiring Soon":
            expiring_soon.append(base)

        if item.get("quantity", 0) < 10:
            low_stock.append(base)

    return jsonify({
        "expired": expired,
        "expiring_soon": expiring_soon,
        "low_stock": low_stock,
        "summary": {
            "expired_count": len(expired),
            "expiring_soon_count": len(expiring_soon),
            "low_stock_count": len(low_stock),
            "total_products": len(items),
            "safe_count": len([i for i in items if get_expiry_status(i.get("expiry_date")) == "Safe"]),
        },
    }), 200


@alerts_bp.route("/alerts/summary", methods=["GET"])
@token_required
def get_alerts_summary():
    inventory_col, _ = _get_cols()
    items = list(inventory_col.find())
    expired_count: int = 0
    expiring_soon_count: int = 0

    for item in items:
        status = get_expiry_status(item.get("expiry_date"))
        if status == "Expired":
            expired_count += 1
        elif status == "Expiring Soon":
            expiring_soon_count += 1

    return jsonify({
        "total_medicines": len(items),
        "expired_medicines": expired_count,
        "near_expiry": expiring_soon_count
    }), 200
