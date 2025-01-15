const { Riwayat } = require("../../models");
const { Sequelize, Op } = require("sequelize");

const riwayatKueri = async (req, res) => {
    const userId = req.user.id;

    try {
        const riwayat = await Riwayat.findAll({
            where: { 
                id_user: userId,
                query: {
                    [Op.not]: null
                }
            },
            attributes: [
                'query', [Sequelize.fn('MAX', Sequelize.col('createdAt')), 'createdAt']
            ],
            group: ['query'],
            limit: 7,
            order: [['createdAt', 'DESC']]
        });

        return res.json({
            success: true,
            count: riwayat.length,
            data: riwayat
        });

    } catch (error) {
        console.error('Error in riwayatKueri:', {
            userId,
            error: error.message
        });

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { riwayatKueri };