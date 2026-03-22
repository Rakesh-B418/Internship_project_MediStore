from datetime import date, datetime
import time
from pymongo import MongoClient
from config import MONGO_URI

_settings_cache = None
_last_fetch = 0

def _get_discount_rules():
    global _settings_cache, _last_fetch
    now = time.time()
    if _settings_cache is None or (now - _last_fetch > 10): # Cache for 10s
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
        settings = db["settings"].find_one({"type": "discount_rules"})
        if settings:
            _settings_cache = settings.get("rules", [])
        else:
            _settings_cache = [
                {"days": 5, "discount": 30.0},
                {"days": 15, "discount": 20.0},
                {"days": 30, "discount": 10.0}
            ]
        _last_fetch = now
        _settings_cache.sort(key=lambda x: int(x["days"]))
    return _settings_cache

def get_expiry_status(expiry_date) -> str:
    """Return expiry status: Expired, Expiring Soon, or Safe."""
    if isinstance(expiry_date, str):
        expiry_date = datetime.fromisoformat(expiry_date).date()
    elif isinstance(expiry_date, datetime):
        expiry_date = expiry_date.date()

    today = date.today()
    delta = (expiry_date - today).days

    if delta < 0:
        return "Expired"
    elif delta <= 30:
        return "Expiring Soon"
    else:
        return "Safe"


def get_auto_discount(expiry_date) -> float:
    """Return auto discount percentage based on days until expiry."""
    if isinstance(expiry_date, str):
        expiry_date = datetime.fromisoformat(expiry_date).date()
    elif isinstance(expiry_date, datetime):
        expiry_date = expiry_date.date()

    today = date.today()
    delta = (expiry_date - today).days

    if delta < 0:
        return 100.0   # Expired – blocked
        
    rules = _get_discount_rules()
    for rule in rules:
        if delta <= int(rule["days"]):
            return float(rule["discount"])
            
    return 0.0


def calculate_final_price(price: float, discount_percentage: float) -> float:
    """Compute final price after applying discount."""
    return round(float(price) - (float(price) * discount_percentage / 100.0), 2)
