from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from utils.db_manager import get_user_db
from utils.jwt_helper import token_required
from utils.expiry_logic import get_expiry_status, get_auto_discount, calculate_final_price

inventory_bp = Blueprint("inventory", __name__)


def _get_cols():
    """Return (inventory_col, products_col) for the current user's database."""
    db = get_user_db(request.current_user["db_name"])
    return db["inventory"], db["products"]


def serialize_inventory_item(item, product):
    expiry_date = item.get("expiry_date")
    expiry_str = expiry_date.date().isoformat() if hasattr(expiry_date, "date") else str(expiry_date)

    status = get_expiry_status(expiry_date)
    discount = get_auto_discount(expiry_date)
    price = product.get("price", 0) if product else 0
    final_price = calculate_final_price(price, discount)

    return {
        "_id": str(item["_id"]),
        "product_id": str(item["product_id"]),
        "product_name": product.get("name", "Unknown") if product else "Unknown",
        "category": product.get("category", "") if product else "",
        "base_price": price,
        "quantity": item.get("quantity", 0),
        "expiry_date": expiry_str,
        "expiry_status": status,
        "discount_percentage": discount,
        "final_price": final_price,
        "low_stock": item.get("quantity", 0) < 10,
    }


@inventory_bp.route("/inventory", methods=["GET"])
@token_required
def get_inventory():
    inventory_col, products_col = _get_cols()
    sort_by = request.args.get("sort_by", "expiry_date")
    items = list(inventory_col.find())

    result = []
    for item in items:
        product = products_col.find_one({"_id": item["product_id"]})
        result.append(serialize_inventory_item(item, product))

    if sort_by == "discount_percentage":
        result.sort(key=lambda x: x["discount_percentage"], reverse=True)
    elif sort_by == "quantity":
        result.sort(key=lambda x: x["quantity"])
    elif sort_by == "base_price":
        result.sort(key=lambda x: x["base_price"])
    elif sort_by == "product_name":
        result.sort(key=lambda x: x["product_name"].lower())
    else:
        result.sort(key=lambda x: x["expiry_date"])

    return jsonify(result), 200


@inventory_bp.route("/inventory", methods=["POST"])
@token_required
def add_inventory():
    inventory_col, products_col = _get_cols()
    data = request.get_json()
    if not data or not data.get("product_id") or not data.get("expiry_date"):
        return jsonify({"error": "product_id and expiry_date are required"}), 400

    try:
        product_oid = ObjectId(data["product_id"])
    except Exception:
        return jsonify({"error": "Invalid product_id"}), 400

    product = products_col.find_one({"_id": product_oid})
    if not product:
        return jsonify({"error": "Product not found"}), 404

    try:
        expiry_date = datetime.fromisoformat(data["expiry_date"])
    except ValueError:
        return jsonify({"error": "Invalid expiry_date format. Use ISO format: YYYY-MM-DD"}), 400

    try:
        quantity = int(data.get("quantity", 0) or 0)
    except ValueError:
        return jsonify({"error": "Invalid quantity format"}), 400

    new_item = {
        "product_id": product_oid,
        "quantity": quantity,
        "expiry_date": expiry_date,
    }
    result = inventory_col.insert_one(new_item)
    new_item["_id"] = result.inserted_id
    return jsonify(serialize_inventory_item(new_item, product)), 201


@inventory_bp.route("/inventory/<item_id>", methods=["PUT"])
@token_required
def update_inventory(item_id):
    inventory_col, products_col = _get_cols()
    try:
        oid = ObjectId(item_id)
    except Exception:
        return jsonify({"error": "Invalid inventory ID"}), 400

    data = request.get_json()
    update_fields = {}

    if "quantity" in data:
        try:
            update_fields["quantity"] = int(data["quantity"])
        except ValueError:
            return jsonify({"error": "Invalid quantity"}), 400

    if "expiry_date" in data:
        try:
            update_fields["expiry_date"] = datetime.fromisoformat(data["expiry_date"])
        except ValueError:
            return jsonify({"error": "Invalid expiry_date format"}), 400

    result = inventory_col.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"error": "Item not found"}), 404

    updated = inventory_col.find_one({"_id": oid})
    product = products_col.find_one({"_id": updated["product_id"]})
    return jsonify(serialize_inventory_item(updated, product)), 200


@inventory_bp.route("/inventory/<item_id>", methods=["DELETE"])
@token_required
def delete_inventory(item_id):
    inventory_col, _ = _get_cols()
    try:
        oid = ObjectId(item_id)
    except Exception:
        return jsonify({"error": "Invalid inventory ID"}), 400

    result = inventory_col.delete_one({"_id": oid})
    if result.deleted_count == 0:
        return jsonify({"error": "Item not found"}), 404

    return jsonify({"message": "Inventory item deleted"}), 200
