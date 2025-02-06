const { RiwayatLink, Links } = require("../../models");
const sequelize = require("sequelize");

const topLink = async (req, res) => {
    try {
        const topLink = await RiwayatLink.findAll({
            attributes: [
                "id_link",
                [sequelize.fn("COUNT", sequelize.col("RiwayatLink.id")), "click_count"],
            ],
            include: [
                {
                    model: Links,
                    attributes: ["judul", "url", "id"],
                    required: true,
                },
            ],
            group: ["id_link", "Link.id", "Link.judul", "Link.url"], 
            order: [[sequelize.fn("COUNT", sequelize.col("RiwayatLink.id")), "DESC"]],
            limit: 5,
        });

        res.status(200).json({
            success: true,
            message: "Berhasil mendapatkan statistik dashboard",
            data: topLink,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const topLinkDaily = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const topLinkDaily = await RiwayatLink.findAll({
            attributes: [
                "id_link",
                [sequelize.fn('date_trunc', 'day', sequelize.col('RiwayatLink.createdAt')), 'day'],
                [sequelize.fn("COUNT", sequelize.col("RiwayatLink.id")), "click_count"],
            ],
            include: [
                {
                    model: Links,
                    attributes: ["judul", "url", "id"],
                    required: true,
                },
            ],
            where: {
                createdAt: {
                    [sequelize.Op.gte]: thirtyDaysAgo,
                    [sequelize.Op.lte]: now
                }
            },
            group: [
                sequelize.fn('date_trunc', 'day', sequelize.col('RiwayatLink.createdAt')),
                "RiwayatLink.id_link",
                "Link.id",
                "Link.judul",
                "Link.url"
            ],
            order: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('RiwayatLink.createdAt')), 'ASC'],
                [sequelize.fn("COUNT", sequelize.col("RiwayatLink.id")), "DESC"]
            ],
            limit: 5
        });

        // Format the data
        const dailyData = new Array(30).fill(null).map((_, index) => {
            const day = new Date(now - (29 - index) * 24 * 60 * 60 * 1000);
            const dayString = day.toISOString().split('T')[0];
            
            const linksForDay = topLinkDaily.filter(link => 
                new Date(link.dataValues.day).toISOString().split('T')[0] === dayString
            ).map(link => ({
                id_link: link.id_link,
                judul: link.Link.judul,
                url: link.Link.url,
                click_count: parseInt(link.dataValues.click_count)
            }));

            return {
                day: dayString,
                links: linksForDay.length ? linksForDay : [],
                click_count: linksForDay.reduce((acc, curr) => acc + curr.click_count, 0)
            };
        });

        res.status(200).json({
            success: true,
            message: "Berhasil mendapatkan statistik dashboard",
            data: dailyData
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    topLink,
    topLinkDaily,
};
