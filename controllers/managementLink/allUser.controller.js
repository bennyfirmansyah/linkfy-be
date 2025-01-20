const { Users } = require("../../models");
const { Op } = require("sequelize");

const allUser = async (req, res) => {
    const userId = req.user.id;
    const search = req.query.search || "";
    try {
        const user = await Users.findAll({
            where: {
                id: {
                    [Op.ne]: userId, // Menggunakan operator 'not equal' untuk mengecualikan userId
                },
                nama: {
                    [Op.iLike]: `%${search}%`, // Menggunakan operator 'iLike' untuk melakukan pencarian yang case-insensitive
                },
            },
            attributes: { exclude: ["password", "role"] },
            order: [["nama", "ASC"]],
        });

        return res.json({
            message: user.length > 0 ? "Berhasil mendapatkan data user" : "Data user tidak ditemukan",
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { allUser };
