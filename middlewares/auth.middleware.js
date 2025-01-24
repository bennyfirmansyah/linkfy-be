const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (roles = []) => {
    return async (req, res, next) => {
        try {
            const currentUrl = req.originalUrl || req.url;
            const redirectUrl = req.headers.referer;
            const token = req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null;

            if (!token) {
                return res.status(401).json({
                    error: "Unauthorized - Token not provided",
                    redirect: currentUrl,
                });
            }

            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        return res.status(401).json({
                            error: "Token expired",
                            redirect: currentUrl,
                            expired: true,
                        });
                    }
                    return res.status(401).json({
                        error: "Invalid token",
                        redirect: currentUrl,
                    });
                }

                const allowedRoles =
                    typeof roles === "string" ? [roles] : roles;

                if (allowedRoles.length && !allowedRoles.includes(user.role)) {
                    return res.status(403).json({
                        error: "Forbidden - Insufficient permissions",
                        redirect: redirectUrl,
                    });
                }

                req.user = user;
                next();
            });
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            return res.status(500).json({
                error: "Authentication error",
                redirect: req.originalUrl || req.url,
            });
        }
    };
};

const optionalAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        req.user = null;
        return next();
    }

    const token = req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
            return next();
        }
        req.user = user;
        next();
    });
};

module.exports = { auth, optionalAuth };
