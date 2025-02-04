const { AksesLogs } = require("../../models");
const { Op, Sequelize } = require("sequelize");

const getTodayStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const stats = await AksesLogs.count({
            where: {
                createdAt: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            }
        });

        return res.json({
            success: true,
            data: {
                date: today,
                totalAccess: stats
            }
        });
    } catch (error) {
        console.error('Error getting today stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getHourlyStats = async (req, res) => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

        const stats = await AksesLogs.findAll({
            attributes: [
                [Sequelize.fn('date_trunc', 'hour', Sequelize.col('createdAt')), 'hour'],
                [Sequelize.fn('count', '*'), 'count']
            ],
            where: {
                createdAt: {
                    [Op.gte]: oneDayAgo,
                    [Op.lte]: now
                }
            },
            group: [Sequelize.fn('date_trunc', 'hour', Sequelize.col('createdAt'))],
            order: [[Sequelize.fn('date_trunc', 'hour', Sequelize.col('createdAt')), 'ASC']]
        });

        // Fill in missing hours with zero counts
        const hourlyData = new Array(24).fill(null).map((_, index) => {
            const hour = new Date(now - (23 - index) * 60 * 60 * 1000);
            const found = stats.find(stat => 
                new Date(stat.dataValues.hour).getHours() === hour.getHours()
            );
            return {
                hour: hour.toISOString(),
                count: found ? parseInt(found.dataValues.count) : 0
            };
        });

        return res.json({
            success: true,
            data: hourlyData
        });
    } catch (error) {
        console.error('Error getting hourly stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getDailyStats = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const stats = await AksesLogs.findAll({
            attributes: [
                [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'day'],
                [Sequelize.fn('count', '*'), 'count']
            ],
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo,
                    [Op.lte]: now
                }
            },
            group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt'))],
            order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'ASC']]
        });

        // Fill in missing days with zero counts
        const dailyData = new Array(30).fill(null).map((_, index) => {
            const day = new Date(now - (29 - index) * 24 * 60 * 60 * 1000);
            const found = stats.find(stat => 
                new Date(stat.dataValues.day).toDateString() === day.toDateString()
            );
            return {
                day: day.toISOString().split('T')[0],
                count: found ? parseInt(found.dataValues.count) : 0
            };
        });

        return res.json({
            success: true,
            data: dailyData
        });
    } catch (error) {
        console.error('Error getting daily stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getRealTimeSummary = async (req, res) => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now - 60 * 60 * 1000);

        const [hourlyCount, todayCount, totalCount] = await Promise.all([
            // Last hour count
            AksesLogs.count({
                where: {
                    createdAt: {
                        [Op.gte]: oneHourAgo
                    }
                }
            }),
            // Today's count
            AksesLogs.count({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(now.setHours(0,0,0,0))
                    }
                }
            }),
            // Total count
            AksesLogs.count()
        ]);

        return res.json({
            success: true,
            data: {
                lastHour: hourlyCount,
                today: todayCount,
                total: totalCount,
                timestamp: now.toISOString()
            }
        });
    } catch (error) {
        console.error('Error getting realtime summary:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    getTodayStats,
    getHourlyStats,
    getDailyStats,
    getRealTimeSummary
};