const { RiwayatLink, Links } = require("../../models");
const { Sequelize, Op } = require("sequelize");

const seringDikunjungi = async (req, res) => {
  const userId = req.user.id;
  try {
    const riwayatLink = await RiwayatLink.findAll({
      where: { id_user: userId  },
      attributes: [
        "id_link",
        [Sequelize.fn("COUNT", Sequelize.col("id_link")), "count"],
      ],
      group: ["id_link", "Link.id"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("id_link")), "DESC"]],
      include: {
        model: Links,
        attributes: ["judul", "url", "gambar"],
      },
      limit: 5,
    });

    if (!riwayatLink || riwayatLink.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Riwayat tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: riwayatLink,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { seringDikunjungi };
