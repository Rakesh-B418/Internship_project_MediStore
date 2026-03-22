import requests
import sys

BASE_URL = "http://localhost:5000"

def run_tests():
    # 1. Login
    res = requests.post(f"{BASE_URL}/login", json={"username": "admin", "password": "admin123"})
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return
    token = res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login OK")

    # 2. Products
    res = requests.get(f"{BASE_URL}/products", headers=headers)
    if res.status_code != 200:
        print(f"Get products failed: {res.text}")
        return
    products = res.json()
    print(f"Get products OK: {len(products)} products found.")
    
    # 3. Inventory
    res = requests.get(f"{BASE_URL}/inventory", headers=headers)
    if res.status_code != 200:
        print(f"Get inventory failed: {res.text}")
        return
    inventory = res.json()
    print(f"Get inventory OK: {len(inventory)} items found.")

    # 4. Alerts
    res = requests.get(f"{BASE_URL}/alerts", headers=headers)
    if res.status_code != 200:
        print(f"Get alerts failed: {res.text}")
        return
    print("Get alerts OK.")

    # 5. Analytics
    res = requests.get(f"{BASE_URL}/analytics", headers=headers)
    if res.status_code != 200:
        print(f"Get analytics failed: {res.text}")
        return
    print("Get analytics OK.")
    
    print("ALL API TESTS PASSED SUCCESSFULLY.")

if __name__ == "__main__":
    run_tests()
