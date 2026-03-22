from flask import Blueprint, request, jsonify
from bson import ObjectId
from utils.db_manager import get_user_db
from utils.jwt_helper import token_required

products_bp = Blueprint("products", __name__)


def _products_col():
    return get_user_db(request.current_user["db_name"])["products"]


def serialize_product(p):
    return {
        "_id": str(p["_id"]),
        "name": p.get("name", ""),
        "category": p.get("category", ""),
        "price": p.get("price", 0),
    }


@products_bp.route("/products", methods=["GET"])
@token_required
def get_products():
    products_col = _products_col()
    search = request.args.get("search", "").strip()
    query = {}
    if search:
        query = {"$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]}
    products = [serialize_product(p) for p in products_col.find(query)]
    return jsonify(products), 200


@products_bp.route("/products", methods=["POST"])
@token_required
def add_product():
    products_col = _products_col()
    data = request.get_json()
    if not data or not data.get("name") or not data.get("price"):
        return jsonify({"error": "name and price are required"}), 400

    product = {
        "name": data["name"],
        "category": data.get("category", "General"),
        "price": float(data["price"]),
    }
    result = products_col.insert_one(product)
    product["_id"] = str(result.inserted_id)
    return jsonify(product), 201


@products_bp.route("/products/<product_id>", methods=["PUT"])
@token_required
def update_product(product_id):
    products_col = _products_col()
    try:
        oid = ObjectId(product_id)
    except Exception:
        return jsonify({"error": "Invalid product ID"}), 400

    data = request.get_json()
    update_fields = {}
    if "name" in data:
        update_fields["name"] = data["name"]
    if "category" in data:
        update_fields["category"] = data["category"]
    if "price" in data:
        update_fields["price"] = float(data["price"])

    result = products_col.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        return jsonify({"error": "Product not found"}), 404

    updated = products_col.find_one({"_id": oid})
    return jsonify(serialize_product(updated)), 200


@products_bp.route("/products/<product_id>", methods=["DELETE"])
@token_required
def delete_product(product_id):
    products_col = _products_col()
    try:
        oid = ObjectId(product_id)
    except Exception:
        return jsonify({"error": "Invalid product ID"}), 400

    result = products_col.delete_one({"_id": oid})
    if result.deleted_count == 0:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({"message": "Product deleted successfully"}), 200
