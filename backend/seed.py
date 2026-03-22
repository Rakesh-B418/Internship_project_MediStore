"""
Seed script: populates MongoDB with a demo user and their data.
Run:  python seed.py

Architecture:
  - Central DB (supplysense_central): stores users collection
  - Per-user DB (user_admin): stores products, inventory, sales
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import bcrypt
from datetime import datetime, timedelta
from pymongo import MongoClient
from config import MONGO_URI
from utils.db_manager import CENTRAL_DB_NAME, sanitize_db_name

client = MongoClient(MONGO_URI)
central_db = client[CENTRAL_DB_NAME]

# ── Seed user ─────────────────────────────────────────────────────────────────
DEMO_USERNAME = "admin"
DEMO_PASSWORD = "admin123"
db_name = sanitize_db_name(DEMO_USERNAME)  # -> "user_admin"

# Clear central users + user-specific DB
central_db.users.drop()
user_db = client[db_name]
user_db.products.drop()
user_db.inventory.drop()
user_db.sales.drop()
user_db.bills.drop()
print("Existing collections dropped.")

hashed_pw = bcrypt.hashpw(DEMO_PASSWORD.encode("utf-8"), bcrypt.gensalt())
central_db.users.insert_one({
    "username": DEMO_USERNAME,
    "password": hashed_pw,
    "db_name": db_name,
})
print(f"User created  ->  username: {DEMO_USERNAME} | password: {DEMO_PASSWORD}")
print(f"User database ->  {db_name}")

# ── Products (stored in user_admin) ───────────────────────────────────────────
products = [
    {"name": "Paracetamol 500mg",  "category": "Tablet",    "price": 2.99},
    {"name": "Dolo 650",           "category": "Tablet",    "price": 4.49},
    {"name": "Cough Syrup",        "category": "Syrup",     "price": 5.99},
    {"name": "Amoxicillin 250mg",  "category": "Capsule",   "price": 3.49},
    {"name": "Vitamin C",          "category": "Tablet",    "price": 3.19},
    {"name": "Insulin Glargine",   "category": "Injection", "price": 12.79},
    {"name": "Ibuprofen 400mg",    "category": "Tablet",    "price": 4.99},
    {"name": "Cetirizine 10mg",    "category": "Tablet",    "price": 8.99},
    {"name": "Dietary Supplement", "category": "Syrup",     "price": 6.49},
    {"name": "Azithromycin 500mg", "category": "Tablet",    "price": 1.99},
    {"name": "Omeprazole 20mg",    "category": "Capsule",   "price": 1.49},
    {"name": "Saline Solution",    "category": "Injection", "price": 3.99},
]
result = user_db.products.insert_many(products)
pids = result.inserted_ids
print(f"{len(pids)} products inserted.")


def days_from_now(n: int) -> datetime:
    return datetime.utcnow() + timedelta(days=n)


# ── Inventory ─────────────────────────────────────────────────────────────────
inventory = [
    {"product_id": pids[0],  "quantity": 50, "expiry_date": days_from_now(15)},
    {"product_id": pids[1],  "quantity": 30, "expiry_date": days_from_now(20)},
    {"product_id": pids[5],  "quantity": 25, "expiry_date": days_from_now(12)},
    {"product_id": pids[9],  "quantity": 40, "expiry_date": days_from_now(30)},
    {"product_id": pids[10], "quantity": 60, "expiry_date": days_from_now(25)},
    {"product_id": pids[2],  "quantity": 12, "expiry_date": days_from_now(7)},
    {"product_id": pids[3],  "quantity": 18, "expiry_date": days_from_now(5)},
    {"product_id": pids[6],  "quantity": 8,  "expiry_date": days_from_now(4)},
    {"product_id": pids[7],  "quantity": 5,  "expiry_date": days_from_now(2)},
    {"product_id": pids[11], "quantity": 14, "expiry_date": days_from_now(1)},
    {"product_id": pids[4],  "quantity": 3,  "expiry_date": days_from_now(-2)},
    {"product_id": pids[8],  "quantity": 7,  "expiry_date": days_from_now(-5)},
]
user_db.inventory.insert_many(inventory)
print(f"{len(inventory)} inventory records inserted.")

# ── Sales ─────────────────────────────────────────────────────────────────────
import random
sales = []
for _ in range(60):
    pid = random.choice(pids)
    sales.append({
        "product_id": pid,
        "quantity_sold": random.randint(1, 20),
        "date": days_from_now(-random.randint(0, 30)),
    })
user_db.sales.insert_many(sales)
print(f"{len(sales)} sales records inserted.")
print("\nOK Database seeded successfully!")
