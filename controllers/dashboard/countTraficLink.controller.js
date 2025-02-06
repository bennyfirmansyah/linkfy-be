const { RiwayatLink } = require("../../models");
const sequelize = require("sequelize");

const hourlyLink = async (req, res) => {
    try {
        const hourlyStats = await RiwayatLink.findAll({
            attributes: [
                [
                    sequelize.literal(
                        `TO_CHAR("createdAt", 'YYYY-MM-DD HH24:00:00')`
                    ),
                    "hour",
                ],
                [sequelize.fn("COUNT", sequelize.col("id")), "click_count"],
            ],
            group: [
                sequelize.literal(
                    `TO_CHAR("createdAt", 'YYYY-MM-DD HH24:00:00')`
                ),
            ],
            order: [
                [
                    sequelize.literal(
                        `TO_CHAR("createdAt", 'YYYY-MM-DD HH24:00:00')`
                    ),
                    "ASC",
                ],
            ],
        });

        res.status(200).json({
            success: true,
            message: "Berhasil mendapatkan statistik dashboard",
            data: hourlyStats,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const dailyLink = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const dailyStats = await RiwayatLink.findAll({
            attributes: [
                "id_link",
                [
                    sequelize.fn(
                        "date_trunc",
                        "day",
                        sequelize.col("RiwayatLink.createdAt")
                    ),
                    "day",
                ],
                [
                    sequelize.fn("COUNT", sequelize.col("RiwayatLink.id")),
                    "click_count",
                ],
            ],
            where: {
                createdAt: {
                    [sequelize.Op.gte]: thirtyDaysAgo,
                    [sequelize.Op.lte]: now,
                },
            },
            group: [
                sequelize.fn(
                    "date_trunc",
                    "day",
                    sequelize.col("RiwayatLink.createdAt")
                ),
                "RiwayatLink.id_link",
            ],
            order: [
                [
                    sequelize.fn(
                        "date_trunc",
                        "day",
                        sequelize.col("RiwayatLink.createdAt")
                    ),
                    "ASC",
                ],
                [
                    sequelize.fn("COUNT", sequelize.col("RiwayatLink.id")),
                    "DESC",
                ],
            ],
        });

        // Format the data
        const dailyData = new Array(30).fill(null).map((_, index) => {
            const day = new Date(now - (29 - index) * 24 * 60 * 60 * 1000);
            const dayString = day.toISOString().split("T")[0];

            const linksForDay = dailyStats
                .filter(
                    (link) =>
                        new Date(link.dataValues.day)
                            .toISOString()
                            .split("T")[0] === dayString
                )
                .map((link) => ({
                    id_link: link.id_link,
                    click_count: parseInt(link.dataValues.click_count),
                }));

            return {
                day: dayString,
                click_count: linksForDay.reduce(
                    (acc, curr) => acc + curr.click_count,
                    0
                ),
            };
        });
        res.status(200).json({
            success: true,
            message: "Berhasil mendapatkan statistik dashboard",
            data: dailyData,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { hourlyLink, dailyLink };
