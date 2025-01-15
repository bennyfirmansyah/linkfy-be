const { Links, RiwayatLink, Riwayat, ShareLink } = require('../../models');
const { Sequelize, Op } = require('sequelize');

const klikLink = async (req, res) => {
    const userId = req.user.id;
    const { linkId } = req.body;

    try {
        // Validasi link exists dan user punya akses
        const link = await Links.findOne({
            where: {
                id: linkId,
                [Op.or]: [
                    { visibilitas: 'public' },
                    { 
                        visibilitas: 'private',
                        [Op.or]: [
                            { id_user: userId },
                            { '$ShareLinks.id_user$': userId }
                        ]
                    }
                ]
            },
            include: [{
                model: ShareLink,
                required: false
            }]
        });

        if (!link) {
            return res.status(404).json({
                status: false,
                message: 'Link tidak ditemukan atau Anda tidak memiliki akses'
            });
        }

        const latestRiwayat = await Riwayat.findOne({
            where: { id_user: userId },
            order: [['createdAt', 'DESC']],
        });
        if (!latestRiwayat) {
            return res.status(404).json({
                success: false,
                message: 'Riwayat tidak ditemukan'
            });
        }

        // Catat riwayat klik
        await RiwayatLink.create({
            id_link: linkId,
            id_riwayat: latestRiwayat.id,
        });

        return res.json({
            status: true,
            message: 'Riwayat klik berhasil dicatat',
        });

    } catch (error) {
        console.error('Error in klikLink:', error);
        return res.status(500).json({
            status: false,
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

module.exports = { klikLink };