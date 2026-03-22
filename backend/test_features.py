import requests
import sys

BASE_URL = "http://127.0.0.1:5000"

def get_token():
    r = requests.post(f"{BASE_URL}/login", json={"username": "admin", "password": "admin123"})
    if r.status_code != 200:
        print("Login failed", r.text)
        sys.exit(1)
    return r.json()["token"]

token = get_token()
headers = {"Authorization": f"Bearer {token}"}

print("1. Testing GET /settings/discount")
r = requests.get(f"{BASE_URL}/settings/discount", headers=headers)
print("Status:", r.status_code)
if r.status_code != 200: sys.exit(1)

print("2. Testing PUT /settings/discount")
rules = [{"days": 2, "discount": 50.0}, {"days": 10, "discount": 25.0}]
r = requests.put(f"{BASE_URL}/settings/discount", json=rules, headers=headers)
print("Status:", r.status_code)
if r.status_code != 200: sys.exit(1)

print("3. Testing GET /inventory")
r = requests.get(f"{BASE_URL}/inventory", headers=headers)
print("Status:", r.status_code)
if r.status_code != 200: sys.exit(1)
inv = r.json()
if not inv:
    print("Inventory empty, skipping checkout test.")
    sys.exit(0)

test_item = inv[0]
print(f"Chosen item: {test_item['product_name']}, Qty logic available: {test_item['quantity']}")

if test_item['quantity'] < 1:
    print("Not enough quantity in first item to test checkout")
    sys.exit(0)

print("4. Testing POST /billing/checkout")
payload = {
    "items": [
        {"inventory_id": test_item["_id"], "quantity": 1}
    ]
}
r = requests.post(f"{BASE_URL}/billing/checkout", json=payload, headers=headers)
print("Status:", r.status_code, r.text)
if r.status_code != 200: sys.exit(1)

print("5. Verifying Inventory Deduction")
r = requests.get(f"{BASE_URL}/inventory", headers=headers)
new_inv = [i for i in r.json() if i["_id"] == test_item["_id"]][0]
print(f"Old Qty: {test_item['quantity']} -> New Qty: {new_inv['quantity']}")

if new_inv['quantity'] != test_item['quantity'] - 1:
    print("Deduction failed!")
    sys.exit(1)

print("ALL TESTS PASSED SUCCESSFULLY.")
