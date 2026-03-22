from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from utils.db_manager import get_user_db
from utils.jwt_helper import token_required
from utils.expiry_logic import get_expiry_status, get_auto_discount, calculate_final_price

billing_bp = Blueprint("billing", __name__)


def _get_db():
    return get_user_db(request.current_user["db_name"])


# ── Checkout ───────────────────────────────────────────────────────────────────

@billing_bp.route("/billing/checkout", methods=["POST"])
@token_required
def checkout():
    db = _get_db()
    data = request.get_json()
    items = data.get("items", [])
    customer_name = data.get("customer_name", "").strip()
    discount_override = float(data.get("discount_percent", 0) or 0)

    if not items:
        return jsonify({"error": "Cart is empty"}), 400

    bill_items = []
    sales = []

    for req_item in items:
        inv_id = req_item.get("inventory_id")
        qty_to_buy = int(req_item.get("quantity", 0))

        if qty_to_buy <= 0:
            continue

        try:
            inv_oid = ObjectId(inv_id)
        except Exception:
            return jsonify({"error": f"Invalid inventory ID: {inv_id}"}), 400

        inv_doc = db["inventory"].find_one({"_id": inv_oid})
        if not inv_doc:
            return jsonify({"error": "Inventory item not found"}), 404

        if inv_doc.get("quantity", 0) < qty_to_buy:
            return jsonify({"error": "Not enough stock!"}), 400

        product = db["products"].find_one({"_id": inv_doc["product_id"]})
        base_price = product.get("price", 0) if product else 0
        product_name = product.get("name", "Unknown") if product else "Unknown"
        expiry_date = inv_doc.get("expiry_date")
        auto_discount = get_auto_discount(expiry_date)
        final_price = calculate_final_price(base_price, auto_discount)

        db["inventory"].update_one(
            {"_id": inv_oid},
            {"$inc": {"quantity": -qty_to_buy}}
        )

        bill_items.append({
            "product_id": str(inv_doc["product_id"]),
            "product_name": product_name,
            "quantity": qty_to_buy,
            "base_price": round(base_price, 2),
            "discount_percentage": auto_discount,
            "unit_price": round(final_price, 2),
            "total": round(final_price * qty_to_buy, 2),
        })

        sales.append({
            "product_id": inv_doc["product_id"],
            "quantity_sold": qty_to_buy,
            "date": datetime.utcnow()
        })

    if not bill_items:
        return jsonify({"error": "No valid items to checkout"}), 400

    subtotal = sum(i["total"] for i in bill_items)
    tax_percent = float(data.get("tax_percent", 0) or 0)
    tax_amount = round(subtotal * tax_percent / 100, 2)
    extra_discount_amount = round(subtotal * discount_override / 100, 2)
    total = round(subtotal + tax_amount - extra_discount_amount, 2)

    bill_doc = {
        "customer_name": customer_name,
        "items": bill_items,
        "subtotal": round(subtotal, 2),
        "tax_percent": tax_percent,
        "tax_amount": tax_amount,
        "discount_percent": discount_override,
        "discount_amount": extra_discount_amount,
        "total": total,
        "created_at": datetime.utcnow(),
        "username": request.current_user.get("username", ""),
    }

    result = db["bills"].insert_one(bill_doc)

    if sales:
        db["sales"].insert_many(sales)

    return jsonify({
        "message": "Checkout successful",
        "bill_id": str(result.inserted_id),
        "bill": {**bill_doc, "_id": str(result.inserted_id), "created_at": bill_doc["created_at"].isoformat()}
    }), 200


# ── Invoice lookup ─────────────────────────────────────────────────────────────

@billing_bp.route("/billing/invoice/<bill_id>", methods=["GET"])
@token_required
def get_invoice(bill_id):
    db = _get_db()
    try:
        oid = ObjectId(bill_id)
    except Exception:
        return jsonify({"error": "Invalid bill ID"}), 400

    bill = db["bills"].find_one({"_id": oid})
    if not bill:
        return jsonify({"error": "Invoice not found"}), 404

    bill["_id"] = str(bill["_id"])
    bill["created_at"] = bill["created_at"].isoformat()
    return jsonify(bill), 200


# ── Billing history ────────────────────────────────────────────────────────────

@billing_bp.route("/billing/history", methods=["GET"])
@token_required
def get_billing_history():
    db = _get_db()
    bills = list(db["bills"].find().sort("created_at", -1).limit(50))
    result = []
    for b in bills:
        b["_id"] = str(b["_id"])
        b["created_at"] = b["created_at"].isoformat()
        result.append(b)
    return jsonify(result), 200
