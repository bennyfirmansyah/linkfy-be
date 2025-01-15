const { Users } = require("../../models");
const { Op } = require("sequelize");

const allUser = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await Users.findAll({
            where: {
                id: {
                    [Op.ne]: userId, // Menggunakan operator 'not equal' untuk mengecualikan userId
                },
            },
            attributes: ["id", "nama", "email"]
        });

        if (!user || user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan",
            });
        }

        return res.json({
            success: true,
            data: user,
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = { allUser };