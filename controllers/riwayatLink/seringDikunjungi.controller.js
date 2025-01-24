const { RiwayatLink, Links } = require("../../models");
const { Sequelize, Op } = require("sequelize");

const seringDikunjungi = async (req, res) => {
  const userId = req.user?.id;
  const isLoggedIn = !!userId;

  try {
    if (isLoggedIn) {
      const riwayatLink = await RiwayatLink.findAll({
        where: { id_user: userId },
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
    } else {
      // For non-logged in users, get from cookies
      const clickHistory = req.cookies.clickHistory ? JSON.parse(req.cookies.clickHistory) : [];
      
      // Count frequency of each link
      const linkCounts = {};
      clickHistory.forEach(click => {
        linkCounts[click.linkId] = (linkCounts[click.linkId] || 0) + 1;
      });

      // Sort by frequency and get top 5
      const topLinkIds = Object.entries(linkCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([linkId]) => linkId);

      // Get link details
      const links = await Links.findAll({
        where: { 
          id: topLinkIds,
          visibilitas: 'public'
        },
        attributes: ["id", "judul", "url", "gambar"],
      });

      // Format response to match logged-in user format
      const formattedData = links.map(link => ({
        id_link: link.id,
        count: linkCounts[link.id],
        Link: {
          judul: link.judul,
          url: link.url,
          gambar: link.gambar
        }
      }));

      return res.json({
        success: true,
        data: formattedData,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = { seringDikunjungi };
