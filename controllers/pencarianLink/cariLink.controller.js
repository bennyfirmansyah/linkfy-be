const { Users, Links, ShareLink, Riwayat } = require("../../models");
const { Sequelize, Op } = require("sequelize");
const textVectorizer = require("../../utils/textVectorizer.utils");
const { handleSearchHistory } = require("../../utils/cookieHandler.utils");
require("dotenv").config();

const cariLink = async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role || "umum";
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;
  const { q: searchQuery } = req.query;
  try {
    if (textVectorizer.isStopwordOnly(searchQuery)) {
      return res.status(200).json({
        status: true,
        message: "Data link berhasil didapatkan",
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalResults: 0,
          limit,
          hasNextPage: false,
          hasPrevPage: false
        },
        metadata: {
          searchTerms: [],
          queryVector: {}
        }
      });
    }

    const queryVector = textVectorizer.generateVector(searchQuery, "");
    
    // Save search history only for logged-in users
    if (userId) {
      await Riwayat.create({ id_user: userId, query: searchQuery });
    } else {
      const searchHistory = handleSearchHistory(req, res);
      searchHistory.add(searchQuery);
    }

    const searchTerms = Object.keys(queryVector.vector);
    const vectorKeyMatchCondition = searchTerms
      .map(term => `
        EXISTS (
          SELECT 1 
          FROM jsonb_object_keys(vector::jsonb) as keys
          WHERE keys ILIKE '%${term}%'
        )
      `)
      .join(" OR ");

    let visibilityCondition;
    if (userRole === "admin") {
      visibilityCondition = {};
    } else if (userRole === "user") {
      const sharedLinks = await ShareLink.findAll({
        where: { id_user: userId },
        attributes: ["id_link"],
      });
      const sharedLinkIds = sharedLinks.map(share => share.id_link);
      
      visibilityCondition = {
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
      visibilityCondition = { visibilitas: "public" };
    }

    const queryConfig = {
      where: {
        [Op.and]: [
          Sequelize.literal(`(${vectorKeyMatchCondition})`),
          visibilityCondition
        ],
      },
      attributes: [
        "id", "judul", "url", "deskripsi", "gambar", "visibilitas",
        "createdAt", "updatedAt", "vector", "id_user",
        [
          Sequelize.literal(`(
            SELECT COUNT(*)::float / ${searchTerms.length}
            FROM jsonb_object_keys(vector::jsonb) as keys
            WHERE ${searchTerms.map(term => `keys ILIKE '%${term}%'`).join(" OR ")}
          )`),
          "relevance_score",
        ],
        // Only include click metrics for logged-in users
        ...(userId ? [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM riwayat_links rl
              INNER JOIN users r ON r.id = rl.id_user
              WHERE rl.id_link = "Links".id
              AND r.id = '${userId}'
            )`),
            "user_clicks",
          ],
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM riwayat_links rl
              INNER JOIN users r ON r.id = rl.id_user
              WHERE rl.id_link = "Links".id
            )`),
            "total_clicks",
          ],
        ] : []),
      ],
      include: [
        {
          model: Users,
          attributes: ["nama", "email"],
        },
        ...(userRole === "user" ? [{
          model: ShareLink,
          where: { id_user: userId },
          required: false,
          attributes: ["id"],
          include: [
            {
              model: Users,
              attributes: ["nama", "email"],
            },
          ],
        }] : []),
      ],
      distinct: true,
    };

    // Get all results for processing
    const allLinks = await Links.findAll(queryConfig);

    // Process and sort results
    const processedResults = allLinks
      .map(link => {
        const similarity = textVectorizer.calculateSimilarity(
          queryVector.vector,
          link.vector
        );
        const userClicks = parseFloat(link.getDataValue("user_clicks")) || 0;
        const totalClicks = parseFloat(link.getDataValue("total_clicks")) || 0;
        const normalizedClickCount = totalClicks > 0 ? userClicks / totalClicks : 0;
        const recencyScore = totalClicks > 0
          ? Math.exp(-(Date.now() - new Date(link.updatedAt)) / (1000 * 60 * 60 * 24 * 7))
          : 0;

        const scores = {
          similarity,
          relevance: parseFloat(link.getDataValue("relevance_score")),
          clickPopularity: normalizedClickCount,
          recency: recencyScore
        };

        return {
          link: {
            id: link.id,
            judul: link.judul,
            url: link.url,
            deskripsi: link.deskripsi,
            gambar: link.gambar,
            visibilitas: link.visibilitas,
            createdAt: link.createdAt,
            updatedAt: link.updatedAt,
            pembuat: link.User ? {
              nama: link.User.nama,
              email: link.User.email
            }:{
              nama: "Tidak diketahui",
              email: "Tidak diketahui"
            },
            sharedWith: link.ShareLinks ? link.ShareLinks
              .filter(share => share.User)
              .map(share => ({
              id: share.id,
              user: {
                nama: share.User.nama,
                email: share.User.email
              }
            })) : []
          },
          scores
        };
      })
      .filter(result => result.scores.similarity > 0 || result.scores.relevance > 0)
      .sort((a, b) => {
        const getScore = (item) => {
          return (
            item.scores.similarity * 0.4 +
            item.scores.relevance * 0.2 +
            item.scores.clickPopularity * 0.2 +
            item.scores.recency * 0.2
          );
        };
        return getScore(b) - getScore(a);
      });

    // Apply pagination
    const totalResults = processedResults.length;
    const totalPages = Math.ceil(totalResults / limit);
    const paginatedResults = processedResults
      .slice(offset, offset + limit)
      .map(result => result.link);

    return res.status(200).json({
      status: true,
      message: "Data link berhasil didapatkan",
      data: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      metadata: {
        searchTerms,
        queryVector: queryVector.vector
      }
    });

  } catch (error) {
    console.error("Error in cariLink:", error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { cariLink };