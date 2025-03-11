const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract Bearer token

    if (!token) {
        return next(new ApiError(403, "Token is required"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next(); // Continue to the next middleware or route handler
    } catch (err) {
        return next(new ApiError(401, "Invalid or expired token"));
    }
};

module.exports = authenticate;
