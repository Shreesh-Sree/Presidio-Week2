class APIException(Exception):
    """Base API Exception for structured error handling in Flask"""
    def __init__(self, message, status_code=500, payload=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['status'] = 'fail' if str(self.status_code).startswith('4') else 'error'
        rv['message'] = self.message
        rv['statusCode'] = self.status_code
        return rv

class ValidationError(APIException):
    def __init__(self, message="Validation failed", payload=None):
        super().__init__(message, status_code=400, payload=payload)

class UnauthorizedError(APIException):
    def __init__(self, message="Unauthorized access", payload=None):
        super().__init__(message, status_code=401, payload=payload)

class NotFoundError(APIException):
    def __init__(self, message="Resource not found", payload=None):
        super().__init__(message, status_code=404, payload=payload)
