import AppError from "../utils/AppError.js";
export const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Something went wrong";
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // Prisma errors
    else if (err.code === "P2002") {
        statusCode = 400;
        message = "Duplicate field value";
    }
    // Zod errors
    else if (err.name === "ZodError") {
        statusCode = 400;
        message = err.errors.map((e) => e.message).join(", ");
    }
    // JWT errors
    else if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }
    // Custom errors
    else if (err.message) {
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
    });
};
//# sourceMappingURL=globalErrorHandler.js.map