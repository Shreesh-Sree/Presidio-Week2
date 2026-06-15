import asyncio
import time
from flask import Blueprint, jsonify
import httpx

async_bp = Blueprint('async', __name__)

# Simulates a slow API call or database query using asyncio.sleep
async def simulate_slow_fetch_async(resource_name, delay=0.2):
    await asyncio.sleep(delay)
    return {
        "resource": resource_name,
        "status": "loaded",
        "fetchTime": datetime_now_iso()
    }

# Simulates a slow API call synchronously using time.sleep
def simulate_slow_fetch_sync(resource_name, delay=0.2):
    time.sleep(delay)
    return {
        "resource": resource_name,
        "status": "loaded",
        "fetchTime": datetime_now_iso()
    }

def datetime_now_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()

# ==========================================
# 1. SYNCHRONOUS ROUTE (Sequential execution)
# ==========================================
@async_bp.route('/sequential', methods=['GET'])
def get_sequential():
    start_time = time.time()
    
    # 3 sequential blocking network calls
    res1 = simulate_slow_fetch_sync("User Profile Service", 0.2)
    res2 = simulate_slow_fetch_sync("Cloud Database Meta", 0.2)
    res3 = simulate_slow_fetch_sync("Storage CDN Config", 0.2)
    
    duration = time.time() - start_time
    
    return jsonify({
        "pattern": "Python Synchronous (Sequential)",
        "durationSeconds": round(duration, 4),
        "durationMs": round(duration * 1000, 2),
        "message": "Processed requests one-by-one (synchronously)",
        "data": [res1, res2, res3]
    }), 200

# ==========================================
# 2. ASYNCHRONOUS ROUTE (Concurrent execution with asyncio.gather)
# ==========================================
@async_bp.route('/concurrent', methods=['GET'])
async def get_concurrent():
    start_time = time.time()
    
    # Run 3 asynchronous non-blocking tasks concurrently using asyncio.gather
    results = await asyncio.gather(
        simulate_slow_fetch_async("User Profile Service", 0.2),
        simulate_slow_fetch_async("Cloud Database Meta", 0.2),
        simulate_slow_fetch_async("Storage CDN Config", 0.2)
    )
    
    duration = time.time() - start_time
    
    return jsonify({
        "pattern": "Python Asynchronous (asyncio.gather)",
        "durationSeconds": round(duration, 4),
        "durationMs": round(duration * 1000, 2),
        "message": "Processed requests concurrently (asynchronously)",
        "data": results
    }), 200
