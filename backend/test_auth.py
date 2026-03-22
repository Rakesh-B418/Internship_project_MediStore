import requests

print("Testing /register...")
res = requests.post("http://127.0.0.1:5000/register", json={"username": "bob", "password": "bobpassword"})
print(f"Status: {res.status_code}")
print(f"Body: {res.text}")

print("\nTesting /forgot-password...")
res2 = requests.post("http://127.0.0.1:5000/forgot-password", json={"username": "bob"})
print(f"Status: {res2.status_code}")
print(f"Body: {res2.text}")
