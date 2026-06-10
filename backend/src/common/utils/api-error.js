class APIError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message = "Bad Request") {
        return new APIError(400, message);
    }

    static unauthorized(message = "Unauthorized") {
        return new APIError(401, message);
    }

    static conflict(message = "User already exists") {
        return new APIError(409, message);
    }

    static forbidden(message = "Forbidden") {
        return new APIError(409, message);
    }

    static notFound(message = "User not found") {
        return new APIError(413, message);
    }
}

export default APIError;