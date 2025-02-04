const { Links, ShareLink, Users } = require("../../models");
const { Op } = require("sequelize");

const eksploreLink = async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role || "public";
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const offset = Math.max(0, parseInt(req.query.offset) || 0);
  const kategori = req.query.kategori; // Ambil parameter kategori dari query string

  try {
    let whereCondition;
    if (userRole === "admin") {
      whereCondition = {};
    } else if (userRole === "user") {
      const sharedLinks = await ShareLink.findAll({
        where: { id_user: userId },
        attributes: ["id_link"],
      });
      const sharedLinkIds = sharedLinks.map((share) => share.id_link);
      
      whereCondition = {
        [Op.or]: [
          { visibilitas: "public" },
          {
            [Op.and]: [
              { visibilitas: "private" },
              {
                [Op.or]: [
                  { id: { [Op.in]: sharedLinkIds } },
                  { id_user: userId },
                ],
              },
            ],
          },
        ],
      };
    } else {
      // For public and non-logged in users
      whereCondition = { visibilitas: "public" };
    }

    // Tambahkan filter kategori jika ada
    if (kategori) {
      whereCondition.kategori = kategori; // Filter berdasarkan kolom kategori di tabel Links
    }

    const links = await Links.findAll({
      where: whereCondition,
      include: {
        model: Users,
        attributes: ["nama", "email"],
      },
      attributes: ["id", "judul", "url", "gambar", "deskripsi", "visibilitas", "updatedAt", "kategori"],
      order: [["updatedAt", "DESC"]],
      limit,
      offset,
    });

    const totalLinks = await Links.count({
      where: whereCondition,
    });

    const hasMore = offset + links.length < totalLinks;

    return res.json({
      status: true,
      data: links,
      hasMore,
    });
  } catch (error) {
    console.error("Error in exploreLink:", error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

module.exports = { eksploreLink };