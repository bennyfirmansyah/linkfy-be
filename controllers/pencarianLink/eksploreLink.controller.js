const { Links, ShareLink } = require("../../models");
const { Op } = require("sequelize");

const eksploreLink = async (req, res) => {
  const userId = req.user.id;
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const offset = Math.max(0, parseInt(req.query.offset) || 0); // Lazy column menggunakan offset

  try {
    // Mendapatkan link yang dibagikan ke user
    const sharedLinks = await ShareLink.findAll({
      where: { id_user: userId },
      attributes: ["id_link"],
    });

    const sharedLinkIds = sharedLinks.map((share) => share.id_link);

    // Query data link
    const links = await Links.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { visibilitas: "public" },
              {
                [Op.and]: [
                  { visibilitas: "private" },
                  {
                    [Op.or]: [
                      { id: { [Op.in]: sharedLinkIds } }, // Link yang dibagikan ke user
                      { id_user: userId }, // Link milik user sendiri
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      attributes: ["id", "judul", "url", "gambar", "deskripsi", "visibilitas", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    // Hitung total data untuk menentukan apakah ada lebih banyak data
    const totalLinks = await Links.count({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { visibilitas: "public" },
              {
                [Op.and]: [
                  { visibilitas: "private" },
                  {
                    [Op.or]: [
                      { id: { [Op.in]: sharedLinkIds } }, // Link yang dibagikan ke user
                      { id_user: userId }, // Link milik user sendiri
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    // Tentukan apakah masih ada data yang belum dimuat
    const hasMore = offset + links.length < totalLinks;

    return res.json({
      status: true,
      data: links,
      hasMore, // Indikator untuk lazy column
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
