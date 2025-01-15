const { Links, Riwayat, RiwayatLink } = require("../../models");
const { Op } = require("sequelize");

const terakhirDikunjungi = async (req, res) => {
    const userId = req.user.id;
    try {
        const latestRiwayat = await Riwayat.findAll({
            where: { id_user: userId },
            attributes: ["id", "createdAt"],
            order: [["createdAt", "DESC"]],
        });

        if (!latestRiwayat || latestRiwayat.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Riwayat tidak ditemukan",
            });
        }

        const riwayatIds = latestRiwayat.map((r) => r.id);

        // Get all riwayat links
        const allRiwayatLinks = await RiwayatLink.findAll({
            where: { id_riwayat: { [Op.in]: riwayatIds } },
            include: [
                {
                    model: Links,
                    attributes: ["id", "judul", "url", "gambar"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // Filter untuk mendapatkan unique id_link
        const seenLinkIds = new Set();
        const uniqueRiwayatLinks = allRiwayatLinks.filter(item => {
            const linkId = item.Link.id;
            if (seenLinkIds.has(linkId)) {
                return false;
            }
            seenLinkIds.add(linkId);
            return true;
        });

        // Ambil 5 hasil terakhir dari yang sudah difilter
        const limitedResults = uniqueRiwayatLinks.slice(0, 5);

        return res.json({
            success: true,
            data: limitedResults,
        });
    } catch (error) {
        console.error("Error in riwayatLink:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { terakhirDikunjungi };