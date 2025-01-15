const {
  Users,
  Links,
  ShareLink,
  Riwayat,
  RiwayatLink,
} = require("../../models");
const { Sequelize, Op } = require("sequelize");
const textVectorizer = require("../../utils/textVectorizer.utils");

const cariLink = async (req, res) => {
  const userId = req.user.id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;
  const { q: searchQuery } = req.query;

  try {
    if (!searchQuery) {
      return res.status(400).json({ message: "Query tidak valid" });
    }

    // Generate vector dari query pencarian
    const queryVector = textVectorizer.generateVector(searchQuery, "");

    // Simpan riwayat pencarian
    const riwayat = await Riwayat.create({
      id_user: userId,
      query: searchQuery,
    });

    // Mendapatkan terms untuk pencarian
    const searchTerms = Object.keys(queryVector.vector);

    // Membuat kondisi SQL untuk mencocokkan key dalam JSON menggunakan ILIKE
    const vectorKeyMatchCondition = searchTerms
      .map(
        (term) => `
            EXISTS (
                SELECT 1
                FROM jsonb_object_keys(vector::jsonb) as keys
                WHERE keys ILIKE '%${term}%'
            )
        `
      )
      .join(" OR ");

    // Dapatkan daftar link yang dibagikan ke user
    const sharedLinks = await ShareLink.findAll({
      where: { id_user: userId },
      attributes: ["id_link"],
    });

    const sharedLinkIds = sharedLinks.map((share) => share.id_link);

    // Query utama dengan ILIKE matching dan kontrol visibilitas
    const links = await Links.findAll({
      where: {
        [Op.and]: [
          Sequelize.literal(`(${vectorKeyMatchCondition})`),
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
      attributes: [
        "id",
        "judul",
        "url",
        "deskripsi",
        "gambar",
        "visibilitas",
        "createdAt",
        "vector",
        "id_user",
        [
          Sequelize.literal(`(
                        SELECT COUNT(*)::float / ${searchTerms.length}
                        FROM jsonb_object_keys(vector::jsonb) as keys
                        WHERE ${searchTerms
                          .map((term) => `keys ILIKE '%${term}%'`)
                          .join(" OR ")}
                    )`),
          "relevance_score",
        ],
        [
          Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM riwayat_links rl
                        INNER JOIN riwayats r ON r.id = rl.id_riwayat
                        WHERE rl.id_link = "Links".id
                        AND r.id_user = '${userId}'
                    )`),
          "user_clicks",
        ],
        [
          Sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM riwayat_links rl
                        INNER JOIN riwayats r ON r.id = rl.id_riwayat
                        WHERE rl.id_link = "Links".id
                    )`),
          "total_clicks",
        ],
      ],
      include: [
        {
          model: Users,
          attributes: ["nama", "email"],
        },
        {
          model: ShareLink,
          where: { id_user: userId },
          required: false,
          attributes: ["id"],
        },
      ],
      order: [
        [Sequelize.literal("user_clicks"), "DESC"],
        [Sequelize.literal("relevance_score"), "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    // Proses hasil dan hitung similarity
    const results = links
      .map((link) => {
        const linkVector = link.vector;

        // Hitung kemiripan menggunakan textVectorizer
        const similarity = textVectorizer.calculateSimilarity(
          queryVector.vector,
          linkVector
        );

        // Statistik klik untuk link ini
        const userClicks = parseFloat(link.getDataValue("user_clicks")) || 0;
        const totalClicks = parseFloat(link.getDataValue("total_clicks")) || 0;

        // Normalisasi klik (0-1) dengan total maksimum klik
        const normalizedClickCount =
          totalClicks > 0 ? userClicks / totalClicks : 0;

        // Hitung skor recency (0-1) berdasarkan waktu terbaru diklik
        const recencyScore =
          totalClicks > 0
            ? Math.exp(
                -(
                  (Date.now() - new Date(link.updatedAt)) /
                  (1000 * 60 * 60 * 24 * 7)
                )
              )
            : 0;

        return {
          link: {
            ...link.toJSON(),
            similarity,
            relevance_score: parseFloat(link.getDataValue("relevance_score")),
            normalizedClickCount,
            recencyScore,
          },
          scores: {
            similarity,
            relevance: parseFloat(link.getDataValue("relevance_score")),
            clickPopularity: normalizedClickCount,
            recency: recencyScore,
          },
        };
      })
      .filter(
        (result) => result.scores.similarity > 0 || result.scores.relevance > 0
      )
      .sort((a, b) => {
        // Hitung skor gabungan berbobot
        const getScore = (item) => {
          return (
            item.scores.similarity * 0.4 + // Relevansi pencarian
            item.scores.relevance * 0.2 + // Kecocokan istilah
            item.scores.clickPopularity * 0.2 + // Popularitas klik
            item.scores.recency * 0.2
          ); // Kebaruan
        };

        return getScore(b) - getScore(a);
      });

    if (results.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Tidak ada link yang cocok ditemukan",
      });
    }

    // Pagination dan hasil akhir
    const totalData = results.length;
    const totalPage = Math.ceil(totalData / limit);
    const paginatedResults = results
      .slice((page - 1) * limit, page * limit)
      .map((result) => result.link);

    return res.json({
      status: true,
      message: "Data link berhasil didapatkan",
      totalData,
      totalPage,
      currentPage: page,
      data: paginatedResults,
      metadata: {
        searchTerms,
        queryVector: queryVector.vector,
      },
    });
  } catch (error) {
    console.error("Error in cariLink:", error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

module.exports = { cariLink };
