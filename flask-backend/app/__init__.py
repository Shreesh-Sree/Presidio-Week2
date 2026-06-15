import time
import traceback
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

# Import blueprints
from app.blueprints.task_routes import tasks_bp
from app.blueprints.async_routes import async_bp

# Import custom errors
from app.utils.errors import APIException, NotFoundError, ValidationError
from app.middleware.decorators import require_api_key

def create_app():
    app = Flask(__name__)
    
    # 1. Enable CORS for all API calls
    CORS(app)

    # 2. Register Blueprints
    app.register_blueprint(tasks_bp, url_prefix='/api/v1/tasks')
    app.register_blueprint(async_bp, url_prefix='/api/v1/async')

    # ==========================================
    # GLOBAL REQUEST LIFECYCLE HOOKS (Middleware)
    # ==========================================
    
    @app.before_request
    def start_timer():
        # Store request start time in flask 'g' context
        g.start_time = time.time()
        print(f"[FLASK-GLOBAL] Incoming: {request.method} {request.path}")

    @app.after_request
    def log_response(response):
        # Calculate time taken for execution
        duration = 0.0
        if hasattr(g, 'start_time'):
            duration = (time.time() - g.start_time) * 1000
            
        print(f"[FLASK-GLOBAL] Outgoing: {request.method} {request.path} - Status: {response.status_code} - Done in {duration:.2f}ms")
        
        # Add custom headers to demonstrate WSGI response manipulation
        response.headers['X-Processed-By'] = 'Flask-Backend'
        response.headers['X-Response-Time-Ms'] = f"{duration:.2f}"
        
        return response

    # ==========================================
    # SECURE & ERROR-TEST ENDPOINTS
    # ==========================================
    
    @app.route('/api/v1/secure/data', methods=['GET'])
    @require_api_key
    def secure_data():
        """Secured with decorator-based route-specific middleware"""
        return jsonify({
            "status": "success",
            "message": "Authorized access successful in Flask. You unlocked the secret Python data!",
            "user": g.user,
            "data": {
                "internshipTopic": "Backend Integration & Cloud",
                "secretCode": "PYTHON_FLASK_WEEK_2_COMPLETED",
                "serverTime": time.time()
            }
        }), 200

    @app.route('/api/v1/errors/validation', methods=['GET'])
    def trigger_validation_error():
        raise ValidationError('Email address format is invalid.')

    @app.route('/api/v1/errors/server-crash', methods=['GET'])
    def trigger_server_crash():
        # Simulating runtime error
        none_object = None
        none_object.some_attribute_that_does_not_exist()

    # ==========================================
    # CENTRAL ERROR HANDLERS (Middleware error catchers)
    # ==========================================
    
    @app.errorhandler(APIException)
    def handle_api_exception(error):
        """Handle custom application exceptions"""
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle built-in Werkzeug HTTP exceptions (e.g. 404, 405)"""
        return jsonify({
            "status": "fail",
            "message": error.description,
            "statusCode": error.code
        }), error.code

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        """Handle all other unhandled runtime code crashes (500)"""
        print(f"[FLASK-ERROR] Critical unhandled crash: {str(error)}")
        traceback.print_exc()
        
        return jsonify({
            "status": "error",
            "message": f"Flask Internal Server Error: {str(error)}",
            "statusCode": 500,
            "stack": traceback.format_exc(),
            "path": request.path,
            "method": request.method
        }), 500

    return app
