class APIError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = "Bad Request") {
        return new APIError(400, message);
    }

    static unauthorized(message = "Unauthorized") {
        return new APIError(401, message);
    }

    // FIXED: Forbidden is HTTP 403
    static forbidden(message = "Forbidden access") {
        return new APIError(403, message);
    }

    // FIXED: Not Found is HTTP 404 (and generalized the message)
    static notFound(message = "Resource not found") {
        return new APIError(404, message);
    }

    static conflict(message = "Resource already exists") {
        return new APIError(409, message);
    }

    // NEW: Added this because we used it extensively in the Dashboard catch blocks!
    static internalServiceError(message = "Internal Server Error") {
        return new APIError(500, message);
    }
}

export default APIError;