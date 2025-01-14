const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (roles = []) => {
    // Convert single role to array if string is provided
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return async (req, res, next) => {
        try {
            const currentUrl = req.originalUrl || req.url;
            const redirectUrl = req.headers.referer;

            const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1]: null;
            
            if (!token) {
                return res.status(401).json({ 
                    error: "Unauthorized - Token not provided",
                    redirect: currentUrl
                });
            }

            // Verifikasi token secara async
            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(401).json({ 
                        error: "Invalid token",
                        redirect: currentUrl
                    });
                }

                // Periksa role jika ada
                if (roles.length && !roles.includes(user.role)) {
                    return res.status(403).json({ 
                        error: "Forbidden - You don't have permission to access this resource",
                        redirect: redirectUrl,
                        userRole: user.role
                    });
                }
                
                req.user = user;
                next();
            });
        } catch (error) {
            return res.status(500).json({ 
                error: "Authentication error",
                redirect: req.originalUrl || req.url
            });
        }
    };
};

module.exports = {auth};