const { Links, RiwayatLink, ShareLink } = require("../../models");
const { Op } = require("sequelize");
const { handleClickHistory } = require("../../utils/cookieHandler.utils");

const klikLink = async (req, res) => {
    const userId = req.user?.id;
    const userRole = req.user?.role || "umum";
    const { linkId } = req.body;

    try {
        let whereCondition;
        if (userRole === "admin") {
            whereCondition = { id: linkId };
        } else if (userRole === "user") {
            whereCondition = {
                id: linkId,
                [Op.or]: [
                    { visibilitas: "public" },
                    {
                        visibilitas: "private",
                        [Op.or]: [
                            { id_user: userId },
                            { "$ShareLinks.id_user$": userId },
                        ],
                    },
                ],
            };
        } else {
            whereCondition = {
                id: linkId,
                visibilitas: "public",
            };
        }

        const link = await Links.findOne({
            where: whereCondition,
            include: [
                {
                    model: ShareLink,
                    required: false,
                },
            ],
        });

        if (!link) {
            return res.status(404).json({
                status: false,
                message: "Link tidak ditemukan atau Anda tidak memiliki akses",
            });
        }

        if (userId) {
            await RiwayatLink.create({ id_link: linkId, id_user: userId });
        } else {
            const clickHistory = handleClickHistory(req, res);
            clickHistory.add(linkId);
        }

        return res.json({
            status: true,
            message: "Riwayat klik berhasil dicatat",
        });
    } catch (error) {
        console.error("Error in klikLink:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

module.exports = { klikLink };
