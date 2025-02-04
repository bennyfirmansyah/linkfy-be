// logAccess.middleware.js
const { AksesLogs } = require("../models");
const { Op } = require("sequelize");

// Single path definition
const LOGGED_PATH = '/query-history';

// Main logging middleware
const logAccess = async (req, res, next) => {
    try {
        // Only proceed if the path matches exactly
        if (req.path !== LOGGED_PATH) {
            return next();
        }

        let ip_address = req.headers["x-real-ip"] || 
                        req.headers["x-forwarded-for"] || 
                        req.connection.remoteAddress;
        
        if (ip_address.substr(0, 7) === "::ffff:") {
            ip_address = ip_address.substr(7);
        }
        if (ip_address === "::1") {
            ip_address = "127.0.0.1";
        }

        const userId = req.user?.id || null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Single query for existing access
        const existingAccess = await AksesLogs.findOne({
            where: {
                ...(userId ? { id_user: userId } : { ip_address, id_user: null }),
                createdAt: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow,
                }
            }
        });

        // Only create if no existing access found
        if (!existingAccess) {
            await AksesLogs.create({
                id_user: userId,
                ip_address,
                user_agent: req.headers["user-agent"] || "Unknown"
            });
        }

        return next();
    } catch (error) {
        console.error("Error logging access:", {
            path: req.path,
            error: error.message
        });
        return next();
    }
};

module.exports = { logAccess };