from functools import wraps
from flask import request, g
from app.utils.errors import UnauthorizedError

def require_api_key(f):
    """
    Route-specific middleware decorator that validates x-api-key header.
    Mimics Node.js route-specific authMiddleware.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('x-api-key')
        
        if not api_key:
            raise UnauthorizedError('API key missing. Please provide the "x-api-key" header.')
            
        if api_key != 'presidio-secret-key':
            raise UnauthorizedError('Invalid API key. Access denied.')
            
        # Store metadata on Flask global context object 'g' for request lifecycle
        g.user = {
            "role": "intern",
            "name": "Presidio Developer",
            "permissions": ["read", "write"]
        }
        
        print(f"[FLASK-AUTH] Authenticated request from {g.user['name']} via decorator")
        return f(*args, **kwargs)
        
    return decorated_function
