from flask import Blueprint, jsonify, request
from bson import ObjectId
from utils.db_manager import get_user_db
from utils.jwt_helper import token_required
from utils.expiry_logic import get_expiry_status, calculate_final_price, get_auto_discount

analytics_bp = Blueprint("analytics", __name__)


def _get_db():
    return get_user_db(request.current_user["db_name"])


@analytics_bp.route("/analytics", methods=["GET"])
@token_required
def get_analytics():
    db = _get_db()
    sales_col = db["sales"]
    products_col = db["products"]
    inventory_col = db["inventory"]

    # Aggregate total sales per product
    pipeline = [
        {"$group": {"_id": "$product_id", "total_sold": {"$sum": "$quantity_sold"}}},
        {"$sort": {"total_sold": -1}},
    ]
    sales_data = list(sales_col.aggregate(pipeline))

    def enrich(entry):
        pid = entry["_id"]
        product = products_col.find_one({"_id": pid}) if isinstance(pid, ObjectId) else None
        return {
            "product_id": str(pid),
            "product_name": product.get("name", "Unknown") if product else "Unknown",
            "category": product.get("category", "") if product else "",
            "total_sold": entry["total_sold"],
        }

    enriched = [enrich(e) for e in sales_data]
    most_sold = enriched[:5]
    least_sold = list(reversed(enriched[-5:])) if len(enriched) >= 5 else list(reversed(enriched))

    # Expiry loss: sum of (price * quantity) for expired items
    expiry_loss = 0.0
    expired_items = []
    for item in inventory_col.find():
        status = get_expiry_status(item.get("expiry_date"))
        if status == "Expired":
            product = products_col.find_one({"_id": item["product_id"]})
            price = product.get("price", 0) if product else 0
            qty = item.get("quantity", 0)
            loss = price * qty
            expiry_loss += loss
            if product:
                expired_items.append({
                    "product_name": product.get("name", "Unknown"),
                    "quantity": qty,
                    "loss": round(loss, 2),
                })

    return jsonify({
        "most_sold": most_sold,
        "least_sold": least_sold,
        "expiry_loss": {
            "total_loss": round(expiry_loss, 2),
            "items": expired_items,
        },
    }), 200
