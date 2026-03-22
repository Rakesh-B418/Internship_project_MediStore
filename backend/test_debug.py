import sys
from app import create_app
import json

app = create_app()
app.testing = True

with app.test_client() as client:
    # 1. Login
    res = client.post("/login", json={"username": "admin", "password": "admin123"})
    if res.status_code != 200:
        print("Login failed:", res.data)
        sys.exit(1)
    
    token = res.json["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Product
    res = client.get("/products", headers=headers)
    pid = res.json[0]["_id"]

    # 3. Add Inventory
    try:
        res = client.post("/inventory", json={"product_id": pid, "quantity": "", "expiry_date": "2025-12-31"}, headers=headers)
        print("Status Code:", res.status_code)
        print("Response:", res.data)
    except Exception as e:
        import traceback
        traceback.print_exc()
