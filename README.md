# 💊 MediStore – Smart Inventory & Expiry Management System

> A modern full-stack web application designed to **manage medical inventory intelligently**, reduce wastage, and improve efficiency through **expiry tracking, smart alerts, and dynamic pricing**.

---

## 🚀 Overview

MediStore is built to solve a real-world problem faced by pharmacies and retail stores — **managing inventory with expiry dates**.

Traditional systems fail to:
- Track expiry effectively ❌  
- Prevent sale of expired products ❌  
- Reduce losses from unsold stock ❌  

👉 MediStore solves this by combining **inventory management + expiry intelligence + smart analytics** into one powerful system.

---

## ✨ Key Features

### 📦 Inventory Management
- Add, update, and manage medicines  
- Track stock levels in real-time  

### ⚠️ Expiry Tracking
- Automatically detects expiring and expired products  
- Prevents sale of expired medicines  

### 💸 Auto Discount System
- Applies dynamic discounts based on expiry:
  - 6–10 days → 10%  
  - 3–5 days → 20%  
  - 1–2 days → 30%  
- Helps reduce wastage and increase sales  

### 🧾 Billing / POS System
- Generate bills efficiently  
- Ensures only valid (non-expired) products are sold  

### 📊 Analytics Dashboard
- Sales trends  
- Fast-moving products  
- Expiry-related losses  

### 🔔 Smart Alerts
- Low stock alerts  
- Expiry notifications  
- Real-time updates  

---

## 🧠 How It Works
Frontend (React) → REST API (Flask) → MongoDB → Response → UI

- User interacts with the React UI  
- Requests are sent to Flask backend  
- Backend processes logic (expiry, discount, etc.)  
- Data is stored/retrieved from MongoDB  
- Results are displayed dynamically  

---

## 🛠️ Tech Stack

### 💻 Frontend
- React.js  
- Tailwind CSS  
- Vite  
- Axios  
- Framer Motion  
- React Hot Toast  
- Recharts  

### ⚙️ Backend
- Flask (Python)  
- PyJWT (Authentication)  
- bcrypt (Password Security)  
- Flask-CORS  

### 🗄️ Database
- MongoDB (PyMongo)  

---

## 🔐 Authentication

- Secure login using **JWT tokens**  
- Passwords hashed using **bcrypt**  
- Protected API routes  

---

## 📊 Core Logic

### Expiry Detection
- < 7 days → Expiring Soon  
- Expired → Blocked  

### Discount System
10 days → 0%
6–10 days → 10%
3–5 days → 20%
1–2 days → 30%
Expired → 100% (blocked)


### Final Price
Final Price = Price − (Price × Discount / 100)


---

## 🧩 Project Structure
backend/
routes/
models/
controllers/

frontend/
components/
pages/
services/


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/medistore.git
cd medistore

```
### 2️⃣ Backend Setup
```bash
cd backend
pip install -r requirements.txt

```
Create .env:
```bash
MONGO_URI=mongodb://localhost:27017/medistore_db
JWT_SECRET=your_secret_key
```
Run Backend:
```bash
python app.py
```
